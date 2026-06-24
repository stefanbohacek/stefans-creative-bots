import mastodonClient from "./../../modules/mastodon/index.js";
import {
  file as downloadFile,
  json as fetchJSON,
} from "./../../modules/fetch.js";
import getWeather from "./../../modules/getWeather.js";
import { checkImageLuminosity } from "./../../modules/luminosity.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import runCommand from "./../../modules/runCommand.js";
import sleep from "./../../modules/sleep.js";
import getBotInfo from "./../../modules/getBotInfo.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { botID } = getBotInfo(import.meta.url);

const botScript = async (retries = 0) => {
  if (retries >= 10) {
    console.log(`${botID}: max retries reached`);
    return;
  }
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.AT_SEA_ACCESS_TOKEN_SECRET,
    api_url: process.env.MASTODON_API_URL,
  });

  const stationList = `https://www.ndbc.noaa.gov/buoycams.php`;
  const excludedStationIDs = ["44008", "46080", "46029", "42003"];

  console.log(`${botID}: fetching stations...`, stationList);

  let stations;
  try {
    stations = await fetchJSON(stationList);
  } catch (err) {
    console.log(
      `${botID}: station list fetch failed, retrying...`,
      err.message,
    );
    await sleep(30000);
    await botScript(retries + 1);
    return;
  }

  stations = stations.filter(
    (station) => !excludedStationIDs.includes(station.id),
  );

  stations = stations.filter((station) => {
    let includeStation = true;

    if (!station.id || !station.img || !station.width || !station.height) {
      includeStation = false;
    }
    return includeStation;
  });

  if (!stations.length) {
    console.log(`${botID}: no valid stations found, retrying...`);
    await sleep(30000);
    await botScript(retries + 1);
    return;
  }

  const station = randomFromArray(stations);
  // const station = stations.filter((station) => station.id === "46085");
  const imageWidth = station.width / 6;

  console.log("picking a station at sea...", station);

  const stationURL = `https://www.ndbc.noaa.gov/station_page.php?station=${station.id}`;
  const imageURL = `https://www.ndbc.noaa.gov/buoycam.php?station=${station.id}`;

  const fileName = "buoycam";
  const fileExt = "jpg";
  const filePath = `${__dirname}/../../temp/${fileName}.${fileExt}`;

  try {
    await downloadFile(imageURL, filePath);
    await runCommand(`convert ${filePath}`, [
      "-crop",
      `${imageWidth}x270`,
      `${__dirname}/../../temp/buoycam-cropped.jpg`,
    ]);

    let okayPictures = [];

    const forLoop = async (_) => {
      for (let i = 0; i <= 5; i++) {
        const croppedFilePath = `${__dirname}/../../temp/${fileName}-cropped-${i}.${fileExt}`;
        if (await checkImageLuminosity(croppedFilePath)) {
          okayPictures.push(croppedFilePath);
        }
      }
    };

    await forLoop();

    if (okayPictures.length) {
      const selectedImagePath = randomFromArray(okayPictures);
      const weather = await getWeather(station.lat, station.lng);
      const status = `${station.name}\n\n${weather.description_full}\nStation: ${stationURL}\nLocation: http://www.openstreetmap.org/?mlat=${station.lat}&mlon=${station.lng}&zoom=2\n#sea #ocean #water #webcam`;

      await mastodon.postImage({
        status,
        image: selectedImagePath,
        alt_text: "This is an image captured by a buoy floating at sea.",
      });
    } else {
      console.log("no good pictures, retrying...");
      await sleep(30000);
      await botScript(retries + 1);
    }
  } catch (error) {
    console.log(`${botID} error:`, error, "retrying...");
    await sleep(30000);
    await botScript(retries + 1);
  }

  return true;
};

export default botScript;
