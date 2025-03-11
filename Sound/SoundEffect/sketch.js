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
}
