// Based on https://editor.p5js.org/ajt521/sketches/qfwt30yWZ

import Canvas from "canvas";

class PerlinNoise {
  constructor() {
    this.permutation = [];
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }
    this.shuffle(this.permutation);
    this.p = [...this.permutation, ...this.permutation];
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(a, b, t) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const a = this.p[X] + Y;
    const b = this.p[X + 1] + Y;
    return this.lerp(
      this.lerp(this.grad(this.p[a], x, y), this.grad(this.p[b], x - 1, y), u),
      this.lerp(
        this.grad(this.p[a + 1], x, y - 1),
        this.grad(this.p[b + 1], x - 1, y - 1),
        u
      ),
      v
    );
  }
}

const perlin = new PerlinNoise();

function noise(x, y) {
  return (perlin.noise(x, y) + 1) / 2;
}

function random(max) {
  return Math.random() * max;
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows).fill(0);
  }
  return arr;
}

export default (options, cb) => {
  console.log("generating ink blob pattern...");

  const width = options.width || 600;
  const height = options.height || 400;
  const resolution = options.resolution || 5;
  const inkThreshold = options.inkThreshold || 0.75;
  const noiseLevelX = options.noiseLevelX || 0.15;
  const noiseLevelY = options.noiseLevelY || 0.15;
  const overlapAmount = options.overlapAmount || -4;

  const cols = Math.floor(width / resolution);
  const rows = Math.floor(height / resolution);
  let grid = make2DArray(cols, rows);

  const generatePattern = (noiseOffsetX, noiseOffsetY) => {
    let centerX = cols / 4;
    let centerY = rows / 2;

    for (let i = 0; i < cols / 2; i++) {
      for (let j = 0; j < rows; j++) {
        let distToCenter = dist(i, j, centerX, centerY);
        let gradient = map(distToCenter, 0, cols / 2, 1, 0.2);

        let noiseValue = noise(
          i * noiseLevelX + noiseOffsetX,
          j * noiseLevelY + noiseOffsetY
        );
        let combinedValue = gradient * (noiseValue + 0.5);

        if (combinedValue > inkThreshold) {
          grid[i][j] = 1;
        } else {
          grid[i][j] = 0;
        }
      }
    }
  };

  const shiftPatternToCenter = () => {
    let maxDistFromCenter = 0;
    for (let i = 0; i < cols / 2; i++) {
      for (let j = 0; j < rows; j++) {
        if (grid[i][j] === 1) {
          let currentDist = Math.abs(cols / 2 - i);
          maxDistFromCenter = Math.max(maxDistFromCenter, currentDist);
        }
      }
    }

    let shiftAmount = Math.floor(cols / 2 - maxDistFromCenter);
    shiftAmount -= overlapAmount;

    for (let i = cols / 2 - 1; i >= 0; i--) {
      for (let j = 0; j < rows; j++) {
        if (grid[i][j] === 1) {
          let newI = i + shiftAmount;
          if (newI >= 0 && newI < cols) {
            grid[newI][j] = 1;
            grid[i][j] = 0;
          }
        }
      }
    }
  };

  const mirrorPattern = () => {
    for (let i = 0; i < cols / 2; i++) {
      for (let j = 0; j < rows; j++) {
        grid[cols - i - 1][j] = grid[i][j];
      }
    }
  };

  const displayGrid = (ctx) => {
    ctx.fillStyle = "#e1e1e1";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#000000";
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (grid[i][j] == 1) {
          ctx.fillRect(i * resolution, j * resolution, resolution, resolution);
        }
      }
    }
  };

  let noiseOffsetX = random(1000);
  let noiseOffsetY = random(1000);
  generatePattern(noiseOffsetX, noiseOffsetY);
  shiftPatternToCenter();
  mirrorPattern();

  let canvas = Canvas.createCanvas(width, height);
  let ctx = canvas.getContext("2d");
  displayGrid(ctx);

  const buffer = canvas.toBuffer("image/png");
  if (cb) {
    cb(null, buffer.toString("base64"));
  }

  console.log("ink blob finished...");
};
