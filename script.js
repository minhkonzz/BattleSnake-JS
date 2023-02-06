// HTML Elements 
const mainWindowElement = document.getElementById("main-window");
const listtest = document.getElementsByClassName("snake__dot");
console.log(listtest);

// initital
let mainWindowWidth, mainWindowHeight;
window.addEventListener("resize", function() {
  const { offsetWidth, offsetHeight } = mainWindowElement;
  mainWindowWidth = offsetWidth; 
  mainWindowHeight = offsetHeight;
});

const snakeDotSize = 16; 

// functions 
function DOMUpdates_SnakeDots(snakeInstance, elements) {

}

// classes
class Point {
  constructor(x = 10, y = 10) {
    this.setCoord(x, y);
  } 

  setCoord(x, y) {
    this.x = x >= 0 ? x : 10; 
    this.y = y >= 0 ? y : 10;
  }
}

class Square extends Point {
  constructor(x, y, radius = 10) {
    super(x, y);
    this.setRadius(radius);
  }

  setRadius(radius) {
    this.radius = radius >= 0 ? radius : 10;
  }
}

class Snake {
  constructor(direction = "RIGHT", type, startPoint) {
    this.setDirection(direction);
    this.setType(type);
    this.body = [ new Square(startPoint.x, startPoint.y, snakeDotSize / 2) ];
  }

  setDirection(direction) {
    if (this.direction !== direction && (direction === "UP" || direction === "DOWN" || direction === "LEFT" || direction === "RIGHT"))
      this.direction = direction;
  }

  setType(type) {
    if (type === "FIRE_SNAKE" || type === "WATER_SNAKE")
      this.type = type;
  }

  catchFood(food) {
    const score = Math.round(food.radius * 0.5 - 1);
    const currentBody = this.body;
    const snakeSize = currentBody.length;
    if (snakeSize === 1) {
      const currentDirection = this.direction;
      if (currentDirection === "UP" || currentDirection === "DOWN") { 
        for (let i = 1; i <= score; i++) { 
          this.body.push(new Square(
            currentBody[i - 1].x, 
            currentBody[i - 1].y + (currentDirection === "UP" ? snakeDotSize : -snakeDotSize), 
            snakeDotSize / 2
          ));
        }
      }
      else {
        for (let i = 1; i <= score; i++) {  
          this.body.push(new Square(
            currentBody[i - 1].x + (currentDirection === "LEFT" ? snakeDotSize : -snakeDotSize),
            currentBody[i - 1].y, 
            snakeDotSize / 2
          ));
        }
      }
    }
    else {
      const lastSnakeDotIndex = snakeSize - 1;
      const ldx = currentBody[lastSnakeDotIndex - 1].x - currentBody[lastSnakeDotIndex].x;
      const ldy = currentBody[lastSnakeDotIndex - 1].y - currentBody[lastSnakeDotIndex].y;
      if ((ldy > 0 && ldx === 0) || (ldy < 0 && ldx === 0)) {
        for (let i = snakeSize; i < snakeSize + score; i++) {
	        this.body.push(new Square(currentBody[i - 1].x, currentBody[i - 1].y + (ldy > 0 ? -snakeDotSize : snakeDotSize), snakeDotSize / 2));
        }
      }
      else if ((ldx > 0 && ldy === 0) || (ldx < 0 && ldy === 0)) {
        for (let i = snakeSize; i < snakeSize + score; i++) {
	        this.body.push(new Square(currentBody[i - 1].x + (ldx > 0 ? -snakeDotSize : snakeDotSize), currentBody[i - 1].y, snakeDotSize / 2));
        }
      }
    }
  }

  updateSnakeDots(axis, speed) {
    const currentBody = this.body; 
    for (let i = currentBody.length - 1; i >= 0; i++) {
      if (i > 0) currentBody[i].setCoord(currentBody[i - 1].x, currentBody[i - 1].y);
      else {
        if (axis === "X") currentBody[i].setCoord(currentBody[i].x + speed, currentBody[i].y); 
        else currentBody[i].setCoord(currentBody[i].x, currentBody[i].y + speed); 
      }
    }
  }

