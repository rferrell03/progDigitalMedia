let bugs = [];
let deadBugs = [];
let bugCount = 20;
let score = 0;
let countdown = 30;
let bugSize = 32;
let bugSprite;
let bugSprite2;
let floor;
let splatter;
let lastTimeUpdate;
let gameFinished = false;

function preload() {
  //testing
  bugSprite = loadImage("bug.png");
  bugSprite2 = loadImage("bug2.png");
  floor = loadImage("Floor.png");
  splatter = loadImage("splatter.png");
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < bugCount; i++) {
    bugs.push(new Bug(random(width - bugSize), random(height - bugSize), pickRandomSprite()));
  }
}

function draw() {
  background(50);
  drawFloor();

  if (!gameFinished) {
    for (let dead of deadBugs) {
      dead.display();
    }
    for (let bug of bugs) {
      bug.move();
      bug.display();
    }
    ui();
    if (frameCount % 60 == 0 && countdown > 0) {
      countdown--;
    }
  }

  if (countdown <= 0) {
    gameFinished = true;
    drawGameOverScreen()
  }

}

function mousePressed() {
  for (let i = bugs.length - 1; i >= 0; i--) {
    if (bugs[i].isClicked(mouseX, mouseY)) {
      deadBugs.push(new deadBug(bugs[i].x, bugs[i].y, splatter));
      bugs.splice(i, 1);
      score++;
      bugs.push(new Bug(random(width), random(height), pickRandomSprite()));
      for (let bug of bugs) {
        bug.speedUp();
      }
      break;
    }
  }
}

function drawGameOverScreen() {
  textSize(50)
  fill(225)
  text("Game over!", width / 2 - 100, height / 2 - 50);
  text("Refresh page to restart!", width / 2 - 200, height / 2 + 50);
}

function drawFloor() {
  for (let x = 0; x < width; x += 64) {
    for (let y = 0; y < height; y += 64) {
      image(floor, x, y, 64, 64);
    }
  }
}

function pickRandomSprite() {
  switch (int(random(1, 3))) {
    case 1: return bugSprite;
    case 2: return bugSprite2;
    default: break;
  }
}

function ui() {
  textSize(32);
  fill(255);
  textAlign(LEFT, TOP);

  text(`Score: ${score}`, width / 2, 20);

  text(`Time: ${countdown}s`, width / 2, 60);
}

class deadBug {
  constructor(x, y, sprite) {
    this.x = x - bugSize;
    this.y = y - bugSize;
    this.size = random(1, 3);
    this.splatter = new SpriteAnimation(sprite, 0, 0, 1);
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.size, this.size);
    this.splatter.draw();
    pop();
  }
}

class Bug {
  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.speed = random(1, 2);
    this.direction = [random(-1, 1), random(-1, 1)];

    this.walkLeft = new SpriteAnimation(sprite, 0, 0, 2);
    this.walkRight = new SpriteAnimation(sprite, 0, 0, 2);
    this.walkLeft.flipped = true;
  }


  move() {
    this.x += this.speed * this.direction[0];
    this.y += this.speed * this.direction[1];
    //keeps in bounds
    if (this.x <= 0 || this.x >= width - bugSize || this.y <= 0 || this.y >= height - bugSize) {
      this.direction[0] *= -1;
      this.direction[1] *= -1;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    if (this.direction[0] < 0) {
      this.walkLeft.draw();
    } else {
      this.walkRight.draw();
    }
    pop();
  }


  //chat gave me this function ngl, did not feel like typing all of this .-. 
  isClicked(mx, my) {
    return mx > this.x && mx < this.x + bugSize && my > this.y && my < this.y + bugSize;
  }

  speedUp() {
    this.speed += random(0.3, 1);
    random(0, 50) < 1 ? bugs.push(new Bug(random(width - bugSize), random(height - bugSize), pickRandomSprite())) : null;
  }


}

class SpriteAnimation {
  constructor(spritesheet, startU, startV, duration) {
    this.spritesheet = spritesheet;
    this.u = startU;
    this.v = startV;
    this.duration = duration;
    this.startU = startU;
    this.frameCount = 0;
    this.flipped = false;
  }

  draw() {

    let s = (this.flipped) ? -1 : 1;
    translate((this.flipped) ? 32 : 0, 0);
    scale(s, 1.5);
    image(this.spritesheet, 0, 0, 32, 32, this.u * 32, this.v * 32, 32, 32);

    this.frameCount++;
    if (this.frameCount % 10 === 0)
      this.u++;

    if (this.u === this.startU + this.duration)
      this.u = this.startU;
  }
}
