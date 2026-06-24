import webcams from "./../../data/webcams/lakes.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import captureEarthcamLiveStream from "./../../modules/captureEarthcamLiveStream.js";
import { checkImageLuminosity } from "./../../modules/luminosity.js";
import getWeather from "./../../modules/getWeather.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import sleep from "./../../modules/sleep.js";
import { getNextItem } from "./../../modules/rotationQueue.js";
import { file as downloadFile } from "./../../modules/fetch.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const MAX_RETRIES = 10;

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.LAKES_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const allWebcamIDs = webcams.map((w) => w.id);
  const nextWebcamID = await getNextItem(botID, allWebcamIDs);
  const webcam = webcams.find((w) => w.id === nextWebcamID);

  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    if (retry > 0) {
      await sleep(3000);
    }

    let image;
    const isEarthcam = webcam.link.includes("earthcam.com");

    if (isEarthcam) {
      image = await captureEarthcamLiveStream(webcam, botID);
    } else {
      try {
        const filePath = getTempDirPath("jpg");
        await downloadFile(webcam.url, filePath);
        image = { path: filePath };
      } catch (err) {
        console.log(`${botID}: failed to download image:`, err.message);
      }
    }

    if (!image || !image.path) {
      console.log(`${botID}: failed to capture image, retrying`);
      continue;
    }

    const isVideo = image.path.endsWith(".mp4");

    if (!isVideo) {
      if (!(await checkImageLuminosity(image.path))) {
        console.log(`${botID}: luminosity out of range, retrying`);
        continue;
      }
    }

    const webcamUrl = `📷 ${webcam.link}`;
    const mapURL = `🗺️ https://www.openstreetmap.org/?mlat=${webcam.latitude}&mlon=${webcam.longitude}#map=12/${webcam.latitude}/${webcam.longitude}`;
    const status = `${webcam.title}\n\n${webcamUrl}\n${mapURL}\n\n#lake #lakes #outdoors #webcam`;

    let description = webcam.description;
    const weather = await getWeather(webcam.latitude, webcam.longitude);
    if (weather && weather.description_full) {
      description += ` ${weather.description_full}`;
    }

    await mastodon.postImage({
      status,
      image: image.path,
      alt_text: description,
    });

    return true;
  }

  console.log(`${botID}: max retries reached`);
};

export default botScript;
