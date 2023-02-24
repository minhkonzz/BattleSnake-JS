const mainWindowElement = document.getElementById("main-window");
const fsElement = document.querySelector(".snake.fs");
const wsElement = document.querySelector(".snake.ws"); 
const alertElement = document.querySelector(".alert-end-game");
const countdownTimeElement = document.querySelector(".main-right__time__value");
const fsScoreElement = document.querySelector(".main-right__snake__score__value.fs");
const wsScoreElement = document.querySelector(".main-right__snake__score__value.ws");

const { offsetWidth, offsetHeight } = mainWindowElement;
let mainWindowWidth = offsetWidth, mainWindowHeight = offsetHeight;
window.addEventListener("resize", function() {
  const { offsetWidth, offsetHeight } = mainWindowElement;
  mainWindowWidth = offsetWidth; 
  mainWindowHeight = offsetHeight;
});

const snakeDotSize = 16; 
const snakeDotHalfSize = snakeDotSize / 2; 

function randInRange(low, high, isMustEven = false) {
  const rand = Math.floor(Math.random() * (high - low + 1)) + low;
  return !isMustEven ? rand : (rand % 2 === 0 ? rand : rand + 1);
}

function renderSnakeDots(snakeInstance, snakeElement) {
  const snakeDotElements = snakeElement.children; 
  const snakeBody = snakeInstance.body; 
  for (let i = 0; i < snakeDotElements.length; i++) {
    snakeDotElements[i].style.setProperty("top", `${snakeBody[i].y}px`); 
    snakeDotElements[i].style.setProperty("left", `${snakeBody[i].x}px`); 
  }
  return snakeDotElements;
}

function createNewSnakeDot(snakeType, position) {
  const { x, y } = position;
  const snakeDotElement = document.createElement("li"); 
  snakeDotElement.setAttribute("class", "snake__dot"); 
  snakeDotElement.style.setProperty("width", `${snakeDotSize}px`);
  snakeDotElement.style.setProperty("height", `${snakeDotSize}px`);
  snakeDotElement.style.setProperty("top", `${y}px`);
  snakeDotElement.style.setProperty("left", `${x}px`);
  snakeDotElement.style.setProperty("z-index", 1);
  snakeDotElement.style.setProperty("background-color", snakeType === "FIRE_SNAKE" ? "var(--fire-snake-color)" : "var(--water-snake-color)");
  return snakeDotElement;
}

// classes
class Point {
  constructor(x = 10, y = 10) {
    this.setCoord(x, y);
  } 

