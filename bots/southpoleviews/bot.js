import cheerio from "cheerio";
import puppeteer from "puppeteer";

import stations from "./../../data/webcams-south-pole-stations.js";


import mastodonClient from "./../../modules/mastodon/index.js";

import downloadFile from './../../modules/download-file.js';
import randomFromArray from "./../../modules/random-from-array.js";
import getWeather from "./../../modules/get-weather.js";

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = 'southpoleviews';

const botScript = async () => {
  await (async () => {
    const mastodon = new mastodonClient({
      access_token: process.env.SOUTHPOLEVIEWSBOT_MASTODON_ACCESS_TOKEN,
      api_url: process.env.SOUTHPOLEVIEWSBOT_MASTODON_API,
    });
    
    const station = randomFromArray(stations);
  
    const filePath = `${__dirname}/../../temp/${botID}.jpg`;
    // await downloadFile(station.url, filePath);
  

    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);

    process.on("unhandledRejection", (reason, p) => {
      console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
      browser.close();
    });

    page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    );

    page.on("load", async (response) => {
      let html = await page.evaluate(() => document.body.innerHTML);

      let $ = cheerio.load(html, {
        normalizeWhitespace: true,
      });

      const imgSrc = $(`${station.element}`).attr("src");
      let imgURL;

      if (imgSrc) {
        if (imgSrc.indexOf("http") === -1) {
          imgURL = `${station.page_url}${imgSrc}`;
        } else {
          imgURL = imgSrc;
        }

        const filePath = `${__dirname}/../../temp/${botID}.jpg`;
        await downloadFile(imgURL, filePath);
      
        const status = `${station.name} via ${station.url} #SouthPole #antarctica #view #webcam`;

        mastodon.postImage({
          status,
          image: filePath,
          alt_text: `View from the ${station.name}.`,
        });
      } else {
        console.log(
          "@southpoleviews error: image element not found",
          station
        );
      }
    });
    try {
      await page.goto(station.url, { waitUntil: "networkidle0" });
    } catch (error) {
      console.log("@southpoleviews error", error, station);
      browser.close();
    }

    await browser.close();
  })();
};



export default botScript;
