const G = 650;

class Object {
  constructor(color, mass){
    this.color = color;
    var objectElement = document.createElement('IMG');
    objectElement.setAttribute('src', 'images/sun.png');
    objectElement.id = color;
    document.getElementById('container').appendChild(objectElement);
  }

  initialize = (initialPosX, initialPosY) => {
    cancelAnimationFrame(this.currentAnimation);
    this.currentAnimation = null;
    this.object = document.getElementById(this.color);
    this.time = 0;
    this.posX = initialPosX;
    this.posY = initialPosY;  
    this.velocityX = 0;
    this.velocityY = 0;
    this.accelerationX = 0;
    this.accelerationY = 0;
    this.object.style.position = 'absolute';
    this.object.style.bottom = initialPosY + 'px';
    this.object.style.left = initialPosX + 'px';
    this.object.style.width = this.width + 'px';
    this.object.style.height = this.height + 'px';
    this.object.style.borderRadius = '50%';
  }
}


class ShotObject extends Object {
  constructor(props){
    super(props);
  }

  obliqueShot = (initialVelocity, angle) => { //module of initial velocity and angle from the horizontal axis to the positives of the vertical axes
    this.initialVelocityX = initialVelocity * Math.cos(angle * 3.14 / 180);
    this.initialVelocityY = initialVelocity * Math.sin(angle * 3.14 / 180);
    this.animation = () => {
      this.time += 1;
      var currentPosX = this.getMruPosX(this.initialPosX, this.initialVelocityX, this.time);
      var currentPosY = this.getMruvPosY(this.initialPosY, this.initialVelocityY, this.accelerationY, this.time);
      this.object.style.left = currentPosX + 'px';
      this.object.style.bottom = currentPosY + 'px';
      this.currentAnimation = requestAnimationFrame(this.animation);
    }
    this.animation();
  }

  getMruPosX = (initialPosX, initialVelocityX, time) => {
    return initialPosX + initialVelocityX * time;
  }
  getMruvPosY = (initialPosY, initialVelocityY, accelerationY, time) => {
    return initialPosY + initialVelocityY * time + (accelerationY/2) * Math.pow(time, 2);
  }
}

class MovementObject extends Object {
  constructor(props){
    super(props);
    this.pressedKeys = {};
    this.initializeEventHandler();
  }

  initializeEventHandler = () => {
    document.addEventListener('keydown', this.handleInteraction, false);
    document.addEventListener('keyup', this.keysReleased, false);
  }

  handleInteraction = (e) => {
    this.pressedKeys[e.key] = true;
  }

  keysReleased = (e) => {
    this.pressedKeys[e.key] = false;
  }

  handleMovement = () => { 
    this.animation = () => {
       if(this.object){
        this.updatePosX();
        this.updatePosY();
        this.applyFriction();
        this.object.style.left = this.posX + 'px';
        this.object.style.bottom = this.posY + 'px';
       } 
      this.currentAnimation = requestAnimationFrame(this.animation);
    }
    this.animation();
  }

  applyFriction = () => {
    if(this.velocityX > 0){
      this.velocityX -= 1.5;
    }
    if(this.velocityX < 0){
      this.velocityX += 1.5;
    }
    if(this.velocityY > 0){
      this.velocityY -= 1.5;
    }
    if(this.velocityY < 0){
      this.velocityY += 1.5;
    }
  }

  updatePosX = () => {
    if(this.pressedKeys['ArrowLeft']) {
      this.velocityX -= 3;
    }
    if(this.pressedKeys['ArrowRight']) {
      this.velocityX += 3;
    }
    this.posX += this.velocityX;
  }
  updatePosY = () => {
    if(this.pressedKeys['ArrowUp']) {
      this.velocityY += 3;
    }
    if(this.pressedKeys['ArrowDown']) {
      this.velocityY -= 3;
    }
    this.posY += this.velocityY;
  }
}


