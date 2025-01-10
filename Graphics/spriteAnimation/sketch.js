function setup() {
  createCanvas(windowWidth, windowHeight);
  setupLevel()
}

function draw() {
  background(22);

  //Movement
  if (keyIsDown(LEFT_ARROW)) {
    sprite.x -= 5;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    sprite.x += 5;
  }
}


function setupLevel() {
  world.gravity.y = 9.8

  //Character
  character = new Sprite(80, 80)
  character.spriteSheet = 'SpelunkyGuy.png'

  //Floor
  ground = new Sprite(windowWidth / 2, windowHeight * .8, windowWidth, windowHeight * .4, 'static')

}


