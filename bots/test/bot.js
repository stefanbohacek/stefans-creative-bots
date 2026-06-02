import webcams from "./../../data/webcams/nyc.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import captureEarthcamLiveStream from "./../../modules/captureEarthcamLiveStream.js";
import getWeather from "./../../modules/getWeather.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import { getNextItem } from "../../modules/rotationQueue.js";

process.on("unhandledRejection", (reason, p) => {
  console.error("NYCVIEWSBOT unhandledRejection:", reason);
});

const { botID } = getBotInfo(import.meta.url);

const botScript = async (params) => {
  const mastodon = new mastodonClient({
    // access_token: process.env.NYCVIEWSBOT_MASTODON_ACCESS_TOKEN,
    access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  let webcam;
  // const webcamId = "times_square";
  // const webcamId = "statue_of_liberty_harborcam";
  const webcamId = params?.webcam;

  if (webcamId) {
    const findWebcam = webcams.filter((webcam) => webcam.id === webcamId);
    if (webcams.length > 0) {
      webcam = findWebcam[0];
    }
  }

  if (!webcam) {
    const allWebcamIDs = webcams.map((w) => w.id);
    const nextWebcamID = await getNextItem(botID, allWebcamIDs);
    webcam = webcams.find((w) => w.id === nextWebcamID);
  }

  const webcamUrl = webcam.windy_id
    ? `📷 https://www.windy.com/-Webcams/webcams/${webcam.windy_id}`
    : `📷 ${webcam.link}`;

  const image = await captureEarthcamLiveStream(webcam, botID);

  if (!image || !image.path) {
    console.log("NYCVIEWSBOT: failed to capture image");
    return;
  }

  let weatherText = "";

  if (webcam.latitude) {
    try {
      const weather = await getWeather(webcam.latitude, webcam.longitude);
      if (weather.description_full) {
        weatherText = ` ${weather.description_full}`;
      }
    } catch (err) {
      console.log("NYCVIEWSBOT: failed to fetch weather:", err);
    }
  }

  const archiveLabel = image.isArchive ? " (archived footage)" : "";
  const status = `${webcam.title}${archiveLabel}\n\n${webcamUrl}\n\n#NYC #NewYorkCity #webcam`;

  await mastodon.postImage({
    status,
    image: image.path,
    alt_text: `${webcam.description}${weatherText}`,
  });
};

export default botScript;
