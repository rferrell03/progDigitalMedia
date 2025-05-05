let serial;
let potValue = 0;
let currentMode = 0;
let ledState = false;

let r = 0, g = 0, b = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  serial = createSerial();

  let connectBtn = createButton('Connect to Arduino');
  connectBtn.position(10, 10);
  connectBtn.mousePressed(async () => {
    try {
      await serial.open('Arduino');
    } catch (err) {
      alert("failed to open port");
    }
  });

  let sendColorBtn = createButton('Send RGB to LED');
  sendColorBtn.position(10, 40);
  sendColorBtn.mousePressed(() => {
    if (serial.opened()) {
      serial.write(`${r},${g},${b}\n`);
    }
  });

  serial.readUntil('\n');
  textFont('monospace');
}

function draw() {
  // read from serial 
  if (serial.available()) {
    let line = serial.readUntil('\n').trim();
    if (line.length > 0) {
      let parts = line.split(',');
      if (parts.length === 2) {
        potValue = int(parts[0]);
        currentMode = int(parts[1]);
      }
    }
  }

  let mapped = int(map(potValue, 0, 1023, 0, 255));

  // update background color
  r = currentMode === 0 ? mapped : r;
  g = currentMode === 1 ? mapped : g;
  b = currentMode === 2 ? mapped : b;

  background(r, g, b);

  // draw text
  fill(255);
  textSize(16);
  text(`RGB: (${r}, ${g}, ${b})`, 10, height - 20);
}

function mousePressed() {
  ledState = !ledState;
  if (serial.opened()) {
    serial.write(ledState ? '1' : '0');
  }
}
