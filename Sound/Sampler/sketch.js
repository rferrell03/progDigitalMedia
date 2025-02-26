let startContext, samples, buttons, sliders;

const rev = new Tone.Reverb(5).toDestination();
const dist = new Tone.Distortion(0).connect(rev);
const del = new Tone.FeedbackDelay(0, 0).connect(dist);
del.wet.value = 0.5;
const bitCrusher = new Tone.BitCrusher(4).connect(del);

function preload() {
  samples = new Tone.Players({
    //i would have them in a media folder but github pages didnt like it
    cat: "drums.wav",
    clapping: "clapping.wav",
    microwave: "microwave.wav",
    dracula: "dracula.wav"
  }).connect(del);
}

function setup() {
  createCanvas(400, 400);

  startContext = createButton("Start Audio Context").position(0, 0).mousePressed(startAudioContext);

  buttons = {
    cat: createButton("Play drum sample").position(10, 30).mousePressed(() => samples.player("cat").start()),
    clapping: createButton("Play clapping sample").position(200, 30).mousePressed(() => samples.player("clapping").start()),
    microwave: createButton("Play microwave sample").position(10, 50).mousePressed(() => samples.player("microwave").start()),
    dracula: createButton("Play dracula sample").position(200, 50).mousePressed(() => samples.player("dracula").start())
  };

  sliders = {
    delayTime: createSlider(0, 1, 0, 0.01).position(10, 100).input(() => del.delayTime.value = sliders.delayTime.value()),
    feedback: createSlider(0, 0.99, 0, 0.01).position(200, 100).input(() => del.feedback.value = sliders.feedback.value()),
    distortion: createSlider(0, 1.0, 0, 0.01).position(10, 200).input(() => dist.distortion = sliders.distortion.value()),
    reverbWet: createSlider(0, 1, 0, 0.01).position(200, 200).input(() => rev.wet.value = sliders.reverbWet.value()),
    bitDepth: createSlider(1, 16, 4, 1).position(10, 300).input(() => bitCrusher.bits = sliders.bitDepth.value()),

  };
}

function draw() {
  background(220);
  text(`Delay Time: ${sliders.delayTime.value()}`, 15, 90);
  text(`Feedback Amount: ${sliders.feedback.value()}`, 205, 90);
  text(`Distortion Amount: ${sliders.distortion.value()}`, 15, 190);
  text(`Reverb Wet Amount: ${sliders.reverbWet.value()}`, 205, 190);
  text(`Bit Depth: ${sliders.bitDepth.value()}`, 15, 290);

}

function startAudioContext() {
  if (Tone.context.state !== 'running') {
    Tone.start();
    console.log("Audio Context Started");
  } else {
    console.log("Audio Context is already running");
  }
}