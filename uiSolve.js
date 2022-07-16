export const solve = async (gameState, renderer) => {
  gameState.apply();

  let lastSaveState;
  let solving = true;
  while (solving) {
    await solveStep(gameState, renderer);
    gameState.apply();
    let connectionSaveState = JSON.stringify(gameState.connections);
    if (lastSaveState == connectionSaveState) solving = false;
    lastSaveState = connectionSaveState;
  }
};

const solveStep = async (gameState, renderer) => {
  for (let x in gameState.grid) {
    for (let y in gameState.grid[x]) {
      renderer.render();
      let pointingSigns = gameState.followSignDirection([x, y]);
      let possibleSigns = [];
      for (let sign of pointingSigns) {
        if (canHit([x, y], sign, gameState)) possibleSigns.push(sign);
      }
      if (possibleSigns.length == 1) {
        await new Promise((r) => setTimeout(r, 200));
        gameState.connect([x, y], possibleSigns[0]);
      } else {
        for (let sign of possibleSigns) {
          if (
            Number(gameState.grid[x][y].text) + 1 ==
            Number(gameState.grid[sign[0]][sign[1]].text)
          ) {
            await new Promise((r) => setTimeout(r, 200));
            gameState.connect([x, y], sign);
          }
        }
      }

      gameState.apply();
    }
  }

  for (let x in gameState.grid) {
    for (let y in gameState.grid[x]) {
      renderer.render();
      let pointedSigns = gameState.findPointedSigns([x, y]);
      let possibleSigns = [];
      for (let sign of pointedSigns) {
        if (canHit(sign, [x, y], gameState)) possibleSigns.push(sign);
      }
      if (possibleSigns.length == 1) {
        await new Promise((r) => setTimeout(r, 200));
        gameState.connect(possibleSigns[0], [x, y]);
      }

      gameState.apply();
    }
  }
};

const canHit = (sign1, sign2, gameState) => {
  let sign1Obj = gameState.grid[sign1[0]][sign1[1]];
  let sign2Obj = gameState.grid[sign2[0]][sign2[1]];
  let sign1Connection = gameState.findConnection(sign1);
  let sign2Connection = gameState.findConnection(sign2);
  if (sign2Obj.pointed || sign1Obj.pointing) return false;
  else if (!gameState.hits(sign1, sign2)) return false;
  else if (
    sign1Connection &&
    sign2Connection &&
    sign1Connection.connection == sign2Connection.connection
  )
    return false;
  else if (
    sign1Connection &&
    sign2Connection &&
    sign1Connection.connection.type == "final" &&
    sign2Connection.connection.type == "final" &&
    Number(sign1Obj.text) + 1 != Number(sign2Obj.text)
  )
    return false;

  return true;
};
