let COLOR = "red";
let COLORS = ["red", "orange", "yellow", "green", "cyan", "blue", "magenta", "brown", "white", "black"]
let SIZE = 5
let prevX
let prevY
let newLine

//I locked in for this and added a size changing feature, as well as made it as smooth as i possibly can. 

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  colorPicker()
  if (mouseX > 60) {
    cursor(CROSS)
  } else {
    cursor(HAND)
  }
}

function colorPicker() {
  strokeWeight(2)
  let yColors = 5
  fill("grey")
  rect(0, 0, 60, windowHeight)
  //This was very clever of me! 
  for (let i = 0; i < 10; i++) {
    fill(COLORS[i])
    rect(5, yColors, 50, 50)
    yColors += 55;
  }
  circle(30, 575, 1 * 10)
  circle(30, 625, 2 * 10)
  circle(30, 670, 3 * 10)
  circle(30, 720, 4 * 10)
  circle(30, 780, 5 * 10)
  strokeWeight(0)
  fill(COLOR)

}

function midpoint(x1, y1, x2, y2) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return [midX, midY];
}

function mouseDragged() {
  if (mouseX > 55) {
    circle(pmouseX, pmouseY, SIZE * 10)
    if ((abs(pmouseX - prevX) > 20 || abs(pmouseY - prevY) > 20) && !newLine) {
      //All this midpoint calculation is so that if you want to drag your mouse really fast, it appears as a line instead of a line of circles!

      let mid = midpoint(prevX, prevY, pmouseX, pmouseY);
      let midx = mid[0];
      let midy = mid[1];

      let mid1 = midpoint(prevX, prevY, midx, midy);
      let mid2 = midpoint(mid1[0], mid1[1], midx, midy);
      let mid3 = midpoint(midx, midy, mid2[0], mid2[1]);
      let mid4 = midpoint(midx, midy, pmouseX, pmouseY);
      let mid5 = midpoint(mid4[0], mid4[1], pmouseX, pmouseY);

      circle(midx, midy, SIZE * 10);
      circle(mid1[0], mid1[1], SIZE * 10);
      circle(mid2[0], mid2[1], SIZE * 10);
      circle(mid3[0], mid3[1], SIZE * 10);
      circle(mid4[0], mid4[1], SIZE * 10);
      circle(mid5[0], mid5[1], SIZE * 10);
    }
    newLine = false;
    prevX = pmouseX
    prevY = pmouseY
  }
}

function mouseClicked() {
  if (mouseX < 55) {
    let tmpY = 55;

    for (let i = 0; i < 15; i++) {
      if (mouseY < tmpY && tmpY < 555) {
        COLOR = COLORS[i]
        i = 16;
      } else if (mouseY < tmpY && tmpY > 560) {
        SIZE = i - 9;
        i = 16;
      } else {
        tmpY += 55;
      }
    }

  } else {
    newLine = true;
  }
}

