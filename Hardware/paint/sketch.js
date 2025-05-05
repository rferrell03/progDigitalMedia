let serial;
let joyX = 512, joyY = 512;
let joyCursorX, joyCursorY;
let joySensitivity = 5;

const PALETTE_WIDTH = 60;
const BOX_SIZE = 50;
const BOX_MARGIN = 5;
const SIZE_SELECTOR_BASE_Y = 575;
const SIZE_SELECTOR_COUNT = 5;
const SIZE_MULTIPLIER = 10;

const COLORS = ["red", "orange", "yellow", "green", "cyan", "blue", "magenta", "brown", "white", "black"];
const STARTING_NOTES = {
  red: "C4", orange: "D4", yellow: "E4", green: "F4", cyan: "G4",
  blue: "A4", magenta: "B4", brown: "C5", white: "D5", black: "E5"
};
const COLOR_SCALES = {
  red: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"],
  orange: ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5", "D5"],
  yellow: ["E4", "F#4", "G#4", "A4", "B4", "C#5", "D#5", "E5"],
  green: ["F4", "G4", "A4", "Bb4", "C5", "D5", "E5", "F5"],
  cyan: ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"],
  blue: ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
  magenta: ["B3", "C#4", "D4", "E4", "F#4", "G4", "A4", "B4"],
  brown: ["C4", "D4", "Eb4", "F4", "G4", "Ab4", "Bb4", "C5"],
  white: ["D4", "E4", "F4", "G4", "A4", "Bb4", "C5", "D5"],
  black: ["E4", "F#4", "G4", "A4", "B4", "C5", "D5", "E5"]
};

let colorInstruments = {};
let currentColor = "red";
let currentSize = 1;
let isNewStroke = true;
let prevX, prevY;
let noteIndex = 0;
let noteDirection = 1;
let lastNoteX, lastNoteY;
const NOTE_THRESHOLD = 75;
let totalDrawingDistance = 0;
let reverb;
let colorChangeSynth, clearSynth, saveSynth;
let toneStarted = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);

  serial = createSerial();
  let connectBtn = createButton('Connect to Arduino');
  connectBtn.position(10, 10);
  connectBtn.mousePressed(async () => {
    try {
      await serial.open('Arduino');
    } catch (err) {
      alert("Failed to open port. Make sure Serial Monitor is closed.");
    }
  });

  joyCursorX = width / 2;
  joyCursorY = height / 2;

  reverb = new Tone.Reverb({ decay: 4, preDelay: 0.2 }).toDestination();
  reverb.wet.value = 0.2;

  colorInstruments.red = new Tone.Sampler({
    urls: { "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3", "A4": "A4.mp3" },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/"
  }).connect(reverb);
  colorInstruments.red.volume.value = -4;

  colorInstruments.orange = new Tone.MonoSynth({ oscillator: { type: "sine" }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5 } }).connect(reverb);
  colorInstruments.orange.volume.value = -4;

  let yellowSynth = new Tone.FMSynth({
    oscillator: { type: "sine" }, envelope: { attack: 0.2, decay: 0.3, sustain: 0.2, release: 0.5 }, modulationIndex: 2
  }).connect(reverb);
  yellowSynth.volume.value = -8;
  colorInstruments.yellow = yellowSynth;

  colorInstruments.green = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.4 } }).connect(reverb);
  colorInstruments.green.volume.value = -4;

  colorInstruments.cyan = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.4, release: 0.5 } }).connect(reverb);
  colorInstruments.cyan.volume.value = -4;

  colorInstruments.blue = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.4 } }).connect(reverb);
  colorInstruments.blue.volume.value = -4;

  let magentaPoly = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5 }
  }).connect(reverb);
  magentaPoly.volume.value = -8;
  colorInstruments.magenta = magentaPoly;

  colorInstruments.brown = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 0.5 } }).connect(reverb);
  colorInstruments.brown.volume.value = -4;

  colorInstruments.white = new Tone.AMSynth().connect(reverb);
  colorInstruments.white.volume.value = -4;

  let blackMono = new Tone.MonoSynth({ oscillator: { type: "sine" }, envelope: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 0.5 } }).connect(reverb);
  blackMono.volume.value = -8;
  colorInstruments.black = blackMono;

  colorChangeSynth = new Tone.Synth().toDestination();
  clearSynth = new Tone.MembraneSynth().toDestination();
  saveSynth = new Tone.PluckSynth().toDestination();
}

