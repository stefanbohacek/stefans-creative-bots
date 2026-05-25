import Canvas from "canvas";

export default async (imageURLs) => {
  const images = await Promise.all(
    imageURLs.map((url) => Canvas.loadImage(url)),
  );

  const totalWidth = images.reduce((sum, img) => sum + img.width, 0);
  const maxHeight = Math.max(...images.map((img) => img.height));

  const canvas = Canvas.createCanvas(totalWidth, maxHeight);
  const ctx = canvas.getContext("2d");

  let offsetX = 0;

  for (const img of images) {
    ctx.drawImage(img, offsetX, 0);
    offsetX += img.width;
  }

  return canvas.toBuffer().toString("base64");
};
