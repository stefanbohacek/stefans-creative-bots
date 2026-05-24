import puppeteer from "puppeteer";
import { parse as parseHLS } from "hls-parser";
import { browserFetch, browserFetchBinary } from "./browserFetch.js";
import convertToMP4 from "./convertToMP4.js";
import downloadFile from "./download-file.js";
import fs from "fs";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolveUrl = (uri, base) =>
  uri.startsWith("http") ? uri : new URL(uri, base).href;

export default async (webcam, botID) => {
  const tsPath = `${__dirname}/../temp/${botID}.ts`;
  const filePath = `${__dirname}/../temp/${botID}.mp4`;
  const fallbackPath = `${__dirname}/../temp/${botID}.jpg`;

  const fallback = async () => {
    let result = null;
    if (webcam.url) {
      await downloadFile(webcam.url, fallbackPath);
      result = fallbackPath;
    }
    return result;
  };

  const browser = await puppeteer.connect({
    browserWSEndpoint: `${process.env.BROWSERLESS_URL}&blockAds=true`,
  });

  try {
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);

    await page.setViewport({ width: 960, height: 600 });

    let hlsUrl = null;

    page.on("console", (consoleMessage) => {
      const text = consoleMessage.text();
      if (text.startsWith("retrying stream http") && !hlsUrl) {
        hlsUrl = text.replace("retrying stream ", "").trim();
      }
    });

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes(".m3u8") && !hlsUrl) {
        hlsUrl = url;
      }
    });

    await page.goto(webcam.link, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    await page.waitForSelector(".snapshot-dome-btn", { timeout: 30000 });
    await page.waitForTimeout(5000);

    await page.hover(".playerArea");
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const btn = document.querySelector(".snapshot-dome-btn");
      if (btn) {
        btn.click();
      }
    });

    let waited = 0;
    while (!hlsUrl && waited < 10000) {
      await page.waitForTimeout(500);
      waited += 500;
    }

    let capturedPath = null;

    if (!hlsUrl) {
      capturedPath = await fallback();
    } else {
      const playlistFetch = await browserFetch(page, hlsUrl);

      if (playlistFetch.error || !playlistFetch.text.startsWith("#EXTM3U")) {
        capturedPath = await fallback();
      } else {
        const hlsPlaylist = parseHLS(playlistFetch.text);
        let segmentUrl = null;

        if (hlsPlaylist.isMasterPlaylist) {
          const variantUri = hlsPlaylist.variants[0]?.uri;

          if (variantUri) {
            const variantUrl = resolveUrl(variantUri, hlsUrl);
            const variantFetch = await browserFetch(page, variantUrl);

            if (variantFetch.error) {
              console.log(`captureEarthcamLiveStream: ${variantFetch.error}`);
            } else {
              const variantPlaylist = parseHLS(variantFetch.text);
              const segUri = variantPlaylist.segments[0]?.uri;

              if (segUri) {
                segmentUrl = resolveUrl(segUri, variantUrl);
              }
            }
          }
        } else {
          const segUri = hlsPlaylist.segments[0]?.uri;

          if (segUri) {
            segmentUrl = resolveUrl(segUri, hlsUrl);
          }
        }

        if (!segmentUrl) {
          capturedPath = await fallback();
        } else {
          const segmentFetch = await browserFetchBinary(page, segmentUrl);

          if (segmentFetch.error) {
            console.log(`captureEarthcamLiveStream: ${segmentFetch.error}`);
            capturedPath = await fallback();
          } else {
            fs.writeFileSync(tsPath, Buffer.from(segmentFetch.data, "base64"));
            await convertToMP4(tsPath, filePath);
            fs.unlinkSync(tsPath);
            capturedPath = filePath;
          }
        }
      }
    }

    const isArchive = hlsUrl ? hlsUrl.includes("video2archives.earthcam.com") : false;
    return { path: capturedPath, isArchive };
  } catch (err) {
    console.log(`captureEarthcamLiveStream error:`, err);
    return null;
  } finally {
    await browser.disconnect();
  }
};
