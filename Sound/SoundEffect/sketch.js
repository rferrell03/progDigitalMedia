let explosion;
let explosions = [];
let explosionDuration = 890; //gif duration

function preload() {
  explosion = loadImage('explosion.gif');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background("#FBFDFB"); // background color of gif

  for (let i = explosions.length - 1; i >= 0; i--) {
    image(explosion, explosions[i].x, explosions[i].y);

    //removes explosion
    if (millis() - explosions[i].startTime > explosionDuration) {
      explosions.splice(i, 1);
    }
  }
}

function mousePressed() {
  explosions.push({ x: mouseX - 100, y: mouseY - 141, startTime: millis() });
  playSound();
}

function playSound() {
  const boomSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 14,
    oscillator: {
      type: "sine"
    },
    envelope: {
      attack: 0.001,
      decay: 1.4,
      sustain: 0.01,
      release: 1.4,
    }
  });


  const reverb = new Tone.Reverb({
    decay: 2,
    preDelay: 0.01
  }).toDestination();


  boomSynth.connect(reverb);
  boomSynth.triggerAttackRelease("C1", "2");
}