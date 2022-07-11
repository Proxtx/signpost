export const generatePath = (x, y, path, grid) => {
  path.push([x, y])
  grid[x][y].text = path.length;
  
  if(grid.length * grid[0].length <= path.length) return true;
  let directions = generateDirectionOrder(x, y, grid);
  for(let direction of directions) {
    grid[x][y].arrowDirection = direction;
    let signs = generateSignOrderForDirection(x, y, direction, grid);
    for(let sign of signs) {
      if(generatePath(sign[0], sign[1], path, grid)) return true;
    }
    
    delete grid[x][y].arrowDirection;
  }
  
  path.pop();
  return false;
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
    let newSign = grid[newSignCords[0]]?.[newSignCords[1]]
    if(newSign){
      if(!newSign.arrowDirection){
        result.push(newSignCords);
      }
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
