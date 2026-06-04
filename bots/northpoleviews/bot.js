import puppeteer from "puppeteer";
import stations from "./../../data/webcams/north-pole-stations.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import downloadFile from "./../../modules/downloadFile.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getImageLuminosity from "./../../modules/getImageLuminosity.js";
import getWeather from "./../../modules/getWeather.js";
import getBotInfo from "./../../modules/getBotInfo.js";

import { stat } from "fs";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const botScript = async () => {
  await (async () => {
    let browser;
    try {
      const mastodon = new mastodonClient({
        // access_token: process.env.MASTODON_TEST_TOKEN,
        access_token: process.env.NORTHPOLEVIEWS_MASTODON_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });
      const station = randomFromArray(stations);

      console.log(`@${botID} station`, station);
      console.log(process.env.BROWSERLESS_URL)

      // const station = randomFromArray(stations.filter(s => s.name === "Troll research station"));
      // const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
      browser = await puppeteer.connect({
        browserWSEndpoint: process.env.BROWSERLESS_URL,
      });

      let imageURL;


      if (station.image_url) {
        imageURL = station.image_url;
      } else {


        const page = await browser.newPage();
        page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
        );

        await page.setDefaultNavigationTimeout(120000);

        await page.goto(station.url, {
          // waitUntil: "networkidle0",
          waitUntil: "domcontentloaded",
          timeout: 120000,
        });

        await page.waitForSelector(station.element, { timeout: 120000 });

        const imageElement = await page.$(station.element);

        const image = await page.evaluate(
          (imageElement) => imageElement.getAttribute("src"),
          imageElement
        );

        if (image) {
          if (image.indexOf("http") === -1) {
            imageURL = `${station.page_url}${image}`;
          } else {
            imageURL = image;
          }
        } else {
          console.log(
            `@${botID} error: image element not found`,
            station
          );
        }
      }

      if (imageURL) {
        const filePath = getTempDirPath("jpg");
        try {
          await downloadFile(imageURL, filePath);
        } catch (err) {
          console.log(`${botID}: failed to download image for ${station.name}:`, err.message);
          throw new Error(`${botID}: failed to download image for ${station.name}\n${imageURL}\n\n${err.message}`);
        }

        const luminosity = await getImageLuminosity(filePath);

        if (luminosity > 40) {
          let description = station.description ? station.description : `View from the ${station.name}.`;
          let weather;

          if (station.location) {
            weather = await getWeather(
              station.location.lat,
              station.location.lon
            );

            if (weather && weather.description_full) {
              description += ` ${weather.description_full}`;
            }
          }

          const status = `${station.name} via ${station.url}\n\n#NorthPole #view #webcam`;

          await mastodon.postImage({
            status,
            image: filePath,
            alt_text: description,
          });
        } else {
          console.log(`@${botID}: image too dark, retrying...`);
          await botScript();
        }
      } else {
        console.log(`@${botID}: image not found, retrying...`);
        await botScript();
      }
    } catch (error) {
      console.log(`@${botID} error`, error);
      throw error;
    } finally {
      if (browser) {
        await browser.disconnect();
      }
    }
  })();
};

export default botScript;