class GravitationalObject extends Object {
  constructor(color, mass){
    super(color);
    this.mass = mass;
    this.width = mass * 5;
    this.height = mass * 5;
  }
  addGravitationalCenter = (gravitationalCenter) => {
    this.gravitationalCenter = gravitationalCenter;
  }
  calculateGravitationalForce = (gravitationalCenter) => {
    const squaredDistance = Math.pow(this.posX - gravitationalCenter.posX, 2) + Math.pow(this.posY - gravitationalCenter.posY, 2);
    return G * this.mass * gravitationalCenter.mass / squaredDistance;
  }
  handleMovement = () => {
    this.animation = () => {
      if(this.isCollisioned(this.gravitationalCenter)) {
        this.velocityX = 0;
        this.velocityY = 0;
        this.accelerationX = 0;
        this.accelerationY = 0;
      } else {
      const acceleration = this.calculateGravitationalForce(this.gravitationalCenter) / this.mass;
      const directionX = this.gravitationalCenter.posX - this.posX > 0 ? 'right' : 'left';
      const directionY = this.gravitationalCenter.posX - this.posX > 0 ? 'up' : 'down';
      const angle = Math.atan((this.gravitationalCenter.posY - this.posY) / (this.gravitationalCenter.posX - this.posX));
      this.accelerationX = acceleration * (directionX === 'right' ? Math.cos(angle) : -Math.cos(angle));
      this.accelerationY = acceleration * (directionX === 'right' ? Math.sin(angle) : -Math.sin(angle));
      }
      this.updatePosX();
      this.updatePosY();
      this.object.style.left = this.posX + 'px';
      this.object.style.bottom = this.posY + 'px';
      this.currentAnimation = requestAnimationFrame(this.animation);
    }
    this.animation();
  }
  updatePosX = () => {
    this.velocityX += this.accelerationX;
    this.posX += this.velocityX;
  }
  updatePosY = () => {
    this.velocityY += this.accelerationY;
    this.posY += this.velocityY;
  }
  isCollisioned = (gravitationalCenter) => {
    if (this.posX < gravitationalCenter.posX + gravitationalCenter.width &&
      this.posX + this.width > gravitationalCenter.posX &&
      this.posY < gravitationalCenter.posY + gravitationalCenter.height &&
      this.height + this.posY > gravitationalCenter.posY) {
       return true;
   }
   return false;
  }
}

class GravitationalCenter extends GravitationalObject {
  constructor(color, mass){
    super(color);
    this.mass = mass;
    this.width = mass * 5;
    this.height = mass * 5;
  }
  initialize = (initialPosX, initialPosY) => {
    cancelAnimationFrame(this.currentAnimation);
    this.currentAnimation = null;
    this.object = document.getElementById(this.color);
    this.time = 0;
    this.posX = window.innerWidth / 2 - this.width / 2;
    this.posY =  window.innerHeight / 2 - this.height / 2;  
    this.velocityX = 0;
    this.velocityY = 0;
    this.accelerationX = 0;
    this.accelerationY = 0;
    this.object.style.position = 'absolute';
    this.object.style.bottom = this.posY + 'px';
    this.object.style.left = this.posX + 'px';
    this.object.style.width = this.width + 'px';
    this.object.style.height = this.height + 'px';
    this.object.style.borderRadius = '50%';
    //this.object.style.backgroundColor = this.color;
  }
}

class GravitationalOrbiter extends GravitationalObject {
  constructor(color, mass, planetName){
    super(color);
    this.mass = mass;
    this.width = mass * 5;
    this.height = mass * 5;
    this.planetName = planetName;
  }

  initialize = (initialPosX, initialPosY, initialVelocityY, initialVelocityX, gravitationalCenter) => {
    this.addGravitationalCenter(gravitationalCenter);
    cancelAnimationFrame(this.currentAnimation);
    this.currentAnimation = null;
    this.object = document.getElementById(this.color);
    this.time = 0;
    this.posX = gravitationalCenter.posX - initialPosX;
    this.posY = gravitationalCenter.posY + initialPosY;  
    this.velocityX = initialVelocityX;
    this.velocityY = initialVelocityY;
    this.accelerationX = 0;
    this.accelerationY = 0;
    this.object.style.position = 'absolute';
    this.object.style.bottom = initialPosY + 'px';
    this.object.style.left = initialPosX + 'px';
    this.object.style.width = this.width + 'px';
    this.object.style.height = this.height + 'px';
    this.object.setAttribute('src', 'images/' + this.planetName + '.png');
    this.object.style.borderRadius = '50%';
    this.handleMovement();
  }
}


class Simulation {
  constructor(){
    
    this.earth = new GravitationalOrbiter('blue', 3, 'earth');
    this.mars = new GravitationalOrbiter('yellow', 5, 'mars');
    this.jupiter = new GravitationalOrbiter('pink', 10, 'jupiter');
    this.gravitationalCenter = new GravitationalCenter('green', 22);
    this.restart();
  }
  restart = () => {
    document.removeEventListener('keydown', this.handleInteraction);
    document.addEventListener('keydown', this.handleInteraction);

    this.gravitationalCenter.initialize();

    this.earth.initialize(200, 0, 9, -2, this.gravitationalCenter);
    this.mars.initialize(0, 300, 1, 7, this.gravitationalCenter);
    this.jupiter.initialize(-350, 0, -6.5, 0, this.gravitationalCenter);
  }

  handleInteraction = (event) => {
    event.preventDefault();
    const keyName = event.key;
    switch(keyName.toLowerCase()){
      case 'r': 
        this.restart();
        break;
    } 
  }
  
}


var simulation = new Simulation();

