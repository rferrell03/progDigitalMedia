let port, reader;
let latestLine = "";
let pot = 512;
let magic = 0, diff = 0;

const SAFE_RADIUS = 50;
let gameState = "start";
// player movement knobs
const SPEED_MIN = -5;
const SPEED_MAX = 5;
const PROJECTILE_SPEED = 20;  // big number 

let preFire = false;
let preFireStart = 0;
const preFireDuration = 3000;  // flash for 500ms before beam


// how fast magic wanders
const MAGIC_NOISE_SPEED = 0.002;
let enemiesKilled = 0;
let x = 0;
let velocity = 0;
let lastSendTime = 0;
let mappedMagicX = 0;

let fallingObjects = [];
let projectiles = [];
let lastFallTime = 0;
let fallInterval = 1000;
let score = 0;

let damageTimer = 0;
let safeZoneDuration = 2000;
let dangerZoneInterval = 10000;
let inDangerZone = false;
let playerHit = false;
let playerHealth = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < STAR_COUNT; i++) {
        stars.push(new Star());
      }
  textSize(14);
  textAlign(LEFT, TOP);
  x = width / 2;
  magic = width / 2;        // start dead-center

  let button = createButton("Connect to Arduino");
  button.mousePressed(connect);
}

function updateMagic() {
  // slooow Perlin noise walk
  magic = noise(frameCount * MAGIC_NOISE_SPEED) * width;
}

function takeDamage(amount) {
  playerHealth = max(0, playerHealth - amount);
  playerHit = true;
  
}

function draw() {
  drawSpaceBackground();

  if (gameState === "start") {
    drawStartScreen();
  } else if(gameState === "end") {
    drawEndScreen();
  }else {
    handleJoystickInput();
    updateMagicMapping();
    updateDangerZone();
    spawnFallingObjects();
    updateFallingObjects();
    updateProjectiles();
    drawSafeZone();
    drawHealthBar();
    drawPlayerShip();
    drawFallingObjects();
    drawProjectiles();
    drawUI();
    sendPositionToArduino();
    if (playerHealth <= 0) {
      gameState = "end";
    }
  }
}

function drawEndScreen() {
  push();
  noStroke();
  fill(0, 200);
  rectMode(CORNER);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(64);
  fill(255, 0, 0);
  text("GAME OVER", width / 2, height / 2 - 40);

  const alpha = map(sin(frameCount * 0.1), -1, 1, 50, 255);
  textSize(16);
  fill(255, alpha);
  text("Press Arduino button to play again!", width / 2, height / 2 + 40);
  pop();
}

function drawStartScreen() {
  push();
  // dark overlay
  noStroke();
  fill(0, 200);
  rectMode(CORNER);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);

  
  textSize(64);
  fill(255);
  text("SPACE LASERS!", width / 2, height / 2 - 40);

  
  const alpha = map(sin(frameCount * 0.1), -1, 1, 50, 255);
  textSize(16);
  fill(255, alpha);
  text("Press Arduino button to start!", width / 2, height / 2 + 40);
  pop();
}



function handleJoystickInput() {
  const threshold = 50;
  const offset = 512 - pot;
  velocity = abs(offset) > threshold
    ? map(offset, -512, 512, SPEED_MIN, SPEED_MAX)
    : 0;
  x += velocity;
  x = constrain(x, 0, width);
}

function updateMagicMapping() {
  updateMagic();
  mappedMagicX = magic;
  diff = abs(x - magic);
}

function updateDangerZone() {
  const now = millis();
  const dangerMinX = magic - SAFE_RADIUS;
  const dangerMaxX = magic + SAFE_RADIUS;

  // start pre‐fire flash 3 s before the scheduled beam
  if (!inDangerZone
    && !preFire
    && now - damageTimer > dangerZoneInterval - preFireDuration) {
    preFire = true;
    preFireStart = now;
    sendToArduino("FLASH");
  }

  // after 3 s of flashing, actually fire the beam
  if (preFire && now - preFireStart >= preFireDuration) {
    preFire = false;
    inDangerZone = true;
    damageTimer = now;
    playBeamSound();
  }

  // beam active damage logic
  if (inDangerZone) {
    if (x >= dangerMinX && x <= dangerMaxX) {
      takeDamage(1);
    }
    if (now - damageTimer > safeZoneDuration) {
      inDangerZone = false;
      damageTimer = now;
      playerHit = false;
    }
  }
}




function spawnFallingObjects() {
  if (millis() - lastFallTime > fallInterval) {
    const size = random(40, 80);
    const detail = floor(random(6, 10));
    const verts = [];

    // build a jagged outline
    for (let i = 0; i < detail; i++) {
      const angle = map(i, 0, detail, 0, TWO_PI);
      const radius = (size / 2) * random(0.7, 1.3);
      verts.push({ angle, radius });
    }

    fallingObjects.push({
      x: random(width),
      y: -size,
      size,
      verts,
      rotation: random(TWO_PI),
      rotSpeed: random(-0.03, 0.03),
      speed: random(1.5, 3)
    });
    lastFallTime = millis();
  }
}

