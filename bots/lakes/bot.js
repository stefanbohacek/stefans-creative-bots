import webcams from "./../../data/webcams/lakes.js";
import mastodonClient from "./../../modules/mastodon/index.js";

import downloadFile from "./../../modules/download-file.js";
import randomFromArray from "./../../modules/random-from-array.js";
import getImageLuminosity from "./../../modules/get-image-luminosity.js";
import getWeather from "./../../modules/get-weather.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "lakes";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.LAKES_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  const webcam = randomFromArray(webcams);
  const webcamUrl = `📷 ${webcam.link}`;

  const filePath = `${__dirname}/../../temp/${botID}.jpg`;
  await downloadFile(webcam.url, filePath);

  const luminosity = await getImageLuminosity(filePath);

  if (luminosity > 40) {
    const mapURL = `🗺️ https://www.openstreetmap.org/?mlat=${webcam.latitude}&mlon=${webcam.longitude}#map=12/${webcam.latitude}/${webcam.longitude}`;
    const weather = await getWeather(webcam.latitude, webcam.longitude);
    const status = `${webcam.title}\n\n${webcamUrl}\n${mapURL}\n\n#lake #lakes #outdoors #webcam`;
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
  } else {
    return await botScript();
  }
};

export default botScript;
