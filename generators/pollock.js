/*
  Based on https://codepen.io/ruigewaard/pen/JHDdF
*/

const fs = require('fs'),
      Canvas = require('canvas'),
      GIFEncoder = require('gifencoder'),
      concat = require('concat-stream'),
      helpers = require(__dirname + '/../helpers/helpers.js');

module.exports = (options, cb) => {
  console.log('making art...');

  let width = options.width || 800;
  let height = options.height || 500;
  let imgDataStatic;

  const encoder = new GIFEncoder(width, height);

  encoder.createReadStream().pipe(concat((data) => {
    if (cb){
      cb(null, data.toString('base64'), imgDataStatic);
    }
  }));

  encoder.start();
  encoder.setRepeat(-1);
  encoder.setDelay(500);
  encoder.setQuality(10);


  let canvas = Canvas.createCanvas(width, height);
  let ctx = canvas.getContext('2d');

  const palette = [
    '#D89CA9',
    '#1962A0',
    '#F1ECD7',
    '#E8C051',
    '#1A1C23'
  ];
  
  let color = helpers.randomFromArray(palette);

  ctx.strokeStyle = color;
  ctx.fillStyle = '#fff';
  ctx.fillStyle = helpers.shadeColor(color, 0.95);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  encoder.addFrame(ctx);
  
  let startPosition = {
      x: helpers.getRandomInt(0, width),
      y: helpers.getRandomInt(0, height)
  },
  endPosition = {
      x: helpers.getRandomInt(0, width),
      y: helpers.getRandomInt(0, height)
  };

  ctx.lineCap='round';
  ctx.lineJoin='round';

  const makeSplat = (start, end, size) => {
    const center = {
      x: helpers.getRandomInt(start.x, end.x),
      y: helpers.getRandomInt(start.y, end.y)
    },
    splatCount = helpers.getRandomInt(1, 10);

    for (let i = 0; i <= splatCount; i++){
      ctx.beginPath();
      ctx.arc(
        center.x + helpers.getRandomInt(0, 4),
        center.y + helpers.getRandomInt(0, 4),
        helpers.getRandomInt(0, 4),
        0,
        2*Math.PI);
      ctx.fill();        
    }
  }

  const makeLine = (start, end, size) => {
    if (!size){
      const speed = helpers.getRandomInt(0, 100);

      if (speed < 2){
          size = helpers.getRandomInt(8,12);
      }
      else if (speed < 4){
          size = helpers.getRandomInt(6,7);
      }
      else if (speed < 7){
          size = helpers.getRandomInt(4,5);
      }
      else if (speed < 10){
          size = helpers.getRandomInt(1,3);
      }
      else{
          size = 1;
      }
    };
  
    if (helpers.getRandomInt(0, helpers.getRandomInt(3, 20)) === 0){
      color = helpers.randomFromArray(palette);
    }      
  
    ctx.strokeStyle = helpers.shadeColor(color, helpers.getRandomInt(99, 100));
    ctx.lineWidth = size;

    ctx.moveTo(startPosition.x, startPosition.y);

    if (helpers.getRandomInt(0, 10) === 1){
      ctx.lineTo(endPosition.x, endPosition.y);
    }
    else{
      ctx.bezierCurveTo(startPosition.x, startPosition.y,
                        helpers.getRandomInt(startPosition.x, endPosition.x),
                        helpers.getRandomInt(startPosition.y, endPosition.y),
                        endPosition.x, endPosition.y);

    }
    ctx.stroke();
    makeSplat(startPosition, endPosition);
  }

  const numberOfLines = helpers.getRandomInt(20, 40);

  for (let i = 0; i <= numberOfLines; i++){
      makeLine(startPosition.x, startPosition.y);
      encoder.addFrame(ctx);
      startPosition.x = endPosition.x;
      startPosition.y = endPosition.y;
      endPosition = {
          x: helpers.getRandomInt(0, width),
          y: helpers.getRandomInt(0, height)
      };        
  }

  encoder.setDelay(2000);
  encoder.addFrame(ctx);

  encoder.finish();
  imgDataStatic = canvas.toBuffer().toString('base64');

  console.log('painting finished...');
}
