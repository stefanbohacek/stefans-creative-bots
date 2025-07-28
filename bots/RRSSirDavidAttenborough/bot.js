import puppeteer from "puppeteer";
// import stations from "./../../data/webcams/south-pole-stations.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import downloadFile from "./../../modules/download-file.js";
import randomFromArray from "./../../modules/random-from-array.js";
import getImageLuminosity from "./../../modules/get-image-luminosity.js";
import getWeather from "./../../modules/get-weather.js";
import consoleLog from "./../../modules/consolelog.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { stat } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "RRSSirDavidAttenborough";

const botScript = async () => {
  try {
    await (async () => {
      const mastodon = new mastodonClient({
        access_token:
          process.env.RRS_SIR_DAVID_ATTENBOROUGH_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      // const station = randomFromArray(stations);
      const station = {
        name: "RRS Sir David Attenborough Webcam",
        url: "https://www.bas.ac.uk/data/our-data/images/webcams/rrs-sir-david-attenborough-webcam/",
        image_url:
          "https://legacy.bas.ac.uk/webcams/rrs_sir_david_attenborough/latest.jpg",
        // element: '.entry-content img[width="1920"]',
        description:
          "View from a webcam mounted on the RRS Sir David Attenborough boat, riding through icy waters.",
      };

      const filePath = `${__dirname}/../../temp/${botID}.jpg`;
      await downloadFile(station.image_url, filePath);
      let description = `View from the ${station.name}.`;
      let weather;

      if (station.location) {
        weather = await getWeather(station.location.lat, station.location.lon);

        if (weather && weather.description_full) {
          description += ` ${weather.description_full}`;
        }
      }

      const status = `${station.name} via ${station.url}\n\nCurrent location: https://www.vesselfinder.com/vessels/details/9798222\n\n #SouthPole #antarctica #view #webcam`;

      mastodon.postImage({
        status,
        image: filePath,
        alt_text: description,
      });
    })();
  } catch (error) {
    console.log("RRSSirDavidAttenborough error:");
    consoleLog(error);
  }
};

export default botScript;
