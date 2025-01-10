function setup() {
  createCanvas(windowWidth, windowHeight);

}

function draw() {
  background("lavender");


  print(screenX)
  //TEXT SETUP
  textSize(35)
  fill("black")
  text("Example 1", 19, 45);
  text("Example 2", 625, 45);
  text("Example 3", 1225, 45);
  text("Example 4", 19, 345);

  example1()
  example2()
  example3()
  example4()
}

//EXAMPLE 1
//kinda reminds me of squid game if u have ever seen that show
function example1() {
  fill("#76f23a") // color picked from moodle
  rect(19, 65, 400, 200)
  fill("white")
  circle(120, 163, 165)
  rect(230, 88, 150, 150)
}

function example2() {
  strokeWeight(0)

  fill(255, 0, 0, 75) //Red
  circle(700, 160, 200) //Top

  fill(0, 0, 255, 75) //Blue
  circle(630, 275, 200) //Left

  fill(0, 255, 0, 75) //Green
  circle(770, 275, 200) //Right
}

function example3() {
  //Background
  fill("Black")
  rect(1100, 65, 400, 200)

  //Pacman
  //This could be done with an arc
  fill("#fff74a")
  radtodegree = PI / 180
  arc(1200, 163, 165, 165, 230 * radtodegree, 135 * radtodegree, PIE)
  /*
  circle(1200, 163, 165)
  fill("black")
  triangle(1117, 124, 1200, 163, 1117, 201)
*/
  //Ghost
  fill("red")
  rect(1311, 88, 150, 150, 180, 180, 0, 0)

  //Left eye
  fill("white")
  circle(1352, 155, 45)
  fill("blue")
  circle(1352, 155, 25)

  //Right eye
  fill("white")
  circle(1420, 155, 45)
  fill("blue")
  circle(1420, 155, 25)
}

function example4() {
  fill("navy")
  rect(100, 365, 250, 250) 

  stroke("white")
  strokeWeight(4)
  fill("green")
  circle(225, 485, 140)
  fill("red")

  let x = 224.5
  let y = 485
  //Star
  beginShape()
  vertex(x + 25, y)
  vertex(x + 50, y + 50) // Bottom Right
  vertex(x, y + 20)
  vertex(x - 50, y + 50) // Bottom Left
  vertex(x - 25, y)
  vertex(x - 65, y - 30) // Top Left
  vertex(x - 15, y - 30)
  vertex(x, y - 70) // Top 
  vertex(x + 15, y - 30)
  vertex(x + 65, y - 30) // Top Right
  vertex(x + 25, y)
  endShape()

}

