import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import GIFEncoder from "gifencoder";
import { createCanvas, loadImage } from "canvas";
import sleep from "./sleep.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (url, filename) => {
  // const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.BROWSERLESS_URL,
  });

  const page = await browser.newPage();

  // const url = "https://explore.org/livecams/brown-bears/brown-bear-salmon-cam-the-riffles"
  // const url = "https://eol.jsc.nasa.gov/esrs/hdev/";

  console.log(`opening ${url}...`);
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.setViewport({ width: 800, height: 756 });
  await page.waitForSelector("iframe", { timeout: 15000 });
  await new Promise((resolve) => setTimeout(resolve, 3000));

  await page.evaluate(() => {
    const iframe = document.querySelector("iframe");
    if (!iframe) return;
    const allElements = document.querySelectorAll(
      "*:not(iframe):not(html):not(body)"
    );
    allElements.forEach((element) => {
      if (
        element !== iframe &&
        !iframe.contains(element) &&
        !element.contains(iframe)
      ) {
        element.style.display = "none";
      }
    });

    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "black";
    document.body.style.overflow = "hidden";

    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.width = "100vw";
    iframe.style.height = "100vh";
    iframe.style.border = "none";
    iframe.style.zIndex = "9999";
  });

  console.log("waiting for video...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("playing video...");
  try {
    const iframe = await page.$("iframe");
    if (iframe) {
      await page.evaluate(() => {
        const iframe = document.querySelector("iframe");
        if (iframe && iframe.contentDocument) {
          const playButton = iframe.contentDocument.querySelector(
            'button[aria-label*="play"], button[title*="play"], .play-button, [class*="play"]'
          );
          if (playButton) {
            playButton.click();
          }
          const video = iframe.contentDocument.querySelector("video");
          if (video) {
            video.play().catch((e) => console.log("unable to play video", e));
          }
        }
      });
    }

    const iframeBox = await iframe.boundingBox();
    if (iframeBox) {
      const centerX = iframeBox.x + iframeBox.width / 2;
      const centerY = iframeBox.y + iframeBox.height / 2;
      await page.click(`iframe`, {
        offset: { x: centerX - iframeBox.x, y: centerY - iframeBox.y },
      });
    }
  } catch (error) {
    console.log("unable to record video", error.message);
  }

  await new Promise((resolve) => setTimeout(resolve, 3000));
  const gifPath = __dirname + `/../temp/${filename}.gif`
  const encoder = new GIFEncoder(800, 756);
  const stream = fs.createWriteStream(gifPath);

  encoder.createReadStream().pipe(stream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(150);
  encoder.setQuality(15);

  console.log("recording GIF...");
  sleep(1000);

  const duration = 5000;
  const fps = 6.67;
  const interval = 1000 / fps;
  const totalFrames = Math.floor(duration / interval);

  for (let i = 0; i < totalFrames; i++) {
    const screenshot = await page.screenshot({
      encoding: "base64",
      fullPage: false,
    });

    const img = await loadImage(Buffer.from(screenshot, "base64"));

    const canvas = createCanvas(800, 756);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 800, 756);
    const imgWidth = img.width;
    const imgHeight = img.height;
    const canvasWidth = 800;
    const canvasHeight = 756;
    const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;
    const offsetX = (canvasWidth - scaledWidth) / 2;
    const offsetY = (canvasHeight - scaledHeight) / 2;
    ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
    encoder.addFrame(ctx);

    if (i < totalFrames - 1) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  encoder.finish();

  await new Promise((resolve) => {
    stream.on("finish", resolve);
  });

  console.log(`GIF saved to ${gifPath} (${fs.statSync(gifPath).size} bytes)`);
  await browser.close();
  return gifPath;
};
