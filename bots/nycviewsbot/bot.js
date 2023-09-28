import webcams from "./../../data/webcams-nyc.js";
import mastodonClient from "./../../modules/mastodon/index.js";

import downloadFile from './../../modules/download-file.js';
import randomFromArray from "./../../modules/random-from-array.js";
import getWeather from "./../../modules/get-weather.js";

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = 'nycviewsbot';

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.NYCVIEWSBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.NYCVIEWSBOT_MASTODON_API,
  });

  const webcam = randomFromArray(webcams);
  let webcamUrl;

  if (webcam.windy_id) {
    webcamUrl = `📷 https://www.windy.com/-Webcams/webcams/${webcam.windy_id}`;
  } else {
    webcamUrl = `📷 ${webcam.link}`;
  }

  const filePath = `${__dirname}/../../temp/${botID}.jpg`;
  await downloadFile(webcam.url, filePath);

  const googleMapsUrl = `🗺️ https://www.google.com/maps/search/${webcam.latitude},${webcam.longitude}`;
  const weather = await getWeather(webcam.latitude, webcam.longitude);

  const status = `${webcam.title}\n${webcamUrl}\n${googleMapsUrl} #nyc #webcam #city`;
  let description = webcam.description;

  if (weather && weather.description_full){
    description += ` ${weather.description_full}`;
  }

  mastodon.postImage({
    status,
    image: filePath,
    alt_text: description,
  });
  return true; 
}


export default botScript;