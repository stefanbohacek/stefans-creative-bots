import webcams from "./../../data/webcams/nyc.js";
import mastodonClient from "./../../modules/mastodon/index.js";

import downloadFile from "./../../modules/download-file.js";
import randomFromArray from "./../../modules/random-from-array.js";
import captureVideoFrame from "./../../modules/captureVideoFrame.js";
import getWeather from "./../../modules/get-weather.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "nycviewsbot";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.NYCVIEWSBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const webcam = randomFromArray(webcams);
  // const webcam = {
  //   title: "30 Rockefeller Plaza",
  //   description: "This webcam usually shows a view of the New York skyline.",
  //   link: "https://www.earthcam.com/usa/newyork/rockefellercenter/?cam=rockefellerobservatory",
  //   url: "https://www.earthcam.com/cams/includes/image.php?img=FxiZuOzKkdq5wr44wir%2FCw%3D%3D&logo=0&playbutton=0&s=1",
  //   isVideo: true,
  //   latitude: 40.7594,
  //   longitude: -73.98,
  // };

  let webcamUrl;

  if (webcam.windy_id) {
    webcamUrl = `📷 https://www.windy.com/-Webcams/webcams/${webcam.windy_id}`;
  } else {
    webcamUrl = `📷 ${webcam.link}`;
  }

  const filePath = `${__dirname}/../../temp/${botID}.jpg`;

  try {
    if (webcam.isVideo) {
      await captureVideoFrame(webcam.link, "video", filePath);
    } else {
      await downloadFile(webcam.url, filePath);
    }
  } catch (error) {
    console.log("NYCVIEWSBOT CAPTURE ERROR:", error);
  }

  const mapURL = `🗺️ https://www.openstreetmap.org/?mlat=${webcam.latitude}&mlon=${webcam.longitude}#map=12/${webcam.latitude}/${webcam.longitude}`;
  const weather = await getWeather(webcam.latitude, webcam.longitude);
  const status = `${webcam.title}\n\n${webcamUrl}\n${mapURL}\n\n#nyc #webcam #city`;
  let description = webcam.description;

  if (weather && weather.description_full) {
    description += ` ${weather.description_full}`;
  }

  mastodon.postImage({
    status,
    image: filePath,
    alt_text: description,
  });
  return true;
};

export default botScript;
