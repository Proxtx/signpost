import { GridRenderer, loadImage } from "./render.js";
import { generatePath, generateGrid } from "./generate.js";
import { Game } from "./game.js";

const canvas = document.getElementById("canvas");

const image = await loadImage();

let generateResult = generateGrid(4, 4, true);

const renderer = new GridRenderer(canvas, 70, 20, generateResult.grid, image);

const game = new Game(renderer, generateResult)

renderer.render();
