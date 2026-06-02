import webcams from "./../../data/webcams/skies.js";
import mastodonClient from "./../../modules/mastodon/index.js";

import getWeather from "./../../modules/getWeather.js";
import getImageLuminosity from "./../../modules/getImageLuminosity.js";
import downloadFile from "./../../modules/downloadFile.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.SKIES_ACCESS_TOKEN_SECRET,
    api_url: process.env.MASTODON_API_URL,
  });

  const webcam = randomFromArray(webcams);
  let webcamUrl;

  if (webcam.windy_id) {
    webcamUrl = `📷 https://www.windy.com/-Webcams/webcams/${webcam.windy_id}`;
  } else {
    webcamUrl = `📷 ${webcam.link}`;
  }

  console.log("looking at the sky...", webcam);

  const filePath = getTempDirPath("jpg");
  await downloadFile(webcam.url, filePath);
  const luminosity = await getImageLuminosity(filePath);

  if (luminosity > 40) {
    const weather = await getWeather(webcam.latitude, webcam.longitude);
    let description = webcam.description;

    if (weather && weather.description_full) {
      description += ` ${weather.description_full}`;
    }

    const mapURL = `🗺️ https://www.openstreetmap.org/?mlat=${webcam.latitude}&mlon=${webcam.longitude}#map=6/${webcam.latitude}/${webcam.longitude}`;
    const status = `${webcam.title}\n${webcamUrl}\n${mapURL} #sky #skies #view #webcam`;

    await mastodon.postImage({
      status,
      image: filePath,
      alt_text: description,
    });
  } else {
    console.log("skies: image too dark, retrying...");
    await botScript();
  }

  return true;
};

export default botScript;