// 2) Advances position and removes off-screen asteroids
function updateFallingObjects() {
  for (let i = fallingObjects.length - 1; i >= 0; i--) {
    const obj = fallingObjects[i];
    obj.y += obj.speed;
    if (obj.y - obj.size > height) {
      fallingObjects.splice(i, 1);
    }
  }
}

// 3) Draws each asteroid with isolated styles/transforms
function drawFallingObjects() {
  for (const obj of fallingObjects) {
    obj.rotation += obj.rotSpeed;

    push();
    translate(obj.x, obj.y);
    rotate(obj.rotation);

    // reset modes inside push/pop
    rectMode(CENTER);
    noStroke();
    fill(120);
    stroke(80);
    strokeWeight(2);

    beginShape();
    for (const v of obj.verts) {
      vertex(cos(v.angle) * v.radius, sin(v.angle) * v.radius);
    }
    endShape(CLOSE);
    pop();
  }
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.y -= PROJECTILE_SPEED;

    // remove off-screen lasers
    if (p.y < -20) {
      projectiles.splice(i, 1);
      continue;
    }

    // test collision vs. each asteroid
    for (let j = fallingObjects.length - 1; j >= 0; j--) {
      const obj = fallingObjects[j];
      const dx = p.x - obj.x;
      const dy = p.y - obj.y;
      const radius = obj.size * 0.5;

      // simple circle‐vs‐point check
      if (dx * dx + dy * dy < radius * radius) {
        // BOOM destroy both
        fallingObjects.splice(j, 1);
        projectiles.splice(i, 1);

        score += 10;
        enemiesKilled++;
        playHitSound();

        break;  // move on to next projectile
      }
    }
  }
}



function drawProjectiles() {
  blendMode(ADD);
  stroke(255, 240, 150, 200);  // pale yellow
  strokeWeight(4);
  for (let p of projectiles) {
    // draw a short streak instead of a circle
    line(p.x, p.y + 10, p.x, p.y - 20);
  }
  blendMode(BLEND);
}


function drawSafeZone() {
  if (inDangerZone) {
    // actual laser
    drawLaserEffect();
  } else {
    // idle “laser rails”
    stroke(100, 255, 100, 120);
    strokeWeight(2);
    line(magic - SAFE_RADIUS, 0, magic - SAFE_RADIUS, height);
    //line(magic, 0, magic, height);
    line(magic + SAFE_RADIUS, 0, magic + SAFE_RADIUS, height);
    noStroke();
  }
}

function drawLaserEffect() {
  const dangerMinX = magic - SAFE_RADIUS;
  const dangerMaxX = magic + SAFE_RADIUS;
  const beamWidth = dangerMaxX - dangerMinX;

  // 1) fill the danger zone with a red, semi-transparent block
  noStroke();
  fill(255, 0, 0, 80);             // alpha = 80/255
  rect(dangerMinX, 0, beamWidth, height*2);

  // 2) pulsating glow on the edges
  const glowAlpha = map(sin(frameCount * 0.3), -1, 1, 80, 200);
  blendMode(ADD);
  noFill();

  stroke(255, 0, 0, glowAlpha * 0.3);
  strokeWeight(8);
  line(dangerMinX, 0, dangerMinX, height);
  line(dangerMaxX, 0, dangerMaxX, height);

  stroke(255, 30, 30, glowAlpha);
  strokeWeight(4);
  line(dangerMinX, 0, dangerMinX, height);
  line(dangerMaxX, 0, dangerMaxX, height);

  // 3) jittery scan-lines
  for (let i = 0; i < 6; i++) {
    const y = random(height);
    stroke(255, 20, 20, random(30, 100));
    strokeWeight(random(1, 2));
    line(dangerMinX - 15, y, dangerMinX + 15, y);
    line(dangerMaxX - 15, y, dangerMaxX + 15, y);
  }

  blendMode(BLEND);
}


function drawHealthBar() {
  const margin = 20;                          // gap from edges
  const barW = 10;                          // thickness of the bar
  const maxBarH = height - margin * 2;         // max height available
  const xPos = margin;                      // always margin from left
  const yTop = height - margin - maxBarH;   // top of the full‐height background
  const healthH = map(playerHealth, 0, 100, 0, maxBarH);

  noStroke();
  // background (empty health)
  fill(100);
  rect(xPos, 15, barW, maxBarH);

  // filled portion (current health)
  fill(0, 255, 0);
  rect(xPos+1, 16, barW - 2, healthH);
}


