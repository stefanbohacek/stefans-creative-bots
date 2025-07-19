import puppeteer from "puppeteer";
import stations from "./../../data/webcams/south-pole-stations.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import downloadFile from "./../../modules/download-file.js";
import randomFromArray from "./../../modules/random-from-array.js";
import getImageLuminosity from "./../../modules/get-image-luminosity.js";
import getWeather from "./../../modules/get-weather.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { stat } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "southpoleviews";

const botScript = async () => {
  try {
    await (async () => {
      const mastodon = new mastodonClient({
        access_token: process.env.SOUTHPOLEVIEWS_BOT_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      const station = randomFromArray(stations);
      // const station = randomFromArray(stations.filter(s => s.name === "Troll research station"));
      // const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
      const browser = await puppeteer.connect({
        browserWSEndpoint: process.env.BROWSERLESS_URL,
      });

      let imageURL;

      if (station.image_url) {
        imageURL = station.image_url;
      } else {
        process.on("unhandledRejection", (reason, p) => {
          console.error(
            "Unhandled Rejection at: Promise",
            p,
            "reason:",
            reason
          );
          browser.close();
        });

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
            "@southpoleviews error: image element not found",
            station
          );
        }
        await browser.close();
      }

      if (imageURL) {
        const filePath = `${__dirname}/../../temp/${botID}.jpg`;
        await downloadFile(imageURL, filePath);

        const luminosity = await getImageLuminosity(filePath);

        if (luminosity > 40) {
          let description = `View from the ${station.name}.`;
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

          const status = `${station.name} via ${station.url} #SouthPole #antarctica #view #webcam`;

          mastodon.postImage({
            status,
            image: filePath,
            alt_text: description,
          });
        } else {
          console.log("@southpoleviews: image too dark, retrying...");
          await botScript();
        }
      } else {
        console.log("@southpoleviews: image not found, retrying...");
        await botScript();
      }
    })();
  } catch (error) {
    console.log("southpoleviews error:", error);
  }
};

export default botScript;
