// Arduino Sketch to send joystick position and button press via Serial
const int joyX = A0;
const int joyY = A1;
const int buttonPin = 6;

void setup() {
  Serial.begin(9600);
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  int xVal = analogRead(joyX);
  int yVal = analogRead(joyY);
  int buttonState = digitalRead(buttonPin);

  // Send joystick data
  Serial.print(xVal);
  Serial.print(",");
  Serial.println(yVal);

  // Send button press signal
  if (buttonState == LOW) {
    Serial.println("BTN");
    delay(200); // debounce delay so you don't get spammed
  }

  delay(20); // joystick update rate (~50 fps)
}
