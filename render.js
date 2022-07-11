export class GridRenderer {
  borderSize = 2;
  colors = {
    borderColor: "#9C9E9C",
    plainSign: "#DEDFDE",
    signText: "#000000",
    unused: 1,
    used: 0.5,
    unused_targer: "#9C9A9C",
    used_target: "#525552"
  }
  
  arrowDirectionTranslator = {
    up: -90,
    right: 0,
    down: 90,
    left: 180
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
    
    for(let indexRow in this.grid) {
      for(let indexColumn in this.grid[indexRow]){
        this.renderSign(this.grid[indexRow][indexColumn], indexRow, indexColumn)
      }
    }
  }
  
  renderSign (sign, xIndex, yIndex){
    this.ctx.fillStyle = this.colors.plainSign;
    let { x, y } = this.calculateCords(xIndex, yIndex);
    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    this.drawArrow(x+this.arrowSize*1.3, y+this.arrowSize*1.3, this.arrowDirectionTranslator[sign.arrowDirection]);
    this.ctx.fillStyle = this.colors.signText;
    this.ctx.fillText(sign.text, x, y+this.fontSize)
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
}

export const loadImage = async () => {
  const image = new Image();
  image.src = "arrow.svg";
  await new Promise(r => image.onload = r);
  return image;
}
