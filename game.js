export class Game {
  connections = [
      {
        type: "subPath",
        index: 0,
        signs: [
          [0, 1], [0, 2], [0, 3]
          ]
      }
    ]
    
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
    
    this.applyConnections();
    this.applyGiven();
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
      }
      
      if(signCoordsIndex > 0) sign.pointed = true;
      if(signCoordsIndex < connection.signs.length-1) sign.pointing = true
      
    }
  }
}
