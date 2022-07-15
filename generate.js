export const generatePath = (x, y, path, grid) => {
  path.push([x, y]);
  grid[x][y].text = path.length;

  if (grid.length * grid[0].length <= path.length) {
    delete grid[x][y].arrowDirection;
    return true;
  }

  grid[x][y].currentlyGenerating = true;

  let signs = generatePossibleSigns(x, y, grid);
  for (let sign of signs) {
    grid[x][y].arrowDirection = sign.direction;
    if (generatePath(sign.sign[0], sign.sign[1], path, grid)) {
      delete grid[x][y].currentlyGenerating;
      return true;
    }
  }

  delete grid[x][y].currentlyGenerating;

  path.pop();
  return false;
};

export const generateGrid = (width, height, corners) => {
  let grid = [];
  for (let x = 0; x < width; x++) {
    grid.push([]);
    for (let y = 0; y < height; y++) {
      grid[x].push({});
    }
  }

  let startX = 0;
  let startY = 0;
  if (!corners) {
    startX = random(0, width - 1);
    startY = random(0, height - 1);
  }
  let path;
  let found = false;
  while (!found) {
    path = [];
    generatePath(startX, startY, path, grid);
    let lastSign = path[path.length - 1];
    if (!corners || (lastSign[0] == width - 1 && lastSign[1] == height - 1)) {
      found = true;
    }
  }

  return {
    grid,
    path,
    given: [
      { sign: path[0], number: 1 },
      { sign: path[path.length - 1], number: path.length },
    ],
  };
};

const generatePossibleSigns = (x, y, grid) => {
  let result = [];

  let directions = generateDirectionOrder(x, y, grid);
  for (let direction of directions) {
    let signs = generateSignOrderForDirection(x, y, direction, grid);
    for (let sign of signs) {
      result.push({ direction, sign });
    }
  }

  shuffleArray(result);
  return result;
};

const generateDirectionOrder = (x, y, grid) => {
  let order = [];
  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      if (xOffset == 0 && yOffset == 0) continue;
      if (followGridDirections(x, y, xOffset, yOffset, grid))
        order.push([xOffset, yOffset]);
    }
  }

  shuffleArray(order);
  return order;
};

const generateSignOrderForDirection = (x, y, direction, grid) => {
  let result = [];
  let find = true;

  for (let multiplier = 1; find; multiplier++) {
    let newSignCords = [
      x + direction[0] * multiplier,
      y + direction[1] * multiplier,
    ];
    let newSign = grid[newSignCords[0]]?.[newSignCords[1]];
    if (newSign) {
      if (!newSign.currentlyGenerating) {
        result.push(newSignCords);
      }
    } else find = false;
  }

  shuffleArray(result);
  return result;
};

const followGridDirections = (x, y, xOffset, yOffset, grid) => {
  if (grid[x + xOffset]?.[y + yOffset]) {
    return grid[x + xOffset][y + yOffset];
  }
  return undefined;
};

export const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};
