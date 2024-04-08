
let canvas;
let player;
let green;
let red;
let white;
let bgColor;
let shots = []; 
let aliens = []; 
let redAlienUFOThing;
let lasers = [];
let redLaser;
let score = 0;
let highScore = 0;

let alien1_a;
let alien1_b;
let alien2_a;
let alien2_b;
let alien3_a;
let alien3_b;
let alien4; 
let speed = 10; 
laserSpeed = 10; 
let alienDirection = 'left';
let chanceOfFiringLaser = 50; 
let pauseMode = false;
let pauseTime = 0;
let gameOverBool = false;
let isThereARedAlien = false;

let serial;



const synth = new Tone.Synth().toDestination();



function preload() {
  alien1_a = loadImage('images/alien1_a.png');
  alien1_b = loadImage('images/alien1_b.png');
  alien2_a = loadImage('images/alien2_a.png');
  alien2_b = loadImage('images/alien2_b.png');
  alien3_a = loadImage('images/alien3_a.png');
  alien3_b = loadImage('images/alien3_b.png');
  alien4 = loadImage('images/alien4.png');
}

function setup() {

  serial = new p5.SerialPort();  
  serial.open("/dev/tty.usbmodem1101");  
  serial.on('data', serialEvent);

  canvas = createCanvas(400, 400);
  canvas.id('spaceInvaders');
  noSmooth(); 
  green = color(51, 255, 0);
  red = color(255, 51, 0);
  white = color(255);
  bgColor = color(50);
  frameRate(10); // 
  player = new MyShip();
  createAllAliens();
  imageMode(CENTER);
  setInterval(createRedAlien, 30000);
}


function serialEvent() {
  var dataString = serial.readLine(); 
  if (dataString.length > 0) {
    var sensors = split(trim(dataString), ','); 
    if (sensors.length >= 3) {
      let joystickX = int(sensors[0]);
      let buttonState = sensors[2];

      
      let movement = map(joystickX, 0, 1023, -1, 1);

      
      let deadZone = 0.1;

      if (movement < -deadZone) {
        player.changeDirection('left');
      } else if (movement > deadZone) {
        player.changeDirection('right');
      } else {
        player.changeDirection('none');
      }

      
      if (buttonState == '1') { 
        player.fire();
      }
    }
  }
}

function draw() {
  if (focused || frameCount < 30) {
    background(bgColor);
    player.move();
    player.drawPlayer();
    player.drawExtraLives();
    drawScore();
    if (!pauseMode) { 
      
      moveAllShots();
      moveAllLasers();
      moveRedLaser();
      
      if (frameCount % speed == 0) {
        moveAllAliens();
        fireLaser();
      }
      moveRedAlien();
    }
    if (pauseMode) {
      animateNewLife();
    }
    drawAllShots();
    drawAllLasers();
    drawAllAliens();
    drawRedAlien();
    hitAlien();
    hitPlayer();
    hitRedAlien();
    if (allAliensKilled()) {
      print('all aliens killed!');
      resetAliens();
    }
  } else {
    drawUnpauseInstructions();
  }
}

function drawUnpauseInstructions() {
  noStroke();
  fill(255);
  textAlign(CENTER);
  textSize(18);
  text('click to play', width / 2, height - height/4);
}

function keyPressed() {
  if (key === ' ') {
    if (!pauseMode) {
      print('shot fired!');
      player.fire();
    }
  }
  if (keyCode === LEFT_ARROW) {
    print('directon changes!');
    player.changeDirection('left');
  }
  if (keyCode === RIGHT_ARROW) {
    player.changeDirection('right');
  }
  if ((keyCode === RETURN || keyCode === ENTER) && gameOverBool) {
    reset();
  }
  return false; 
}

function mousePressed() {}

function keyReleased() {
  if (keyIsPressed === false) {
    player.changeDirection('none');
  }
}

function drawAllShots() {
  for (let shot of shots) {
    shot.draw();
  }
}

function moveAllShots() {
  for (let shot of shots) {
    shot.move();
  }
}

