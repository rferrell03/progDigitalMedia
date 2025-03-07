let synth;
let filter;
let reverb;
let reverbSlider;
let sliders = [];
let keys = {
  'A': 'C4', 'W': 'C#4', 'S': 'D4', 'E': 'D#4', 'D': 'E4',
  'F': 'F4', 'T': 'F#4', 'G': 'G4', 'Y': 'G#4', 'H': 'A4',
  'U': 'A#4', 'J': 'B4', 'K': 'C5'
};

let activeKeys = {};

function setup() {
  createCanvas(600, 800);

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: "sine"
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 1
    }
  }).toDestination();


  //effect processors
  reverb = new Tone.Reverb(2).toDestination();
  filter = new Tone.Filter(1000, "lowpass").toDestination();
  distortion = new Tone.Distortion(0.3).toDestination();
  chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination();
  synth.chain(filter, distortion, chorus, reverb, Tone.Destination);
  createUI();

  textAlign(CENTER, CENTER);
  textSize(18);
}

function draw() {
  background(50);
  fill(255);
  text("Press keys to play notes!", width / 2, 50);
  let i = 0;
  for (let key in keys) {
    fill(activeKeys[key] ? 'red' : 200);
    rect(50 + i * 40, 150, 40, 55);
    fill(0);
    textSize(18);
    text(keys[key], 70 + i * 40, 170);
    textSize(12);
    text(key, 70 + i * 40, 190);
    i++;
  }

  textSize(14);
  sliders.forEach(slider => {
    text(slider.label, slider.x + 75, slider.y - 10);
    text(`${slider.min} <-> ${slider.max}`, slider.x + 75, slider.y + 30);
  });
}

function keyPressed() {
  let keyUpper = key.toUpperCase();
  let note = keys[keyUpper];
  if (note && !activeKeys[keyUpper]) {
    synth.triggerAttack(note);
    activeKeys[keyUpper] = true;
  }
}

function keyReleased() {
  let keyUpper = key.toUpperCase();
  let note = keys[keyUpper];
  if (note) {
    synth.triggerRelease(note);
    delete activeKeys[keyUpper];
  }
}

function createUI() {

  function createLabeledSlider(label, min, max, value, step, x, y, callback) {
    let slider = createSlider(min, max, value, step);
    slider.position(x, y);
    slider.style('width', '150px');
    slider.input(() => callback(slider.value()));
    sliders.push({ label, x, y, min, max });
    return slider;
  }


  let x1 = 50, x2 = 250, y1 = 320, y2 = 400;
  createLabeledSlider("Reverb Decay", 0, 10, 5, 0.1, x1, y1, (val) => reverb.decay = val);
  createLabeledSlider("Filter Frequency", 200, 5000, 1000, 10, x2, y1, (val) => filter.frequency.value = val);
  createLabeledSlider("Distortion Amount", 0, 1, 0.3, 0.01, x1, y2, (val) => distortion.distortion = val);
  createLabeledSlider("Chorus Depth", 0, 1, 0.5, 0.01, x2, y2, (val) => chorus.depth = val);
  createLabeledSlider("Volume", 0, 100, 70, 0.01, 150, 500, (val) => synth.volume.value = val - 100);

}