import stations from "./../../data/webcams/south-pole-stations.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import getWebcamImage from "./../../modules/getWebcamImage.js";
import { getNextItem } from "../../modules/rotationQueue.js";
import getImageLuminosity from "./../../modules/getImageLuminosity.js";
import getWeather from "./../../modules/getWeather.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);
const hashtags = "#SouthPole #antarctica #view #webcam";

const botScript = async () => {
  try {
    await (async () => {
      const mastodon = new mastodonClient({
        access_token: process.env.SOUTHPOLEVIEWS_BOT_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      const allStationIDs = stations.map((s) => s.id);
      const nextStationID = await getNextItem(botID, allStationIDs);
      const station = stations.find((s) => s.id === nextStationID);
      const imageFilePath = await getWebcamImage(botID, station);

      if (imageFilePath) {
        const luminosity = await getImageLuminosity(imageFilePath);

        if (luminosity > 40) {
          let description = station.description
            ? station.description
            : `View from the ${station.name}.`;
          let weather;

          if (station.location) {
            weather = await getWeather(
              station.location.lat,
              station.location.lon,
            );

            if (weather && weather.description_full) {
              description += ` ${weather.description_full}`;
            }
          }

          const status = `${station.name} via ${station.url} ${hashtags}`;

          await mastodon.postImage({
            status,
            image: imageFilePath,
            alt_text: description,
          });
        } else {
          console.log(`@${botID}: image too dark, retrying...`);
          await botScript();
        }
      } else {
        console.log(`@${botID}: image not found, retrying...`);
        await botScript();
      }
    })();
  } catch (error) {
    console.log(`@${botID} error:`, error);
  }
};

export default botScript;