function createAllAliens() {
  let startingX = 70;
  let startingY = 200;
  
  for (i = 0; i < 22; i++) {
    aliens[i] = new Alien(startingX, startingY, 20, 20, alien1_a, alien1_b, 10);
    startingX += 30;
    if (startingX > width - 30) {
      startingX = 70;
      startingY -= 30;
    }
  }
  
  for (i = 22; i < 44; i++) {
    aliens[i] = new Alien(startingX, startingY, 18, 14, alien2_a, alien2_b, 20);
    startingX += 30;
    if (startingX > width - 30) {
      startingX = 70;
      startingY -= 30;
    }
  }
 
  for (i = 44; i < 55; i++) {
    aliens[i] = new Alien(startingX, startingY, 14, 14, alien3_a, alien3_b, 40);
    startingX += 30;
    if (startingX > width - 30) {
      startingX = 70;
      startingY -= 30;
    }
  }
}

function drawAllAliens() {
  for (let alien of aliens) {
    alien.draw();
  }
}


function moveAllAliens() {
  for (let alien of aliens) {
    alien.moveHorizontal(alienDirection);
  }
  if (checkIfAliensReachedEdge()) {
    reverseAlienDirections();
    moveAllAliensDown();
  }
}

function checkIfAliensReachedEdge() {
  let edgeReached = false;
  for (let alien of aliens) {
    if ((alien.x < 15 && alien.alive) || (alien.x > width - 15 && alien.alive)) {
      edgeReached = true;
    }
  }
  return edgeReached;
}


function reverseAlienDirections() {
  if (alienDirection === 'left') {
    alienDirection = 'right';
  } else {
    alienDirection = 'left';
  }
}

function moveAllAliensDown() {
  for (let alien of aliens) {
    alien.moveVertical();
  }
}

function hitAlien() {
  for (let shot of shots) {
    for (let alien of aliens) {
      
      if (shot.x > alien.x - alien.alienWidth / 2 &&
        shot.x < alien.x + alien.alienWidth / 2 &&
        shot.y - shot.length > alien.y - alien.alienHeight / 2 &&
        shot.y - shot.length < alien.y + alien.alienHeight / 2 &&
        !shot.hit && alien.alive
      ) {
        alien.alive = false;
        shot.hit = true;
        score += alien.points; 

        const now = Tone.now();
        synth.triggerAttackRelease("G4", "16n", now);
        synth.triggerAttackRelease("E4", "16n", now + 0.2);
        synth.triggerAttackRelease("C4", "16n", now + 0.4);        
      }
    }
  }
}


function allAliensKilled() {
  let bool = true;
  for (let alien of aliens) {
    if (alien.alive) {
      bool = false;
    }
  }
  return bool;
}


function resetAliens() {
  createAllAliens();
  redAlienUFOThing.x = 0 - redAlienUFOThing.shipWidth; 
  if (speed > 2) {
    speed -= 2;
  }
  chanceOfFiringLaser += 10;

}

function fireLaser() {
  
  if (random(100) < chanceOfFiringLaser) {
    let i = floor(random(aliens.length));
    if (aliens[i].alive) {
      let l = new Laser(aliens[i].x, aliens[i].y + (aliens[i].alienHeight / 2), laserSpeed, white);
      lasers.push(l);
    }
  }
}


function drawAllLasers() {
  for (let laser of lasers) {
    laser.draw();
  }
}


function moveAllLasers() {
  for (let laser of lasers) {
    laser.move();
  }
}


function drawScore() {
  noStroke();
  fill(255);
  textSize(14);
  textAlign(LEFT);
  text('LIVES: ', width - 175, 28);
  text('SCORE:', 25, 28);
  
  if (highScore > 0 && score > highScore) {
    fill(red);
  }
  text(score, 85, 28);
}


