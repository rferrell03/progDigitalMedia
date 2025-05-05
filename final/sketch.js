let port, reader;
let latestLine = "";
let pot = 512, magic = 512, diff = 0;

let x = 0;
let velocity = 0;
let lastSendTime = 0;

let mappedMagicX = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textSize(14);
  textAlign(LEFT, TOP);
  x = width / 2;

  let button = createButton("Connect to Arduino");
  button.mousePressed(connect);
}

function draw() {
  background(20);

  // --- Joystick movement logic ---
  let threshold = 50;
  let center = 512;
  let offset = center - pot;

  if (abs(offset) > threshold) {
    velocity = map(offset, -512, 512, -5, 5);
  } else {
    velocity = 0;
  }

  x += velocity;
  x = constrain(x, 0, width);

  // --- Map magic to screen position
  mappedMagicX = map(magic, 0, 1023, width, 0);
  diff = abs(x - mappedMagicX);
  let mappedMinus35 = map(magic - 35, 0, 1023, width, 0);
  let mappedPlus35 = map(magic + 35, 0, 1023, width, 0);

  stroke(100, 255, 100, 120); // greenish
  line(mappedMinus35, 0, mappedMinus35, height);
  line(mappedPlus35, 0, mappedPlus35, height);
  noStroke();

  
  // --- Red danger zones
  fill(255, 0, 0, 80); // translucent red
  rect(0, 0, mappedMagicX + mappedPlus35, height); // left zone
  //rect(0, 0, windowWidth - mappedMinus35, height); // right zone


  // --- UI text
  fill(255);
  text(`x: ${x.toFixed(0)}`, 20, 20);
  text(`magic (mapped): ${mappedMagicX.toFixed(0)}`, 20, 40);
  text(`diff: ${diff.toFixed(0)}`, 20, 60);

  // --- Color based on distance
  let r = map(diff, 0, width / 2, 0, 255);
  let g = map(diff, 0, width / 2, 255, 0);
  fill(r, g, 0);

  // --- Draw square
  rectMode(CENTER);
  rect(x, height / 2, 60, 60);

  // --- Target line
  stroke(255, 100);
  line(mappedMagicX, 0, mappedMagicX, height);
  noStroke();

  // --- Send x to Arduino
  if (millis() - lastSendTime > 100 && port && port.writable) {
    let mappedX = int(map(x, 0, width, 1023, 0));
    sendToArduino(mappedX);
    lastSendTime = millis();
  }
}

async function sendToArduino(val) {
  if (!port || !port.writable) return;
  const writer = port.writable.getWriter();
  await writer.write(new TextEncoder().encode(val + "\n"));
  writer.releaseLock();
}

async function connect() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });

    reader = port.readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TransformStream(new LineBreakTransformer()))
      .getReader();

    readLoop();
  } catch (err) {
    console.error("Serial connection failed:", err);
  }
}

async function readLoop() {
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) {
      let line = value.trim();
      console.log("→", line);

      if (line.startsWith("{")) {
        try {
          let data = JSON.parse(line);
          pot = data.pot;
          magic = data.magic;
          diff = data.diff;
        } catch (e) {
          console.warn("Bad JSON:", line);
        }
      } else if (line === "BUTTON_PRESSED") {
        console.log("💥 BUTTON HIT");
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Line splitter helper
class LineBreakTransformer {
  constructor() {
    this.container = "";
  }
  transform(chunk, controller) {
    this.container += chunk;
    const lines = this.container.split("\n");
    this.container = lines.pop();
    lines.forEach(line => controller.enqueue(line));
  }
  flush(controller) {
    controller.enqueue(this.container);
  }
}