function drawPlayerShip() {
  push();
  translate(x, height - 60);
  noStroke();

  // Main
  fill(80, 80, 160);
  beginShape();
  vertex(0, -20);
  vertex(15, 10);
  vertex(0, 5);
  vertex(-15, 10);
  endShape(CLOSE);

  // Cockpit window
  fill(150, 200, 255, 200);
  ellipse(0, -5, 12, 8);

  // Left wing
  fill(100, 100, 200);
  triangle(-15, 10, -30, 18, 0, 12);

  // Right wing
  triangle(15, 10, 30, 18, 0, 12);

  // Thruster flame
  fill(255, 150, 0, 180);
  beginShape();
  vertex(-7, 12);
  vertex(0, 24 + random(-2,2));
  vertex(7, 12);
  endShape(CLOSE);

  pop();
}


function drawUI() {
  //score
  textAlign(CENTER, TOP);
  textSize(48);
  textStyle(BOLD);
  fill(255);
  text(`Score: ${score}`, width / 2, 20);

  // killed bottom-right
  textAlign(RIGHT, BOTTOM);
  textSize(18);
  textStyle(NORMAL);
  fill(200);
  const margin = 20;
  text(`Enemies killed: ${enemiesKilled}`,
    width - margin, height - margin);
}

function resetGame() {
  playerHealth = 100;
  score = 0;
  enemiesKilled = 0;
  fallingObjects = [];
  projectiles = [];
  damageTimer = millis();
  lastFallTime = millis();
}



// ——— SET UP SFX ———

const shootSynth = new Tone.Synth({
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.2 }
}).toDestination();

// Hit impact
const hitNoise = new Tone.NoiseSynth({
  noise: { type: 'white' },
  envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 }
}).connect(new Tone.Filter(800, "bandpass")).toDestination();

const beamSynth = new Tone.FMSynth({
  oscillator: { type: "sine" },
  modulation: { type: "triangle" },
  modulationIndex: 20,
  envelope: { attack: 0.3, decay: 0.2, sustain: 0.8, release: 1.2 }
}).toDestination();

function playBeamSound() {
  // ensure audio context is running
  Tone.start();
  
  beamSynth.triggerAttackRelease("C2", "2n");
}

function playShootSound() {
  
  Tone.start();
  shootSynth.triggerAttackRelease("C6", "16n");
}

function playHitSound() {
  Tone.start();
  hitNoise.triggerAttackRelease("32n");
}


// ——— SERIAL STUFF BELOW ———

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
    if (!value) continue;

    let line = value.trim();
    if (line.startsWith("{")) {
      try {
        let data = JSON.parse(line);
        pot = data.pot;
      } catch (e) {
        console.warn("Bad JSON:", line);
      }
    } else if (line === "BUTTON_PRESSED") {
      if (gameState === "start" || gameState === "end") {
        resetGame();
        gameState = "playing";      // leave the start screen
      } else {
        projectiles.push({ x: x, y: height - 60 });
        playShootSound();
      }
    }
  }
}

async function sendToArduino(val) {
  if (!port || !port.writable) return;
  const writer = port.writable.getWriter();
  await writer.write(new TextEncoder().encode(val + "\n"));
  writer.releaseLock();
}

function sendPositionToArduino() {
  if (millis() - lastSendTime > 100 && port?.writable) {
    let mappedX = int(map(x, 0, width, 1023, 0));
    sendToArduino(mappedX);
    lastSendTime = millis();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class LineBreakTransformer {
  constructor() { this.container = ""; }
  transform(chunk, controller) {
    this.container += chunk;
    const lines = this.container.split("\n");
    this.container = lines.pop();
    lines.forEach(line => controller.enqueue(line));
  }
  flush(controller) { controller.enqueue(this.container); }
}


// STAR STUFF
let stars = [];
const STAR_COUNT = 200;

class Star {
  constructor() {
    this.reset();
    this.twinkle = random(TWO_PI);
    this.twinkleSpeed = random(0.02, 0.05);
  }
  reset() {
    this.x = random(width);
    this.y = random(-height, 0);
    this.speed = random(0.5, 2.5);
    this.size = random(1, 3);
    this.baseBrightness = random(150, 255);
  }
  update() {
    // move down
    this.y += this.speed;
    if (this.y > height) this.reset();

    // twinkle
    this.twinkle += this.twinkleSpeed;
  }
  show() {
    let b = this.baseBrightness * (0.5 + 0.5 * sin(this.twinkle));
    noStroke();
    fill(b);
    circle(this.x, this.y, this.size);
  }
}

function drawSpaceBackground() {
  // fill sky
  background(0);
  // draw all stars
  for (let s of stars) {
    s.update();
    s.show();
  }
}