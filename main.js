import { GridRenderer, loadImage } from "./render.js";
import { generateGrid } from "./generate.js";
import { Game } from "./game.js";

let width = localStorage.width;
let height = localStorage.height;
let corners = JSON.parse(localStorage.corners);

if (!height || !width) location.pathname += "playSelect";

const canvas = document.getElementById("canvas");

const image = await loadImage();

let generateResult = generateGrid(width, height, corners);

const renderer = new GridRenderer(canvas, 70, 0, generateResult.grid, image);

const game = new Game(renderer, generateResult);
window.gameState = game.gameState;

renderer.render();
