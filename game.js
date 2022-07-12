export class Game {
  connections = [
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
    
    highlight = {
      type: "pointed",
      signCoords: [2, 2]
    }
    
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
  
  constructor (render, generateResult){
    this.generateResult = generateResult;
    this.render = render;
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
    for(let givenSignCoords of this.given) {
      this.grid[givenSignCoords[0]][givenSignCoords[1]].given = true
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
}