  setCoord(x, y) {
    this.x = x;
    this.y = y;
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
  constructor(startPoint, snakeElement, type, direction = "RIGHT") {
    this.snakeElement = snakeElement;
    this.setDirection(direction);
    this.setType(type);
    const t = new Square(startPoint.x, startPoint.y, snakeDotHalfSize);
    this.body = [ t ];
  }

  setDirection(direction) {
    if (this.direction !== direction && (direction === "UP" || direction === "DOWN" || direction === "LEFT" || direction === "RIGHT")) this.direction = direction;
  }

  setType(type) {
    if (type === "FIRE_SNAKE" || type === "WATER_SNAKE") this.type = type;
  }

  catchFood(food) {
    const currentBody = this.body;
    const { x: xHead, y: yHead } = currentBody[0];
    if ((Math.abs(xHead - food.x) > 10) || (Math.abs(yHead - food.y) > 10)) return;
    const snakeType = this.type;
    const score = Math.round(food.radius * 0.5 - 1);
    const snakeSize = currentBody.length;
    if (snakeSize === 1) {
      const currentDirection = this.direction;
      if (currentDirection === "UP" || currentDirection === "DOWN") { 
        for (let i = 1; i <= score; i++) { 
          const newSnakeDot = new Square(
            currentBody[i - 1].x, 
            currentBody[i - 1].y + (currentDirection === "UP" ? snakeDotSize : -snakeDotSize), 
            snakeDotSize / 2
          )
          const newSnakeDotElement = createNewSnakeDot(snakeType, { x: newSnakeDot.x, y: newSnakeDot.y });
          this.body.push(newSnakeDot);
          this.snakeElement.appendChild(newSnakeDotElement);
        }
      }
      else {
        for (let i = 1; i <= score; i++) {  
          const newSnakeDot = new Square(
            currentBody[i - 1].x + (currentDirection === "LEFT" ? snakeDotSize : -snakeDotSize),
            currentBody[i - 1].y, 
            snakeDotSize / 2
          )
          const newSnakeDotElement = createNewSnakeDot(snakeType, { x: newSnakeDot.x, y: newSnakeDot.y });
          this.body.push(newSnakeDot);
          this.snakeElement.appendChild(newSnakeDotElement);
        }
      }
    }
    else {
      const lastSnakeDotIndex = snakeSize - 1;
      const ldx = currentBody[lastSnakeDotIndex - 1].x - currentBody[lastSnakeDotIndex].x;
      const ldy = currentBody[lastSnakeDotIndex - 1].y - currentBody[lastSnakeDotIndex].y;
      if ((ldy > 0 && ldx === 0) || (ldy < 0 && ldx === 0)) {
        for (let i = snakeSize; i < snakeSize + score; i++) {
          const newSnakeDot = new Square(currentBody[i - 1].x, currentBody[i - 1].y + (ldy > 0 ? -snakeDotSize : snakeDotSize), snakeDotHalfSize)
          const newSnakeDotElement = createNewSnakeDot(snakeType, { x: newSnakeDot.x, y: newSnakeDot.y });
          this.body.push(newSnakeDot);
          this.snakeElement.appendChild(newSnakeDotElement);
        }
      }
      else if ((ldx > 0 && ldy === 0) || (ldx < 0 && ldy === 0)) {
        for (let i = snakeSize; i < snakeSize + score; i++) {
          const newSnakeDot = new Square(currentBody[i - 1].x + (ldx > 0 ? -snakeDotSize : snakeDotSize), currentBody[i - 1].y, snakeDotHalfSize);
          const newSnakeDotElement = createNewSnakeDot(snakeType, { x: newSnakeDot.x, y: newSnakeDot.y });
          this.body.push(newSnakeDot);
          this.snakeElement.appendChild(newSnakeDotElement);
        }
      }
    }

  }

  updateSnakeDots(axis, speed) {
    const currentBody = this.body; 
    for (let i = currentBody.length - 1; i >= 0; i--) {
      if (i > 0) currentBody[i].setCoord(currentBody[i - 1].x, currentBody[i - 1].y);
      else {
        if (axis === "X") currentBody[i].setCoord(currentBody[i].x + speed, currentBody[i].y); 
        else currentBody[i].setCoord(currentBody[i].x, currentBody[i].y + speed); 
      }
    }
  }

  checkDirection() {
    switch (this.direction) {
      case "UP": {
        this.updateSnakeDots("Y", -snakeDotSize);
        break;
      }
      case "DOWN": {
        this.updateSnakeDots("Y", snakeDotSize);
        break;
      }
      case "LEFT": {
        this.updateSnakeDots("X", -snakeDotSize);
        break;
      }
      case "RIGHT": {
        this.updateSnakeDots("X", snakeDotSize);
        break;
      }
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
    return (
      (xHead - snakeDotHalfSize <= 0 && direction === "LEFT") || 
      (xHead + snakeDotHalfSize >=(mainWindowWidth - snakeDotHalfSize) && direction === "RIGHT") || 
      (yHead - snakeDotHalfSize <= 0 && direction === "UP") ||
      (yHead + snakeDotHalfSize >= (mainWindowHeight - snakeDotHalfSize) && direction === "DOWN") 
    );
  }

  isHitAnother(enemySnake) {
    const enemySnakeBody = enemySnake.body;
    const { body, direction } = this;
    const { x: xHead, y: yHead } = body[0];
    for (let i = 0; i < enemySnakeBody.length; i++) {
      if (((direction === "LEFT" && xHead - enemySnakeBody[i].x > 0) || (direction === "RIGHT" && xHead - enemySnakeBody[i].x < 0)) && Math.abs(xHead - enemySnakeBody[i].x) < snakeDotSize + 3 && Math.abs(yHead - enemySnakeBody[i].y) < snakeDotSize + 3)
        return true;
      if (((direction === "UP" && yHead - enemySnakeBody[i].y > 0) || (direction === "DOWN" && yHead - enemySnakeBody[i].y < 0)) && Math.abs(yHead - enemySnakeBody[i].y) < snakeDotSize + 3 && Math.abs(xHead - enemySnakeBody[i].x) < snakeDotSize + 3)
        return true;
    }
    return false;
    // return !!enemySnakeBody.find((snakeDot) => (
    //   (((direction === "LEFT" && xHead - snakeDot.x > 0) || 
    //     (direction === "RIGHT" && xHead - snakeDot.x < 0)) &&
    //     Math.abs(xHead - snakeDot.x) < snakeDotSize && 
    //     Math.abs(yHead - snakeDot.y) < snakeDotSize) ||
    //   (((direction === "UP" && yHead - snakeDot.y > 0) || 
    //     (direction === "DOWN" && yHead - snakeDot.y < 0)) &&
    //     Math.abs(yHead - snakeDot.y) < snakeDotSize && 
    //     Math.abs(xHead - snakeDot.x) < snakeDotSize)
    // ));
  }

  isEatAnother(enemySnake) {
    const { body, direction } = this;
    const bodyLength = body.length;
    const { x: xHead, y: yHead } = body[0];
    const enemySnakeBody = enemySnake.body; 
    const enemySnakeBodyLength = enemySnakeBody.length;
    const enemySnakeDirection = enemySnake.direction; 
    const { x: enemyXHead, y: enemyYHead } = enemySnakeBody[0];
    return (
      bodyLength > enemySnakeBodyLength && 
      Math.abs(xHead - enemyXHead) < snakeDotSize && 
      Math.abs(yHead - enemyYHead) < snakeDotSize && 
      ((direction === "LEFT" && enemySnakeDirection === "RIGHT") || (direction === "RIGHT" && enemySnakeDirection === "LEFT") || (direction === "UP" && enemySnakeDirection === "DOWN") || (direction === "DOWN" && enemySnakeDirection === "UP"))
    );
  }
}

class CountdownTimer {
  constructor(m, s) {
      this.m = m;
      this.s = s;
  }
  handleCountdown() {
    if (this.s === 0) {
      this.s = 59;
      this.m -= 1;
      return;
    }
    this.s -= 1;
  }
}

class Game {
  constructor() {
    this.run();
  }
  run() {

    let mainIntervalID, timeIntervalID;
    let fsLosed, wsLosed; 
    
    const FSstartPoint = {
      x: 50, 
      y: 50
    }
    const fs = new Snake(FSstartPoint, fsElement, "FIRE_SNAKE");
    fs.snakeElement.appendChild(createNewSnakeDot(fs.type, { x: fs.body[0].x, y: fs.body[0].y }));
    
    const WSstartPoint = {
      x: 350, 
      y: 350
    }
    const ws = new Snake(WSstartPoint, wsElement, "WATER_SNAKE", "LEFT"); 
    ws.snakeElement.appendChild(createNewSnakeDot(ws.type, { x: ws.body[0].x, y: ws.body[0].y })); 

    let fsCurrentLength = fs.body.length;
    let wsCurrentLength = ws.body.length;

    const foodStartPoint = {
      x: 400,
      y: 400
    };

    const food = new Square(foodStartPoint.x, foodStartPoint.y, randInRange(4, 12)); 
    const foodElement = document.getElementById("food"); 
    foodElement.style.setProperty("width", `${food.radius * 2}px`);
    foodElement.style.setProperty("height", `${food.radius * 2}px`);
    foodElement.style.setProperty("top", `${food.y}px`);
    foodElement.style.setProperty("left", `${food.x}px`);
    foodElement.style.setProperty("background-color", "#fff");
    mainWindowElement.appendChild(foodElement);

    function listenKeyPress(e) {
      switch (e.key) {
        case "ArrowUp": {
          if (ws.direction !== "UP" && ws.direction !== "DOWN") ws.direction = "UP"; 
          break;
        }
        case "ArrowDown": {
          if (ws.direction !== "UP" && ws.direction !== "DOWN") ws.direction = "DOWN";
          break;
        }
        case "ArrowLeft": {
          if (ws.direction !== "LEFT" && ws.direction !== "RIGHT") ws.direction = "LEFT";
          break;
        }
        case "ArrowRight": {
          if (ws.direction !== "LEFT" && ws.direction !== "RIGHT") ws.direction = "RIGHT";
          break;
        }
        case "w": {
          if (fs.direction !== "UP" && fs.direction !== "DOWN") fs.direction = "UP"; 
          break;
        }
        case "s": {
          if (fs.direction !== "UP" && fs.direction !== "DOWN") fs.direction = "DOWN";
          break;
        }
        case "a": {
          if (fs.direction !== "LEFT" && fs.direction !== "RIGHT") fs.direction = "LEFT";
          break;
        }
        case "d": {
          if (fs.direction !== "LEFT" && fs.direction !== "RIGHT") fs.direction = "RIGHT";
          break;
        }
      }
    }

    window.addEventListener("keydown", listenKeyPress);

    const timer = new CountdownTimer(1, 10);
    timeIntervalID = setInterval(() => {
      const minutes = timer.m < 10 ? `0${timer.m}` : timer.m;
      const seconds = timer.s < 10 ? `0${timer.s}` : timer.s;
      countdownTimeElement.innerHTML = `${minutes}:${seconds}`;
      if (timer.m === 0 && timer.s === 0) {
        alertElement.style.setProperty("display", "flex");
        alertElement.innerHTML = fs.body.length > ws.body.length ? "FIRE SNAKE WIN" : (fs.body.length < ws.body.length ? "WATER SNAKE WIN" : "DRAW");
        clearInterval(timeIntervalID);
        clearInterval(mainIntervalID);
        return;
      }
      timer.handleCountdown();
    }, 1000);

    mainIntervalID = setInterval(() => {
      fs.catchFood(food); 
      if (fs.body.length > fsCurrentLength) {
        fsScoreElement.innerHTML = fs.body.length.toString();
        fsCurrentLength = fs.body.length; 
        const newFoodRadius = randInRange(4, 12);
        food.setCoord(
          randInRange(30, mainWindowWidth - 100),
          randInRange(30, mainWindowHeight - 100)   
        );
        food.setRadius(newFoodRadius);
        foodElement.style.setProperty("width", `${food.radius * 2}px`);
        foodElement.style.setProperty("height", `${food.radius * 2}px`);
        foodElement.style.setProperty("top", `${food.y}px`);
        foodElement.style.setProperty("left", `${food.x}px`);
      }
      else {
        ws.catchFood(food);
        if (ws.body.length > wsCurrentLength) {
          wsScoreElement.innerHTML = ws.body.length.toString();
          wsCurrentLength = ws.body.length; 
          const newFoodRadius = randInRange(4, 12);
          food.setCoord(
            randInRange(30, mainWindowWidth - 100),
            randInRange(30, mainWindowHeight - 100)
          );
          food.setRadius(newFoodRadius);
          foodElement.style.setProperty("width", `${food.radius * 2}px`);
          foodElement.style.setProperty("height", `${food.radius * 2}px`);
          foodElement.style.setProperty("top", `${food.y}px`);
          foodElement.style.setProperty("left", `${food.x}px`);
        }
      }

      wsLosed = fs.isEatAnother(ws) || ws.isHitWall() || ws.isHitItself() || ws.isHitAnother(fs);
      fsLosed = ws.isEatAnother(fs) || fs.isHitWall() || fs.isHitItself() || fs.isHitAnother(ws);
      if (fsLosed || wsLosed) {
        alertElement.style.setProperty("display", "flex");
        alertElement.innerHTML = fsLosed ? "WATER SNAKE WIN" : "FIRE SNAKE WIN";
        window.removeEventListener("keydown", listenKeyPress);
        clearInterval(timeIntervalID);
        clearInterval(mainIntervalID); 
        return; 
      }
      fs.checkDirection();
      ws.checkDirection(); 
      renderSnakeDots(fs, fs.snakeElement);
      renderSnakeDots(ws, ws.snakeElement); 
    }, 80);
  }
}

const game = new Game();




