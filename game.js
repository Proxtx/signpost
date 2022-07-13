export class GameState {
  gameStates = [
   [
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
    this.loadGameState();
    this.createGivenConnections();
    this.apply();
  }
  
  resetGrid () {
    for(let column of this.grid){
      for(let signIndex in column) {
        column[signIndex] = {...column[signIndex], ...this.resetDefault}
      }
    }
  }
  
  createGivenConnections () {
    for(let givenInfo of this.given){
      this.connections.push({
        type: "final",
        startAt: givenInfo.number,
        signs: [
          givenInfo.sign
          ]
      })
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
    }
  }
  
  applyConnections () {
    for(let connection of this.connections) {
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
  
  loadGameState () {
    this.connections = this.gameStates[this.gameStateIndex];
  }
  
  dulplicateGameState () {
    if(this.gameStateIndex < this.gameStates.length-1) this.gameStates.splice(this.gameStateIndex+1);
    this.gameStates.push(JSON.parse(JSON.stringify(this.gameStates[this.gameStateIndex])));
    this.gameStateIndex++;
  }
  
  undo (){
    if(this.gameStateIndex>0) this.gameStateIndex--;
  }
  
  redo() {
    if(this.gameStateIndex < this.gameStates.length-1) this.gameStateIndex++;
  }
  
  connect (sign1, sign2) {
    this.dulplicateGameState();
    if(!sign2) this.freeSign(sign1);
    else if(this.hits(sign1, sign2)){
      this.findAndExecuteConnectMethod(sign1, sign2)
    }
    
    this.deleteUnusedConnections();
  }
  
  findAndExecuteConnectMethod (sign1, sign2) {
    let find1 = this.findConnection(sign1);
    let find2 = this.findConnection(sign2);
    
    if(!find1 && !find2) this.createSubPath([sign1, sign2])
    else if(find1 && !find2) this.mergeConnections(find1.connection, this.createSubPath(sign2), find1.index, 0)
    else if(!find1 && find2) this.mergeConnections(this.createSubPath(sign1), find2.connection, 0, find2.index)
    else if(find1 && find2) this.mergeConnections(find1.connection, find2.connection, find1.index, find2.index)
    
  }
  
  findConnection (sign) {
    for(let connection of this.connections) {
      for(let signOfConnectionIndex in connection.signs) {
        let signOfConnection = connection.signs[signOfConnectionIndex];
        if(sign[0] == signOfConnection[0] && sign[1] == signOfConnection[1]) return {connection, index: Number(signOfConnectionIndex)};
      }
    }
    
    return null;
  }
  
  freeSign(sign) {
    let foundConnection = this.findConnection(sign);
    if(!foundConnection) return;
    this.splitConnection(1, this.splitConnection(foundConnection.index, foundConnection.connection))
  }
  
  mergeConnections (connection1, connection2, index1, index2) {
    let newConnection1 = this.splitConnection(index1+1, connection1);
    let newConnection2 = this.splitConnection(index2, connection2);
    if(connection1.type == "subPath" && newConnection2.type == "subPath") this.mergeSubPaths(connection1, newConnection2);
    else if (connection1.type == newConnection2.type) {
      return;
    }
    else if(connection1.type == "final") {
      this.mergeFromFinalConnection(connection1, newConnection2)
    }
    else {
      this.mergeOntoFinalConnection(newConnection2,  connection1)
    }
  }
  
  mergeOntoFinalConnection (finalConnection, subPath) {
    finalConnection.signs = subPath.signs.concat(finalConnection.signs);
    finalConnection.startAt -= subPath.signs.length;
    subPath.signs = [];
  }
  
  mergeFromFinalConnection (finalConnection, subPath) {
    finalConnection.signs = finalConnection.signs.concat(subPath.signs)
    subPath.signs = [];
  }
  
  mergeSubPaths (subPath1, subPath2) {
    let index;
    
    if(subPath1.signs.length >= subPath2.signs.length) {
      index = subPath1.index;
    }
    else {
      index = subPath2.index;
    }
    
    subPath1.signs = subPath1.signs.concat(subPath2.signs);
    subPath2.signs = [];
    subPath1.index = index;
  }
  
  splitConnection (split, connection) {
    switch (connection.type){
      case "final":
        return this.splitFinalConnection(split, connection);
        break;
      case "subPath":
        return this.splitSubPath(split, connection);
        break;
    }
  }
  
  splitFinalConnection (split, connection) {
    let splitSigns = connection.signs.splice(split);
    let splitIsFinal = this.signArrayIncludesGiven(splitSigns);
    let originalIsFinal = this.signArrayIncludesGiven(connection.signs);
    
    if(splitIsFinal && originalIsFinal) {
      return this.createFinalConnection(splitSigns)
    }
    else if(originalIsFinal) {
      return this.createSubPath(splitSigns);
    }
    else {
      let subPath = this.createSubPath(connection.signs);
      connection.signs = splitSigns;
      connection.startAt = this.evaluateStartNumerOfFinalConnection(splitSigns);
      return connection;
    }
    
  }
  
  signArrayIncludesGiven (signs) {
    for(let signCoords of signs) {
      if(this.grid[signCoords[0]][signCoords[1]].given){
        return true;
      }
    }
    
    return false;
  }
  
  createFinalConnection (signs) {
    if(!Array.isArray(signs[0])) signs = [signs];
    let startAt = this.evaluateStartNumerOfFinalConnection(signs);
    let connection = {
      type: "final",
      startAt,
      signs
    }
    this.connections.push(connection)
    
    return connection;
  }
  
  evaluateStartNumerOfFinalConnection (signs) {
    for(let signCoordsIndex in signs) {
      let signCoords = signs[signCoordsIndex];
      let sign = this.grid[signCoords[0]][signCoords[1]]
      if(sign.given) return sign.text - signCoordsIndex;
    }
  }
  
  splitSubPath(split, connection) {
    let splitSigns;
    if(connection.signs.length - split > split) {
      splitSigns = connection.signs.splice(0, split)
      this.createSubPath(splitSigns);
      return connection;
    }
    else {
      splitSigns = connection.signs.splice(split);
      return this.createSubPath(splitSigns)
    }
  }
  
  createSubPath (signs, customIndex) {
    if(!Array.isArray(signs[0])) signs = [signs];
    let index = customIndex ? customIndex : this.findSmallesSubPathIndex();
    let connection = {
      type: "subPath",
      index,
      signs
    }
    this.connections.push(connection)
    return connection;
  }
  
  findSmallesSubPathIndex () {
    let smallest = 0;
    let searching = true;
    while(searching) {
      let found = false;
      for(let connection of this.connections) {
        if(connection.type == "subPath" && connection.index == smallest) {
          smallest++;
          found = true;
          break;
        }
      }
      if(!found) searching = false;
    }
    
    return smallest;
  }
  
  deleteUnusedConnections () {
    for(let connectionIndex = 0; connectionIndex < this.connections.length;connectionIndex++) {
      let connection = this.connections[connectionIndex];
      if(connection.signs.length > 1) continue;
      if(connection.type == "subPath") {
        this.connections.splice(connectionIndex, 1);
        connectionIndex--;
      }
      
      else if(!this.signArrayIncludesGiven(connection.signs)) {
        this.connections.splice(connectionIndex, 1)
        connectionIndex--;
      }
    }
  }
  
  hits (sign1, sign2) {
    let hits = false;
    let multiplier = 1;
    let arrowDirection = this.grid[sign1[0]][sign1[1]].arrowDirection;
    
    if(!arrowDirection) return false;
    
    while(true) {
      let coords = [sign1[0]+multiplier*arrowDirection[0], sign1[1]+multiplier*arrowDirection[1]];
      if(!this.grid[coords[0]]?.[coords[1]]) break;
      if(coords[0] == sign2[0] && coords[1] == sign2[1]) {
        hits = true;
        break;
      }
      
      multiplier++;
    }
    
    return hits;
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
    
    if(!this.activeSign) return;
    
    this.gameState.highlight = {
      type: this.type,
      signCoords: this.activeSign
    }
      
    if(this.type == "pointed")
      navigator.vibrate(50)
    this.display();
  }
  
  interactionMove () {
    if(!this.activeSign) return;
  }
  
  interactionEnd () {
    this.gameState.highlight = null;
    if(this.activeSign){
      this.gameState.connect(this.activeSign, this.evaluateSign(this.interaction.x, this.interaction.y))
    }
    this.display();
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
  startX = null;
  startY = null;
  
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
