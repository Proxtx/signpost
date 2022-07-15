import { random } from "./generate.js";

export const adjustGiven = (gameState, renderer) => {
  let searching = true;
  while (searching) {
    gameState.resetGame();
    let unknown = solve(gameState, renderer)
    if(gameState.hasWon()) searching = false;
    
    if(searching) {
      createGivenFromUnknown(unknown, gameState)
    }
  }
}

const createGivenFromUnknown = (unknown, gameState) => { 
  let isAlreadyIncluded = true;
  let pathIndex;
  console.log(JSON.stringify(unknown), "!!")
  
  while(isAlreadyIncluded) {
    let sign = random(0, unknown.length-1);
    let foundPathIndex;
    
    for(let matchingSignIndex in gameState.generateResult.path) {
      let pathSign = gameState.generateResult.path[matchingSignIndex];
      if(sign[0] == pathSign[0] && sign[1] == pathSign[1]) foundPathIndex = matchingSignIndex;
    }
    
    isAlreadyIncluded = false;
    for(let givenObj of gameState.given) {
      if(sign[0] == givenObj.sign[0] && sign[1] == givenObj.sign[1]) {
        isAlreadyIncluded = true;
      }
    }
    
    if(!isAlreadyIncluded) {
      pathIndex = foundPathIndex;
    }
  }
  
  console.log(pathIndex)
  
  gameState.given.push({
    sign: gameState.generateResult.path[pathIndex],
    number: pathIndex+1
  })
}

const solve = (gameState, renderer) => {
  console.log("solving")
  gameState.apply();
  
  let lastSaveState;
  let solving = true;
  let unknownSigns;
  while(solving){
    unknownSigns = solveStep(gameState)
    gameState.apply();
    let connectionSaveState = JSON.stringify(gameState.connections);
    if(lastSaveState == connectionSaveState) solving = false;
    lastSaveState = connectionSaveState;
  }
  renderer.render();
  return unknownSigns;
}

const solveStep = (gameState) => {
 let unknownSigns = [];
  
  for(let x in gameState.grid) {
    for(let y in gameState.grid[x]) {
      let pointingSigns = gameState.followSignDirection([x, y]);
      let possibleSigns = [];
      for(let sign of pointingSigns) {
        if(canHit([x, y], sign, gameState)) possibleSigns.push(sign)
      }
      unknownSigns = unknownSigns.concat(possibleSigns)
      
      if(possibleSigns.length == 1) 
        gameState.connect([x, y], possibleSigns[0])
    }
  }
  
  gameState.apply();
  
  for(let x in gameState.grid) {
    for(let y in gameState.grid[x]) {
      let pointedSigns = gameState.findPointedSigns([x, y]);
      let possibleSigns = [];
      for(let sign of pointedSigns) {
        if(canHit(sign, [x, y], gameState)) possibleSigns.push(sign)
      }
      
      unknownSigns = unknownSigns.concat(possibleSigns)
      if(possibleSigns.length == 1) 
        gameState.connect(possibleSigns[0], [x, y])
    }
  }
  
  return unknownSigns;
}

const canHit = (sign1, sign2, gameState) => {
  let sign1Obj = gameState.grid[sign1[0]][sign1[1]];
  let sign2Obj = gameState.grid[sign2[0]][sign2[1]];
  let sign1Connection = gameState.findConnection(sign1);
  let sign2Connection = gameState.findConnection(sign2);
  if(sign2Obj.pointed || sign1Obj.pointing) return false;
  else if(!gameState.hits(sign1, sign2)) return false;
  else if(sign1Connection && sign2Connection && sign1Connection.connection == sign2Connection.connection) return false;
  else if(sign1Connection && sign2Connection && sign1Connection.connection.type == "final" && sign2Connection.connection.type == "final" && Number(sign1Obj.text)+1 != Number(sign2Obj.text)) return false
  
  return true;
}
