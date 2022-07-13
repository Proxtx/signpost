export class GameState {
  gameStates = [
   [
      {
        type: "subPath",
        index: 0,
        signs: [
          [0, 1], [0, 2], [0, 3]
          ]
      },
      {
        type: "final",
        startAt: 5,
        signs: [
            [1, 1], [1, 2], [1, 3]
          ]
      }
    ]
  ]
  
  gameStateIndex = 0;
    
    highlight = null;
    
    resetDefault = {
      text: "",
      pointing: false,
      pointed: false,
      final: false,
      error: false,
      dim: false,
      active: false,
      subPathIndex: false,
      given: false
    }
    
    subPathIndexTranslator = "abcdefghijklmnopqrstuvwxyz".split("");
  
  constructor (generateResult){
    this.generateResult = generateResult;
    this.grid = this.generateResult.grid;
    this.given = this.generateResult.given;
    this.apply();
  }
  
  resetGrid () {
    for(let column of this.grid){
      for(let signIndex in column) {
        column[signIndex] = {...column[signIndex], ...this.resetDefault}
      }
    }
  }
  
  apply () {
    this.resetGrid();
    
    this.applyHighlight();
    this.applyConnections();
    this.applyGiven();
  }
  
  applyHighlight () {
    if(!this.highlight) return;
    switch (this.highlight.type) {
      case "pointing":
        this.applyPointingHighlight(this.highlight.signCoords);
        break;
      case "pointed":
        this.applyPointedHighlight(this.highlight.signCoords)
    }
  }
  
  applyPointingHighlight (signCoords) {
    this.applyDim();
    this.grid[signCoords[0]][signCoords[1]].dim = false;
    let pointedSigns = this.followSignDirection(signCoords);
    
    for(let pointedSignCoords of pointedSigns) {
      this.grid[pointedSignCoords[0]][pointedSignCoords[1]].dim = false;
    }
  }
  
  applyPointedHighlight (signCoords) {
    this.applyDim();
    this.grid[signCoords[0]][signCoords[1]].dim = false;
    for(let x in this.grid){
      for(let y in this.grid[x]){
        let pointedSigns = this.followSignDirection([x, y]);
        for(let pointedSign of pointedSigns){
          if(pointedSign[0] == signCoords[0] && pointedSign[1] == signCoords[1]) this.grid[x][y].dim = false;
        }
      }
    }
  }
  
  applyDim () {
    for(let column of this.grid){
      for(let sign of column) {
        sign.dim = true;
      }
    }
  }
  
  applyGiven () {
    for(let given of this.given) {
      let sign = this.grid[given.sign[0]][given.sign[1]];
      sign.given = true;
      sign.text = given.number;
      sign.final = true;
    }
  }
  
  applyConnections () {
    for(let connection of this.gameStates[this.gameStateIndex]) {
      this.applyConnection(connection);
    }
  }
  
  applyConnection (connection) {
    for(let signCoordsIndex in connection.signs) {
      let signCoords = connection.signs[signCoordsIndex]
      let sign = this.grid[signCoords[0]][signCoords[1]]
      switch (connection.type) {
        case "subPath":
          sign.subPathIndex = connection.index;
          sign.text = this.subPathIndexTranslator[connection.index]
          if(signCoordsIndex>0) sign.text+= "+"+signCoordsIndex
          break
        
        case "final":
          sign.final = true;
          sign.text = connection.startAt + Number(signCoordsIndex);
          break;
      }
      
      if(signCoordsIndex > 0) sign.pointed = true;
      if(signCoordsIndex < connection.signs.length-1) sign.pointing = true
      
    }
  }
  
  followSignDirection (signCoords) {
    let result = [];
    let find = true;
    
    let x = Number(signCoords[0]);
    let y = Number(signCoords[1]);
    let direction = this.grid[x][y].arrowDirection;
    
    if(!direction) return result;
  
    for(let multiplier = 1; find ; multiplier++) {
      let newSignCords = [x+direction[0]*multiplier, y+direction[1]*multiplier];
      let newSign = this.grid[newSignCords[0]]?.[newSignCords[1]]
      if(newSign){
          result.push(newSignCords);
      }
      else find = false;
    }
    
    return result;
  }
}

export class Game {
  constructor (renderer, generateResult) {
    this.generateResult = generateResult;
    this.renderer = renderer;
    this.gameState = new GameState(this.generateResult);
    this.InteractionEngine = new InteractionEngine(this.renderer, this.gameState)
  }
}

export class InteractionEngine {
  
  type = null;
  startTile = null;
  
  constructor (renderer, gameState) {
    this.renderer = renderer;
    this.gameState = gameState;
    this.interaction = new Interaction(this.renderer.canvas);
    
    this.interaction.init = this.interactionInit.bind(this);
    this.interaction.move = this.interactionMove.bind(this);
    this.interaction.end = this.interactionEnd.bind(this);
  }
  
  interactionInit () {
    this.type = {long: "pointed", short: "pointing"}[this.interaction.type];
    this.activeSign = this.evaluateSign(this.interaction.startX, this.interaction.startY);
    
    this.gameState.highlight = {
      type: this.type,
      signCoords: this.activeSign
    }
      
    if(this.type == "pointed")
      navigator.vibrate(50)
    this.display();
  }
  
  interactionMove () {
    
  }
  
  interactionEnd () {
    this.gameState.highlight = null;
    this.display()
  }
  
  evaluateSign (x, y) {
    let xCoord = Math.floor((x-this.renderer.padding) / (this.renderer.borderSize + this.renderer.cellSize));
    
    let yCoord = Math.floor((y-this.renderer.borderSize*0.5-this.renderer.padding) / (this.renderer.borderSize + this.renderer.cellSize));
    
    if(this.gameState.grid[xCoord]?.[yCoord])
      return [xCoord, yCoord]
    
    return null;
  }
  
  display () {
    this.gameState.apply();
    this.renderer.render();
  }
}

export class Interaction {
  type = null;
  x = null;
  y = null;
  active = false;
  
  init = null;
  move = null;
  end = null;
  
  longPressDelay = 300;
  shortPressDist = 5;
  
  constructor (element) {
    this.element = element;
    this.element.addEventListener("touchstart", (e) => {
      const coords = this.getRelativeCoordinates(e.touches[0].clientX, e.touches[0].clientY);
      this.handleStart(coords[0], coords[1])
    })
    this.element.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const coords = this.getRelativeCoordinates(e.touches[0].clientX, e.touches[0].clientY);
      this.handleMove(coords[0], coords[1])
    })
    this.element.addEventListener("touchend", (e) => this.handleEnd())
    this.element.addEventListener("cancel", (e) => this.handleEnd())
  }
  
  getRelativeCoordinates(clientX, clientY) {
    const rect = this.element.getBoundingClientRect()
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    return [x, y];
  }
  
  handleStart (x, y){
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.active = true;
    
    this.timeout = setTimeout(() => this.activate("long"), this.longPressDelay);
  }
  
  handleMove (x, y) {
    this.x = x;
    this.y = y;
    
    if(this.type) return this.move && this.move(this);
    
    let dist = Math.sqrt((this.x-this.startX)^2 + (this.y-this.startY)^2);
    
    if(dist > this.shortPressDist) return;
    this.activate("short")
  }
  
  handleEnd () {
    this.type = null;
    this.active = null;
    clearTimeout(this.timeout)
    this.end && this.end(this)
  }
  
  activate (type) {
    if(this.type) return;
    clearTimeout(this.timeout)
    this.type = type;
    this.init && this.init(this);
  }
}
