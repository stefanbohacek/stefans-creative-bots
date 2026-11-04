import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Canvas from "canvas";

const __dirname = dirname(fileURLToPath(import.meta.url));

const wrapText = (ctx, text, maxWidth) => {
  const lines = [];
  let currentLine = "";

  text.split(" ").forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (currentLine && ctx.measureText(testLine).width > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  lines.push(currentLine);

  return lines;
};

export default async ({
  imageUrl,
  topText,
  bottomText,
  fontFamily = "sans-serif",
  fontFileName,
  textColor = "#fff",
  barColor = "#000",
  defaultWidth = 800,
}) => {
  if (fontFileName) {
    Canvas.registerFont(join(__dirname, "../../fonts", fontFileName), {
      family: fontFamily,
    });
  }

  const image = imageUrl ? await Canvas.loadImage(imageUrl) : null;
  const width = image ? image.width : defaultWidth;
  const imageHeight = image ? image.height : 0;
  const fontSize = Math.round(width * 0.05);
  const lineHeight = Math.round(fontSize * 1.2);
  const padding = Math.round(fontSize * 0.5);
  const font = `${fontSize}px ${fontFamily}`;

  const measureContext = Canvas.createCanvas(1, 1).getContext("2d");
  measureContext.font = font;

  const topLines = topText
    ? wrapText(measureContext, topText, width * 0.9)
    : [];

  const bottomLines = bottomText
    ? wrapText(measureContext, bottomText, width * 0.9)
    : [];

  const barHeight =
    Math.max(topLines.length, bottomLines.length) * lineHeight + padding * 2;

  const topBarHeight = topLines.length ? barHeight : 0;
  const bottomBarHeight = bottomLines.length ? barHeight : 0;
  const height = imageHeight + topBarHeight + bottomBarHeight;

  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = barColor;
  ctx.fillRect(0, 0, width, height);

  if (image) {
    ctx.drawImage(image, 0, topBarHeight);
  }

  ctx.font = font;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const drawLines = (lines, barTop) => {
    const firstLineY =
      barTop + barHeight / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, firstLineY + index * lineHeight);
    });
  };

  drawLines(topLines, 0);
  drawLines(bottomLines, topBarHeight + imageHeight);

  return canvas.toBuffer().toString("base64");
};
