/*
  Based on https://codepen.io/ruigewaard/pen/JHDdF
*/

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


import fs from 'fs';
import Canvas from 'canvas';
import GIFEncoder from 'gifencoder';
import concat from 'concat-stream';
import { Base64Encode } from 'base64-stream';



// import randomFromArray from __dirname + "/modules/random-from-array.js";
// import getRandomInt from __dirname + "/modules/random-from-array.js";


// const script = 'subfolder/other.mjs';
// const anotherScript = new URL(script, import.meta.url);
// const module = await import(anotherScript);

import randomFromArray from  "../random-from-array.js";
import getRandomInt from  "../random-from-array.js";


export default (options, cb) => {
  console.log('making it rain...');

  let width = options.width || 800;
  let height = options.height || 500;

  const data = [];   
  const encoder = new GIFEncoder(width, height);
  const stream = encoder.createReadStream();


  encoder.createReadStream().pipe(concat((data) => {
    if (cb){
      cb(null, data.toString('base64'));
    }
  }));

  encoder.start();
  encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
  encoder.setDelay(30);   // frame delay in milliseconds
  encoder.setQuality(10); // image quality, 10 is default.

  let canvas = Canvas.createCanvas(width, height);
  let ctx = canvas.getContext('2d');

  const skyColor = [
    '#061928',
    '#2c3e50',
    '#2980b9',
    '#34495e',
    '#5D8CAE',
    '#1B4F72',
    '#21618C',
    '#013243',
    '#2C3E50',
    '#044F67'
  ];

  let color = randomFromArray(skyColor);

  //ctx.strokeStyle = 'rgba(174,194,224,0.5)';
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';


  let init = [];
  let maxParts = getRandomInt(50, 100);

  for (let a = 0; a < maxParts; a++){
    init.push({
      x: Math.random() * width,
      y: Math.random() * height,
      l: Math.random() * 1/maxParts*200,
      xs: -4 + Math.random() * 4 + 5,
      ys: Math.random() * getRandomInt(10, 30) + getRandomInt(10, 30)
    })
  }

  let particles = [];

  for (let b = 0; b < maxParts; b++){
    particles[b] = init[b];
  }

  const draw = () => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    for (let c = 0; c < particles.length; c++){
      let p = particles[c];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
      ctx.stroke();
    }
    move();
  }

  const move = () => {
    for (let b = 0; b < particles.length; b++){
      let p = particles[b];
      p.x += p.xs;
      p.y += p.ys;
      if(p.x > width || p.y > height){
        p.x = Math.random() * width;
        p.y = -20;
      }
    }
  }

  for (let i = 0; i < 48; i++){
    draw();
    encoder.addFrame(ctx);
  }

  encoder.finish();
  console.log('gif finished...');
}
