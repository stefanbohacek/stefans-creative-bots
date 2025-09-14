import stations from "./../../data/webcams/south-pole-stations.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import getWebcamImage from "./../../modules/getWebcamImage.js";
import getImageLuminosity from "./../../modules/get-image-luminosity.js";
import getWeather from "./../../modules/get-weather.js";

const botID = "southpoleviews";

const botScript = async () => {
  try {
    await (async () => {
      const mastodon = new mastodonClient({
        access_token: process.env.SOUTHPOLEVIEWS_BOT_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      const station = randomFromArray(stations);
      const imageFilePath = await getWebcamImage(botID, station);

      if (imageFilePath) {
        const luminosity = await getImageLuminosity(imageFilePath);

        if (luminosity > 40) {
          let description = `View from the ${station.name}.`;
          let weather;

          if (station.location) {
            weather = await getWeather(
              station.location.lat,
              station.location.lon
            );

            if (weather && weather.description_full) {
              description += ` ${weather.description_full}`;
            }
          }

          const status = `${station.name} via ${station.url} #SouthPole #antarctica #view #webcam`;

          mastodon.postImage({
            status,
            image: imageFilePath,
            alt_text: description,
          });
        } else {
          console.log("@southpoleviews: image too dark, retrying...");
          await botScript();
        }
      } else {
        console.log("@southpoleviews: image not found, retrying...");
        await botScript();
      }
    })();
  } catch (error) {
    console.log("southpoleviews error:", error);
  }
};

export default botScript;
