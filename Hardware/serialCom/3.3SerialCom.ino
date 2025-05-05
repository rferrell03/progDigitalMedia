const int potPin = A0;
const int buttonPin = 2;
const int ledPin = 6;

const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

int mode = 0;
bool ledState = false;
bool buttonPressed = false;

void setup() {
  Serial.begin(9600);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  digitalWrite(ledPin, LOW);
}

void loop() {
  // Handle RGB channel switch button
  if (digitalRead(buttonPin) == LOW && !buttonPressed) {
    buttonPressed = true;
    mode = (mode + 1) % 3;
    delay(250); 
  }
  if (digitalRead(buttonPin) == HIGH && buttonPressed) {
    buttonPressed = false;
  }

  // Read potentiometer
  int potValue = analogRead(potPin);

  // Send data to P5.js: potValue,mode
  Serial.print(potValue);
  Serial.print(",");
  Serial.println(mode);

  // Listen for data from P5.js
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');

    // Handle LED toggle command ('1' or '0')
    if (input.length() == 1) {
      char c = input.charAt(0);
      if (c == '1') ledState = true;
      else if (c == '0') ledState = false;
      digitalWrite(ledPin, ledState ? HIGH : LOW);
    }

    // Handle full RGB update (e.g., "128,64,255\n")
    else {
      int rVal, gVal, bVal;
      int sep1 = input.indexOf(',');
      int sep2 = input.indexOf(',', sep1 + 1);

      rVal = input.substring(0, sep1).toInt();
      gVal = input.substring(sep1 + 1, sep2).toInt();
      bVal = input.substring(sep2 + 1).toInt();

      analogWrite(redPin, rVal);
      analogWrite(greenPin, gVal);
      analogWrite(bluePin, bVal);
    }
  }

  delay(50);
}
