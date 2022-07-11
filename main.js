import { GridRenderer, loadImage } from "./render.js";
import { generate } from "./generate.js";

const canvas = document.getElementById("canvas");

let grid = [];

const generateGrid = () => {
  for(let i = 0; i<5;i++){
    let column = [];
    grid.push(column);
    for (let r = 0;r<5;r++){
      column.push({text: "a+3", arrowDirection: [-1, -1]})
    }
  }
}

generateGrid()

generate(0, 0, [], grid)

const image = await loadImage();

const renderer = new GridRenderer(canvas, 70, grid, image)
renderer.render();
