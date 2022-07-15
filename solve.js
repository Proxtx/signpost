import { random } from "./generate.js";

export const adjustGiven = async (gameState, renderer) => {
  let searching = true;
  let iteration = 0
  while (searching && iteration < 50) {
    gameState.resetGame();
    await solve(gameState, renderer)
    if(gameState.hasWon()) searching = false;
    
    if(searching) {
      createGivenFromUnknown(gameState)
    }
    
    iteration++;
  }
  gameState.apply();
  renderer.render();
}

const createGivenFromUnknown = (gameState) => { 
    let possibleSigns = [];
    
    for(let x in gameState.grid) {
      for(let y in gameState.grid[x]) {
        let sign = gameState.grid[x][y];
        if((!sign.pointed || !sign.pointing ) && !sign.final){
          possibleSigns.push([x, y])
        }
      }
    }
    
    if(possibleSigns.length < 1) return
    
    let sign
    let alreadyGiven = true;
    while(alreadyGiven) {
      sign = possibleSigns[random(0, possibleSigns.length-1)]
      
      alreadyGiven = false;
      for(let givenObj of gameState.given) {
        if(sign[0] == givenObj.sign[0] && sign[1] == givenObj.sign[1]) alreadyGiven = true;
      }
    }
    
    console.log(possibleSigns, gameState.hasWon(), sign)
    
    let pathIndex;
    for(let matchingSignIndex in gameState.generateResult.path) {
      let pathSign = gameState.generateResult.path[matchingSignIndex];
      if(sign[0] == pathSign[0] && sign[1] == pathSign[1]) pathIndex = matchingSignIndex;
    }
    
    gameState.given.push({
      sign, 
      number: Number(pathIndex)+1
    })
}

const solve = async (gameState, renderer) => {
  console.log("solving")
  gameState.apply();
  
  let lastSaveState;
  let solving = true;
  while(solving){
    solveStep(gameState)
    gameState.apply();
    let connectionSaveState = JSON.stringify(gameState.connections);
    if(lastSaveState == connectionSaveState) solving = false;
    lastSaveState = connectionSaveState;
  
  renderer.render();
  
  await new Promise(r => setTimeout(r, 1000))
  }
}

const solveStep = (gameState) => {
  for(let x in gameState.grid) {
    for(let y in gameState.grid[x]) {
      let pointingSigns = gameState.followSignDirection([x, y]);
      let possibleSigns = [];
      for(let sign of pointingSigns) {
        if(canHit([x, y], sign, gameState)) possibleSigns.push(sign)
      }
      if(possibleSigns.length == 1) 
        gameState.connect([x, y], possibleSigns[0])
      else {
        for(let sign of possibleSigns) {
          if(Number(gameState.grid[x][y].text)+1 == Number(gameState.grid[sign[0]][sign[1]].text)) {
            gameState.connect([x, y], sign)
          }
        }
      }
      
      gameState.apply()
    }
  }
  
  for(let x in gameState.grid) {
    for(let y in gameState.grid[x]) {
      let pointedSigns = gameState.findPointedSigns([x, y]);
      let possibleSigns = [];
      for(let sign of pointedSigns) {
        if(canHit(sign, [x, y], gameState)) possibleSigns.push(sign)
      }
      if(possibleSigns.length == 1) 
        gameState.connect(possibleSigns[0], [x, y])
        
      gameState.apply();
    }
  }
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
