export const generate = (x, y, path, grid) => {
  let directions = generateDirectionOrder(x, y, grid);
  for(let direction of directions) {
    let order = generateSignOrderForDirection(x, y, direction, grid);
  }
}

const generateDirectionOrder = (x, y, grid) => {
  let order = [];
  for(let xOffset = -1;xOffset<=1;xOffset++) {
    for(let yOffset = -1;yOffset <= 1;yOffset++){
      if(xOffset==0&&yOffset==0) continue;
      if(followGridDirections(x, y, xOffset, yOffset, grid)) order.push([xOffset, yOffset])
    }
  }
  
  shuffleArray(order);
  return order;
}

const generateSignOrderForDirection = (x, y, direction, grid) => {
  let result = [];
  let find = true;
  
  for(let multiplier = 1; find ; multiplier++) {
    let newSignCords = [x+direction[0]*multiplier, y+direction[1]*multiplier];
    let newSign = followGridDirections(x, y, newSignCords[0], newSignCords[1], grid);
    if(newSign && !newSign.arrowDirection){
      result.push(newSignCords);
    }
    else find = false;
  }
  
  shuffleArray(result);
  return result;
}

const followGridDirections = (x, y, xOffset, yOffset, grid) => {
  if(grid[x+xOffset]?.[y+yOffset]){
    return grid[x+xOffset][y+yOffset];
  }
  return undefined;
}

const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
}
