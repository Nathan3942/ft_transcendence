
import { startPong } from "./game/pong.ts";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!ctx) {
    throw new Error("Impossible d'optenir le contexte 2D");
}

startPong(canvas, ctx);