import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Canvas from "canvas";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VS_LOGO_PATH = join(__dirname, "../../images/Street_Fighter_VS_logo.png");

export default async (options, cb) => {
  console.log("creating fighter selection screen...");

  const width = 1200;
  const height = 600;
  const halfWidth = width / 2;

  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  const img1 = await Canvas.loadImage(options.fighter1);
  const img2 = await Canvas.loadImage(options.fighter2);

  const drawFighter = (img, startX) => {
    const scale = Math.min(halfWidth / img.width, height / img.height, 1);
    const w = img.width * scale;
    const h = img.height * scale;
    const drawX = startX + (halfWidth - w) / 2;
    const drawY = (height - h) / 2;
    ctx.drawImage(img, drawX, drawY, w, h);
  };

  drawFighter(img1, 0);
  drawFighter(img2, halfWidth);

  const vsLogo = await Canvas.loadImage(VS_LOGO_PATH);
  const vsMaxW = 200;
  const vsMaxH = 120;
  const vsScale = Math.min(vsMaxW / vsLogo.width, vsMaxH / vsLogo.height);
  const vsW = vsLogo.width * vsScale;
  const vsH = vsLogo.height * vsScale;
  ctx.drawImage(vsLogo, (width - vsW) / 2, (height - vsH) / 2, vsW, vsH);

  console.log("fighter selection screen created...");

  const result = canvas.toBuffer().toString("base64");

  if (cb) {
    cb(null, result);
  }

  return result;
};
