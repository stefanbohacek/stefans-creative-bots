import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import webcams from "./../../data/webcams-skies.js";
import mastodonClient from "./../../modules/mastodon/index.js";

import getWeather from "./../../modules/get-weather.js";
import getImageLuminosity from "./../../modules/get-image-luminosity.js";
import downloadFile from './../../modules/download-file.js';
import randomFromArray from "./../../modules/random-from-array.js";

const botID = 'skies';

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.SKIES_ACCESS_TOKEN_SECRET,
    api_url: process.env.SKIES_API,
  });

  const webcam = randomFromArray(webcams);
  let webcamUrl;

  if (webcam.windy_id) {
    webcamUrl = `📷 https://www.windy.com/-Webcams/webcams/${webcam.windy_id}`;
  } else {
    webcamUrl = `📷 ${webcam.link}`;
  }

  console.log("looking at the sky...", webcam);

  const filePath = `${__dirname}/../../temp/${botID}.jpg`;
  await downloadFile(webcam.url, filePath);
  const luminosity = await getImageLuminosity(filePath);

  if (luminosity > 40) {
    const weather = await getWeather(webcam.latitude, webcam.longitude);
    let description = webcam.description;
  
    if (weather && weather.description_full){
      description += ` ${weather.description_full}`;
    }
   
    const googleMapsUrl = `🗺️ https://www.google.com/maps/search/${webcam.latitude},${webcam.longitude}`;
    const status = `${webcam.title}\n${webcamUrl}\n${googleMapsUrl} #sky #skies #view #webcam`;
  
    mastodon.postImage({
      status,
      image: filePath,
      alt_text: description,
    });  
  } else {
    console.log('skies: image too dark, retrying...');
    await botScript();
  }

  return true;
};

export default botScript;
