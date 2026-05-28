import webcams from "./../../data/webcams/lakes.js";
import mastodonClient from "./../../modules/mastodon/index.js";

import downloadFile from "./../../modules/downloadFile.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getImageLuminosity from "./../../modules/getImageLuminosity.js";
import getWeather from "./../../modules/getWeather.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.LAKES_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const webcam = randomFromArray(webcams);
  const webcamUrl = `📷 ${webcam.link}`;

  const filePath = getTempDirPath("jpg");
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
