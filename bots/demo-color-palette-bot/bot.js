import Canvas from "canvas";
import mastodonClient from "./../../modules/mastodon/index.js";
import getRandomHex from "./../../modules/get-random-hex.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  /*
  Based on https://stackoverflow.com/questions/15220003/html5-javascript-and-drawing-multiple-rectangles-in-a-canvas
  */

  const width = 800;
  const height = 600;
  const rectangleCount = 5;
  const rectangleHeight = width / rectangleCount;
  const canvas = Canvas.createCanvas(width, height);
  const context = canvas.getContext("2d");

  function Shape(x, y, w, h, fill) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.fill = fill;
  }

  let rectangles = [];
  let description = "Randomly generated color palette: ";

  for (let i = 0; i < 5; i++) {
    const color = getRandomHex();
    description += `\n-${color}`;
    rectangles.push(
      new Shape(0, i * rectangleHeight, width, rectangleHeight, color)
    );
  }

  for (let i in rectangles) {
    const rectangle = rectangles[i];
    context.fillStyle = rectangle.fill;
    context.fillRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
  }

  const imageData = canvas.toBuffer().toString("base64");

  mastodon.postImage({
    status: "New color palette!",
    image: imageData,
    alt_text: description,
  });
};

export default botScript;
