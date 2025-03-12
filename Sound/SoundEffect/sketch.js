let explosion;
let explosions = [];
let explosionDuration = 890; //gif duration
let audioStarted = false;


function preload() {
  explosion = loadImage('explosion.gif');
}

function setup() {
  createCanvas(windowWidth - 100, windowHeight - 100);
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

function mouseClicked() {
  if (!audioStarted) {
    Tone.start().then(() => {
      console.log("AudioContext started");
      audioStarted = true; // Now we can play audio freely
    }).catch((e) => {
      console.error("Failed to start AudioContext:", e);
    });
  }
  explosions.push({ x: mouseX - 100, y: mouseY - 141, startTime: millis() });
  playSound();
}

function playSound() {
  // Ensure the AudioContext is resumed
  Tone.start().then(() => {
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
  }).catch((e) => {
    console.error("AudioContext error:", e);
  });
}