  checkDirection() {
    switch (this.direction) {
      case "UP":
        this.updateSnakeDots("Y", -snakeDotSize);
        break;
      case "DOWN":
        this.updateSnakeDots("Y", snakeDotSize);
        break;
      case "LEFT":
        this.updateSnakeDots("X", -snakeDotSize);
        break;
      case "RIGHT":
        this.updateSnakeDots("X", snakeDotSize);
        break;
    }
  }

  isHitItself() {
    const { body, direction } = this;
    const { x: xHead, y: yHead } = body[0];
    for (let i = 3; i < body.length; i++) {
      const { x: xi, y: yi } = body[i];
      if (direction === "LEFT" || direction === "RIGHT") {
        const dx = xHead - xi;
        if (((dx > 0 && direction === "LEFT") || (dx < 0 && direction === "RIGHT")) && Math.abs(dx) <= snakeDotSize && yHead === yi) return true;
      }
      if (direction === "UP" || direction === "DOWN") {
        const dy = yHead - yi;
        if (((dy > 0 && direction === "UP") || (dy < 0 && direction === "DOWN")) && Math.abs(dy) <= snakeDotSize && xHead === xi) return true;
      }
    }
    return false;
  }

  isHitWall() {
    const { body, direction } = this;
    const { x: xHead, y: yHead } = body[0];
    const snakeDotHalfSize = snakeDotSize / 2; 
    return (
      (xHead - snakeDotHalfSize <= -0.01 && direction === "LEFT") || 
      (xHead + snakeDotHalfSize >= mainWindowWidth && direction === "RIGHT") || 
      (yHead - snakeDotHalfSize <= -0.01 && direction === "UP") ||
      (yHead + snakeDotHalfSize >= mainWindowHeight && direction === "DOWN") 
    );
  }

  isHitAnother(enemySnake) {
    const enemySnakeBody = enemySnake.body;
    const { body, direction } = this;
    const { x: xHead, y: yHead } = body[0];
    return !!enemySnakeBody.find((snakeDot) => (
      (((direction === "LEFT" && xHead - snakeDot.x > 0) || 
        (direction === "RIGHT" && xHead - snakeDot.x < 0)) &&
        Math.abs(xHead - snakeDot.x) < snakeDotSize && 
        yHead === snakeDot.y) ||
      (((direction === "UP" && yHead - snakeDot.y > 0) || 
        (direction === "DOWN" && yHead - snakeDot.y < 0)) &&
        Math.abs(yHead - snakeDot.y) < snakeDotSize && 
        xHead === snakeDot.x)
    ));
  }

  isEatAnother(enemySnake) {
    const { body, direction } = this;
    const bodyLength = body.length;
    const { x: xHead, y: yHead } = body[0];
    const enemySnakeBody = enemySnake.body; 
    const enemySnakeBodyLength = enemySnakeBody.length;
    const enemySnakeDirection = enemySnake.direction; 
    const { x: enemyXHead, y: enemyYHead } = enemySnake[0];
    return (
      bodyLength > enemySnakeBodyLength && 
      ((Math.abs(xHead - enemyXHead) < snakeDotSize &&
        yHead === enemyYHead && 
        ((direction === "LEFT" && enemySnakeDirection === "RIGHT") || (direction === "RIGHT" && enemySnakeDirection === "LEFT"))) || 
        (Math.abs(yHead - enemyYHead) < snakeDotSize &&
        xHead === enemyXHead && 
        ((direction === "UP" && enemySnakeDirection === "DOWN") || (direction === "DOWN" && enemySnakeDirection === "UP"))))
    );
  }
}

class CountdownTimer {
  constructor(m, s) {
      this.m = m;
      this.s = s;
  }
  handleCountdown() {
    let intervalID = setInterval(() => {
      if (this.m === 0 && this.s === 0) {
        clearInterval(intervalID);
        return;
      }
      if (this.s === 0) {
        this.s = 59;
        this.m -= 1;
        return;
      }
      this.s -= 1;
    }, 1000);
  }
}

class Game {
  constructor() {
    this.run();
  }
  run() {

  }
}




