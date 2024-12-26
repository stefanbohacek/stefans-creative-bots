import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";
import downloadFile from "./../../modules/download-file.js";
import getWeather from "./../../modules/get-weather.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { stat } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "mteverest";

const botScript = async () => {
  try {
    await (async () => {
      const mastodon = new mastodonClient({
        access_token: process.env.MTEVEREST_BOT_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      const webcam = {
        url: "https://mountaingenius.org/webcam-everest/",
        img_url: "https://images-webcams.windy.com/91/1652187391/current/full/1652187391.jpg",
        description: "A wide view of several mountains, from left:\n\n- Taboche (6,500 meters/21,325 feet)\n- Mount Everest (8,848 meters/29,032 feet)\n- Lhotse (8,516 meters/27,939 feet)\n- Ama Dablam (6,814 meters/22,355 feet)",
        // element: ".elementor-element.elementor-element-51f14c4.elementor-widget.elementor-widget-html .elementor-widget-container img",
        lat: 27.988121,
        lon: 86.924973
      };

      const imageURL = webcam.img_url;
      const filePath = `${__dirname}/../../temp/${botID}.jpg`;
      await downloadFile(imageURL, filePath);
      const description = webcam.description;
      
      let weather;
      let status = "";

      if (webcam.lat && webcam.lon) {
        weather = await getWeather(
          webcam.lat,
          webcam.lon
        );

        if (weather && weather.description_full) {
          status = `${weather.description_full}\n\n`;
        }
      }

      status += `#MountEverest #MtEverest #mountain #live #webcam`;

      mastodon.postImage({
        status,
        image: filePath,
        alt_text: description,
      });
    })();
  } catch (error) {
    console.log("error", error);
  }
};

export default botScript;
