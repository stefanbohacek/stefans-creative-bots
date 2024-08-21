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
    access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  // const webcam = randomFromArray(webcams);
  const webcam =     {
    title:
      "Lake Tahoe, along the borders of Nevada and California, United States.",
    description:
      "This webcam usually shows a view of a large lake from a high point with trees below and mountains in the background.",
    link: "https://www.skiheavenly.com/the-mountain/mountain-conditions/mountain-cams.aspx",
    url: "https://live9.brownrice.com/cam-images/heavenlymidstation.jpg",
    latitude: 38.941631,
    longitude: -119.977219,
  };
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
