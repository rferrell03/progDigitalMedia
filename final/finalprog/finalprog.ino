// ——— PIN CONFIG ———
const int joyXPin   = A0;  // joystick X-axis
const int led1Pin   = 5;   // LED 1
const int led2Pin   = 6;   // LED 2
const int buttonPin = 2;   // fire button

// ——— FLASH STATE ———
bool    flashing      = false;
unsigned long flashStart     = 0;
const unsigned long flashDuration   = 3000;  // total flash time (ms)
const unsigned long toggleInterval  = 100;  // blink interval (ms)

// ——— BUTTON DEBOUNCE ———
bool lastButtonState = HIGH;

void setup() {
  pinMode(joyXPin,   INPUT);
  pinMode(led1Pin,   OUTPUT);
  pinMode(led2Pin,   OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);

  Serial.begin(9600);
}

void loop() {
  unsigned long now = millis();

  // ——— 1) HANDLE INCOMING “FLASH” ———
  while (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "FLASH") {
      flashing    = true;
      flashStart  = now;
      // start both OFF so blink logic takes over
      digitalWrite(led1Pin, LOW);
      digitalWrite(led2Pin, LOW);
    }
  }

  // ——— 2) UPDATE FLASHING LEDs ———
  if (flashing) {
    unsigned long elapsed = now - flashStart;
    if (elapsed < flashDuration) {
      // both LEDs blink in unison
      bool on = ((elapsed / toggleInterval) % 2) == 0;
      digitalWrite(led1Pin, on ? HIGH : LOW);
      digitalWrite(led2Pin, on ? HIGH : LOW);
    } else {
      // done flashing
      flashing = false;
      digitalWrite(led1Pin, LOW);
      digitalWrite(led2Pin, LOW);
    }
  }

  // ——— 3) REPORT JOYSTICK ———
  int potValue = analogRead(joyXPin);
  Serial.print("{\"pot\":");
  Serial.print(potValue);
  Serial.println("}");

  // ——— 4) BUTTON PRESS → “BUTTON_PRESSED” ———
  bool reading = digitalRead(buttonPin);
  if (reading == LOW && lastButtonState == HIGH) {
    Serial.println("BUTTON_PRESSED");
  }
  lastButtonState = reading;

  // throttle loop to ~50 Hz
  delay(20);
}
