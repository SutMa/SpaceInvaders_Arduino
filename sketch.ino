const int joystickXPin = A1; 
const int joystickYPin = A2; 
const int buttonPin = 4;     
const int buzzer = 2;
const int light = 7;

void setup() {
  Serial.begin(9600);
  pinMode(buttonPin, INPUT_PULLUP); 
  pinMode(buzzer, OUTPUT);
  pinMode(light, OUTPUT);
}

void loop() {
  int joystickX = analogRead(joystickXPin);
  int joystickY = analogRead(joystickYPin);
  int buttonState = !digitalRead(buttonPin); 
  int lightState = digitalRead(light);
  
  Serial.print(joystickX);
  Serial.print(",");
  Serial.print(joystickY);
  Serial.print(",");
  Serial.println(buttonState);

   if (Serial.available() > 0) {
    int incomingByte = Serial.read(); 
    
   
    if (incomingByte == '1') {
      for (int i = 0; i < 3; i++) {
        digitalWrite(light, HIGH); // Turn on the LED
        delay(250);                // Wait for 250 milliseconds
        digitalWrite(light, LOW);  // Turn off the LED
        delay(250);                // Wait for 250 milliseconds before the next blink
      }
    }
  }
  
  

  
  delay(100); 
}
