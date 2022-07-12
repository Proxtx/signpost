const debugSign = {
  text: "a",
  arrowDirection: [1, 1], //or undefined
  pointing: true, //pointing at a sign
  pointed: true, //pointed at by a sign
  final: true, //is this a final "number" sign? Aka black sign
  error: false, //is there an error on the board including this sign?
  dim: false, //are there other signs highlighted?
  active: false, //is this sign active? aka edited / dragged
  subPathIndex: false, //is this a subpath (if not false ) then what index does it have
  given: true //Was this number given to the player aka number should blue
}

export class GridRenderer {
  borderSize = 2;
  colors = {
    borderColor: "#9C9E9C",
    plainSign: "#DEDFDE",
    signTextSubPath: "#000000",
    used: 0.45,
    unused_target: "#9C9A9C",
    subPathColors: ["#FF9E7B", "#94FB94", "#7BFFD6", "#946DDE", "#FFA600", "#84CEF7"],
    finalBackground: "#000000",
    error: "#FF0000",
    given: "#ADAAFF",
    givenUsed: "#4245EF"
  }
  
  arrowDirectionTranslator = {
    north: -90,
    northEast: -45,
    east: 0,
    southEast: 45,
    south: 90,
    southWest: 135,
    west: 180,
    northWest: -135
  }
  
  constructor (canvas, cellSize, grid, image) {
    this.canvas = canvas;
    this.cellSize = cellSize;
    this.grid = grid;
    this.image = image;
    this.arrowSize = this.cellSize / 1.7;
    this.canvasSetup();
  }
  
  canvasSetup () {
    this.canvas.width = this.grid.length*this.cellSize+this.borderSize * this.grid.length + this.borderSize;
    this.canvas.height = this.grid[0].length*this.cellSize+this.borderSize * this.grid[0].length + this.borderSize;
    
    this.ctx = this.canvas.getContext("2d");
    
    this.fontSize = this.cellSize / 2.8;
    this.ctx.font = this.fontSize + "px Arial";
  }
  
  render () {
    this.ctx.fillStyle = this.colors.borderColor;
    this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height)
    
    //this.grid[0][0] = debugSign;
    
    for(let indexRow in this.grid) {
      for(let indexColumn in this.grid[indexRow]){
        this.renderSign(this.grid[indexRow][indexColumn], indexRow, indexColumn)
      }
    }
  }
  
  renderSign (sign, xIndex, yIndex){
    let { x, y } = this.calculateCords(xIndex, yIndex);
    this.ctx.save();
    
    this.ctx.fillStyle = this.colors.plainSign;
    this.ctx.fillRect(x,y,this.cellSize,this.cellSize)
    
    if (sign.dim && !sign.final) {
      this.ctx.globalAlpha -= 0.6
    }
    
    this.renderSignBackground(sign, x, y)
    this.drawArrowOfSign(sign, x, y);
    this.drawPointedIndicator(sign, x, y)
    this.renderSignText(sign, x, y)
    
    this.ctx.restore();
  }
  
  renderSignText (sign, x, y) {
    if((sign.dim && sign.final) || !sign.text) return;
    this.ctx.save();
    
    if(sign.error) {
      this.ctx.fillStyle = this.colors.error;
    }
    else if(sign.given) {
      this.ctx.fillStyle = this.colors.given;
      
      if (sign.pointing && sign.pointed) {
        this.ctx.fillStyle = this.colors.givenUsed;
      }
    }
    else {
      if (sign.final){
        this.ctx.fillStyle = this.colors.unused_target;
      }
      else {
        this.ctx.fillStyle = this.colors.signTextSubPath;
      }
      
      if(sign.pointing && sign.pointed) this.ctx.globalAlpha -= this.colors.used;
    }
    
    this.ctx.fillText(sign.text, x+this.cellSize/7, y+this.fontSize)
    
    this.ctx.restore();
  }
  
  renderSignBackground (sign, x, y) {
    this.ctx.fillStyle = this.colors.plainSign;
    if (sign.final) this.ctx.fillStyle = this.colors.finalBackground;
    else if (sign.subPathIndex !== false) {
      this.ctx.fillStyle = this.colors.subPathColors[sign.subPathIndex]
    } 
    
    this.ctx.fillRect(x, y, this.cellSize, this.cellSize)
  }
  
  drawArrowOfSign (sign, x, y) {
    if(sign.dim && sign.final) return;
    this.ctx.save();
    if(sign.pointing) {
      this.ctx.globalAlpha -= this.colors.used;
    }
    
    if(sign.arrowDirection)
    this.drawArrow(x+this.arrowSize*1.3, y+this.arrowSize*1.3, this.arrowDirectionTranslator[this.compileArrowDirection(...sign.arrowDirection)]);
    
    this.ctx.restore();
  }
  
  drawPointedIndicator (sign, x, y) {
    
    if(sign.pointed || (sign.final && sign.dim)) return;
    let posX = x + this.cellSize/4;
    let posY = y + this.cellSize/4*3;
    
    this.ctx.fillStyle = this.colors.unused_target;
    this.ctx.beginPath()
    this.ctx.arc(posX, posY, this.cellSize/20, 0, 2 * Math.PI, false);
    this.ctx.fill();
  }
  
  drawArrow (x, y, deg) {
    let size = this.arrowSize;
    
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate((deg*Math.PI)/180);
    this.ctx.drawImage(this.image, -size/2, -size/2, size, size);
    this.ctx.restore();
  }
  
  calculateCords (x, y) {
    let xPos = x * this.cellSize + this.borderSize*x+this.borderSize;
    let yPos = y * this.cellSize + this.borderSize*y+this.borderSize;
    return {x: xPos, y: yPos};
  }
  
  compileArrowDirection (x, y) {
    let result = "";
    switch (y) {
      case -1:
        result += "north"
        break
      case 1:
        result += "south"
        break
    }
  
    switch (x) {
      case -1:
        result += "West"
        break
      case 1:
        result += "East"
        break
    }
  
    if(y == 0) {
      result = result.toLowerCase();
    }
  
    return result;
  }
}

export const loadImage = async () => {
  const image = new Image();
  image.src = "arrow.svg";
  await new Promise(r => image.onload = r);
  return image;
}
