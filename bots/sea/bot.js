import fetch from 'node-fetch';
import mastodonClient from "./../../modules/mastodon/index.js";

import downloadFile from "./../../modules/download-file.js";
import getWeather from "./../../modules/get-weather.js";
import getImageLuminosity from "./../../modules/get-image-luminosity.js";
import randomFromArray from "./../../modules/random-from-array.js";
import runCommand from "./../../modules/run-command.js";

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.AT_SEA_ACCESS_TOKEN_SECRET,
    api_url: process.env.BOTSINSPACE_API_URL,
  });
  
  const stationList = `https://www.ndbc.noaa.gov/buoycams.php`;
  const stationExclude = [46080, 46029, 42003];

  const response = await fetch(stationList);
  let stations = await response.json();
  
  stations = stations.filter(
    (station) => stationExclude.indexOf(station.id) === -1
  );
  const station = randomFromArray(stations);
  const imageWidth = station.width / 6;

  console.log("picking a station at sea...", station);

  const stationURL = `https://www.ndbc.noaa.gov/station_page.php?station=${station.id}`;
  const imageURL = `https://www.ndbc.noaa.gov/buoycam.php?station=${station.id}`;

  const fileName = "buoycam";
  const fileExt = "jpg";
  const filePath = `${__dirname}/../../temp/${fileName}.${fileExt}`;

  await downloadFile(imageURL, filePath);
  await runCommand(`convert ${filePath}`,  [
    '-crop', `${imageWidth}x270`,
    `${__dirname}/../../temp/buoycam-cropped.jpg`
  ]);

  let okayPictures = [];

  const forLoop = async (_) => {
    for (let i = 0; i <= 5; i++) {
      const croppedFilePath = `${__dirname}/../../temp/${fileName}-cropped-${i}.${fileExt}`;
      const luminosity = await getImageLuminosity(croppedFilePath);

      if (luminosity > 40) {
        okayPictures.push(croppedFilePath);
      }
    }
  };

  await forLoop();

  if (okayPictures.length) {
    const selectedImagePath = randomFromArray(okayPictures);
    const weather = await getWeather(station.lat, station.lng);
    const status = `${station.name}\n\n${weather.description_full}\nStation: ${stationURL}\nLocation: http://www.openstreetmap.org/?mlat=${station.lat}&mlon=${station.lng}&zoom=2\n#sea #ocean #water #webcam`;

    mastodon.postImage({
      status,
      image: selectedImagePath,
      alt_text: "This is an image captured by a buoy floating at sea."
    });    
  } else {
    botScript();
  }
  return true;
};

export default botScript;
