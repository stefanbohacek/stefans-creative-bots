import webcams from "./../../data/webcams/lakes.js";
import mastodonClient from "./../../modules/mastodon/index.js";

import downloadFile from "./../../modules/download-file.js";
import randomFromArray from "./../../modules/random-from-array.js";
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
  const webcam =   {
    title:
      "Lake Michigan, borders of Michigan, Wisconsin, Illinois, and Indiana, United States.",
    description:
      "This webcam usually shows a view of the Lake Michigan with a sliver of its beach in the foreground. A long pier with a house at its end crosses the middle of the view.",
    link: "https://www.earthcam.com/usa/michigan/grandhaven/lakemichigan/?cam=lakemichigan",
    url: "https://sgv.roundshot.com/download/139753501/?path=stadtluzern",
    latitude: 43.4501,
    longitude: -87.222015,
  }
  const webcamUrl = `📷 ${webcam.link}`;

  const filePath = `${__dirname}/../../temp/${botID}.jpg`;
  await downloadFile(webcam.url, filePath);

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
};

export default botScript;