function hitPlayer() {
  for (let laser of lasers) {
    let leftEdgeOfLaser = laser.x - 2;
    let rightEdgeOfLaser = laser.x + 2;
    let frontOfLaser = laser.y + 8;
    let backOfLaser = laser.y;
    let leftEdgeOfShip = player.x - (player.shipWidth / 2);
    let rightEdgeOfShip = player.x + (player.shipWidth / 2);
    let frontOfShip = player.y - (player.shipHeight / 2);
    let backOfShip = player.y + (player.shipHeight / 2);

  
    if (rightEdgeOfLaser > leftEdgeOfShip &&
      leftEdgeOfLaser < rightEdgeOfShip &&
      frontOfLaser > frontOfShip &&
      backOfLaser < backOfShip &&
      !laser.used) {
      print('player hit!!!');
      laser.used = true; 
      if (player.lives > 0) {
        lifeLost();
        const now = Tone.now();
        synth.triggerAttackRelease("A3", "8n", now);
        synth.triggerAttackRelease("C4", "8n", now + 0.5);
        synth.triggerAttackRelease("E4", "8n", now + 1.0);
      }
      if (player.lives == 0) {
        gameOver();
      }
    }
  }
}


function levelUp() {}


function lifeLost() {
  pauseTime = frameCount;
  print('life lost!');
  player.color = red;
  pauseMode = true;
  serial.write('1');
}


function animateNewLife() {
  print('animating new life');
  
  if ((frameCount - pauseTime > 5 && frameCount - pauseTime < 10) ||
    (frameCount - pauseTime > 15 && frameCount - pauseTime < 20) ||
    (frameCount - pauseTime > 25 && frameCount - pauseTime < 30)
  ) {
    noStroke();
    fill(bgColor);
    rectMode(CENTER);
  
    rect(player.x, player.y - 4,
      player.shipWidth + 2, player.shipHeight + 8);
  }
  
  if (frameCount - pauseTime > 30) {
    player.color = green;
    player.x = width / 2;
    pauseMode = false;
    player.lives -= 1;

    for (let laser of lasers) {
      laser.used = true;
    }
  
    for (let shot of shots) {
      shot.hit = true;
    }
  }
}


function clearAllLasers() {}


function gameOver() {
  gameOverBool = true;
  background(0, 125);
  print('game over!');
  textSize(60);
  stroke(0);
  fill(255);
  textAlign(CENTER);
  text('GAME OVER', width / 2, height / 2);
  textSize(20);
  text('Score: ' + score, width / 2, height / 2 + 50);
  if (score > highScore) {
    fill(red);
    text('NEW HIGH SCORE!!!', width / 2, height / 2 + 75);
    fill(255);
  }
  text("Press 'ENTER' to play again!", width / 2, height / 2 + 125);
  noLoop();
}


function reset() {
  highScore = score;
  score = 0;
  player = new MyShip();
  createAllAliens();
  for (let laser of lasers) {
    laser.used = true;
  }

  for (let shot of shots) {
    shot.hit = true;
  }
  loop();
}


function createRedAlien() {
  redAlienUFOThing = new RedAlien();
  isThereARedAlien = true;
  print('red alien created!');
}


function moveRedAlien() {
  if (isThereARedAlien) {
    redAlienUFOThing.move();
  }
}


function drawRedAlien() {
  if (isThereARedAlien) {
    redAlienUFOThing.draw();
  }
}

function hitRedAlien() {
  if (isThereARedAlien) {
    for (let shot of shots) {
      if (shot.x > redAlienUFOThing.x - redAlienUFOThing.alienWidth / 2 &&
        shot.x < redAlienUFOThing.x + redAlienUFOThing.alienWidth / 2 &&
        shot.y - shot.length > redAlienUFOThing.y - redAlienUFOThing.alienHeight / 2 &&
        shot.y - shot.length < redAlienUFOThing.y + redAlienUFOThing.alienHeight / 2 &&
        !shot.hit && redAlienUFOThing.alive
      ) {
        redAlienUFOThing.alive = false;
        shot.hit = true;
        score += redAlienUFOThing.points; 
      }
    }
  }
}

function moveRedLaser() {
  if (isThereARedAlien) {
    if (redAlienUFOThing.redLaserFired) {
      redLaser.move();
    }
  }
}