function draw() {
  drawPalette();
  cursor(mouseX > PALETTE_WIDTH ? CROSS : HAND);

  if (serial.available()) {
    let line = serial.readUntil('\n').trim();
    if (line.length > 0) {

      if (line === "BTN") {
        let currentIndex = COLORS.indexOf(currentColor);
        currentColor = COLORS[(currentIndex + 1) % COLORS.length];

        let instrument = colorInstruments[currentColor];
        let note = STARTING_NOTES[currentColor];
        if (!(instrument instanceof Tone.Sampler) || instrument.loaded) {
          instrument.triggerAttackRelease(note, "16n");
        }
      }

      let parts = line.split(',');
      if (parts.length === 2) {
        joyX = int(parts[0]);
        joyY = int(parts[1]);
      }
    }
  }

  let dx = map(joyX, 0, 1023, -joySensitivity, joySensitivity);
  let dy = map(joyY, 0, 1023, -joySensitivity, joySensitivity);
  joyCursorX = constrain(joyCursorX + dx, PALETTE_WIDTH, width);
  joyCursorY = constrain(joyCursorY + dy, 0, height);

  simulateMouseDrag(joyCursorX, joyCursorY);



  let fillRatio = constrain(totalDrawingDistance / 50000, 0, 1);
  reverb.wet.value = map(fillRatio, 0, 1, 0.2, 0.8);
}

function simulateMouseDrag(x, y) {
  if (x > PALETTE_WIDTH + 5) {
    stroke(currentColor);
    strokeWeight(currentSize * SIZE_MULTIPLIER);
    if (isNewStroke) {
      let instrument = colorInstruments[currentColor];
      let note = STARTING_NOTES[currentColor];
      if (!(instrument instanceof Tone.Sampler) || instrument.loaded) {
        instrument.triggerAttackRelease(note, "16n");
      }
      isNewStroke = false;
      noteIndex = 0;
      noteDirection = 1;
      lastNoteX = x;
      lastNoteY = y;
      prevX = x;
      prevY = y;
    }

    let segDist = dist(prevX, prevY, x, y);
    totalDrawingDistance += segDist;
    line(prevX, prevY, x, y);
    prevX = x;
    prevY = y;

    let scale = COLOR_SCALES[currentColor];
    if (dist(lastNoteX, lastNoteY, x, y) > NOTE_THRESHOLD) {
      let instrument = colorInstruments[currentColor];
      if (!(instrument instanceof Tone.Sampler) || instrument.loaded) {
        instrument.triggerAttackRelease(scale[noteIndex], "16n");
      }
      lastNoteX = x;
      lastNoteY = y;
      noteIndex += noteDirection;
      if (noteIndex >= scale.length - 1) {
        noteIndex = scale.length - 1;
        noteDirection = -1;
      } else if (noteIndex <= 0) {
        noteIndex = 0;
        noteDirection = 1;
      }
    }
  }
}

function drawPalette() {
  noStroke();
  fill("grey");
  rect(0, 0, PALETTE_WIDTH, height);
  strokeWeight(2);
  let yPos = BOX_MARGIN;
  for (let i = 0; i < COLORS.length; i++) {
    fill(COLORS[i]);
    rect(BOX_MARGIN, yPos, BOX_SIZE, BOX_SIZE);
    yPos += BOX_SIZE + BOX_MARGIN;
  }
  for (let i = 1; i <= SIZE_SELECTOR_COUNT; i++) {
    fill("white");
    let dia = i * SIZE_MULTIPLIER;
    let centerY = SIZE_SELECTOR_BASE_Y + (i - 1) * 50;
    circle(PALETTE_WIDTH / 2, centerY, dia);
  }
}

function mouseDragged() {
  simulateMouseDrag(mouseX, mouseY);
}

function mouseClicked() {
  if (!toneStarted) {
    Tone.start();
    toneStarted = true;
  }
  if (mouseX < PALETTE_WIDTH) {
    let paletteHeight = BOX_MARGIN + (BOX_SIZE + BOX_MARGIN) * COLORS.length;
    if (mouseY < paletteHeight) {
      let index = floor((mouseY - BOX_MARGIN) / (BOX_SIZE + BOX_MARGIN));
      if (index >= 0 && index < COLORS.length) {
        currentColor = COLORS[index];
        let instrument = colorInstruments[currentColor];
        let note = STARTING_NOTES[currentColor];
        if (!(instrument instanceof Tone.Sampler) || instrument.loaded) {
          instrument.triggerAttackRelease(note, "16n");
        }
      }
    } else {
      for (let i = 1; i <= SIZE_SELECTOR_COUNT; i++) {
        let centerY = SIZE_SELECTOR_BASE_Y + (i - 1) * 50;
        if (dist(mouseX, mouseY, PALETTE_WIDTH / 2, centerY) < (i * SIZE_MULTIPLIER) / 2) {
          currentSize = i;
          colorChangeSynth.triggerAttackRelease("A4", "8n");
          break;
        }
      }
    }
  } else {
    isNewStroke = true;
  }
}

function mouseReleased() {
  isNewStroke = true;
}

function keyPressed() {
  if (key === 'c' || key === 'C') {
    background(255);
    drawPalette();
    clearSynth.triggerAttackRelease("C3", "8n");
    totalDrawingDistance = 0;
  }
  if (key === 's' || key === 'S') {
    saveCanvas('myDrawing', 'png');
    saveSynth.triggerAttackRelease("G4", "8n");
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
