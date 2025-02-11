let spelunkyGuy
let spelunkyGirl
let yang
let characters = [];
function preload() {
  spelunkyGuy = loadImage("SpelunkyGuy.png");
  spelunkyGirl = loadImage("SpelunkyGirl.png");
  yang = loadImage("Yang.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setupLevel()
}

function draw() {
  background(22);
  characters.forEach(element => {
    element.draw();
  });

}

function keyPressed() {
  characters.forEach((character) => { character.keyPressed() });
}

function keyReleased() {
  characters.forEach((character) => { character.keyReleased() });
}


function setupLevel() {

  for (let i = 0; i < random(20, 50); i++) {
    let character = new Character(random(80, windowWidth - 80), random(80, windowHeight - 80))
    let sprite = pickRandomSprite();
    character.addAnimation("stand", new SpriteAnimation(sprite, 0, 0, 1));
    character.addAnimation("walkr", new SpriteAnimation(sprite, 0, 0, 9));
    character.addAnimation("walkl", new SpriteAnimation(sprite, 0, 0, 9));
    character.addAnimation("up", new SpriteAnimation(sprite, 0, 5, 6));
    character.addAnimation("down", new SpriteAnimation(sprite, 6, 5, 6));
    character.animations["walkl"].flipped = true;
    character.currentAnimation = "stand";

    characters.push(character);
  }

}

function pickRandomSprite() {
  switch (int(random(1, 4))) {
    case 1: return spelunkyGirl;
    case 2: return spelunkyGuy;
    case 3: return yang;
    default: break;
  }
}


//Classes used & edited from code in class :D
class Character {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.currentAnimation = null;
    this.animations = {};
    this.left = false;
  }

  addAnimation(key, animation) {
    this.animations[key] = animation;
  }

  draw() {
    let animation = this.animations[this.currentAnimation];
    if (animation) {
      switch (this.currentAnimation) {
        case "up":
          this.y -= 2;
          break;
        case "down":
          this.y += 2;
          break;
        case "walkr":
          this.x += 2;
          break;
        case "walkl":
          this.x -= 2;
          break;
      }
      push();
      translate(this.x, this.y);
      animation.draw();
      pop();
    }
  }

  keyPressed() {
    switch (keyCode) {
      case UP_ARROW:
        this.currentAnimation = "up";
        break;
      case DOWN_ARROW:
        this.currentAnimation = "down";
        break;
      case RIGHT_ARROW:
        this.currentAnimation = "walkr";
        break;
      case LEFT_ARROW:
        this.currentAnimation = "walkl";
        break;
    }
  }

  keyReleased() {
    this.currentAnimation = "stand";
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
    translate((this.flipped) ? 80 : 0, 0);
    scale(s, 1);
    image(this.spritesheet, 0, 0, 80, 80, this.u * 80, this.v * 80, 80, 80);

    this.frameCount++;
    if (this.frameCount % 10 === 0)
      this.u++;

    if (this.u === this.startU + this.duration)
      this.u = this.startU;
  }
}
