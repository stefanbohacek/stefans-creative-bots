import webcams from "./../../data/webcams/volcanoes.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import downloadFile from "./../../modules/download-file.js";
import randomFromArray from "./../../modules/random-from-array.js";
import getWeather from "./../../modules/get-weather.js";
import getImageLuminosity from "./../../modules/get-image-luminosity.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "volcanoviews";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.VOLCANOVIEWS_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const webcam = randomFromArray(webcams);
  const filePath = `${__dirname}/../../temp/${botID}.jpg`;
  await downloadFile(webcam.url, filePath);

  const luminosity = await getImageLuminosity(filePath);

  if (luminosity > 40) {
    const status = `${webcam.name} via ${webcam.page_url} #volcano #nature`;

    mastodon.postImage({
      status,
      image: filePath,
      alt_text: "Webcam view of a volcano.",
    });
    return true;
  } else {
    return await botScript();
  }
};

export default botScript;
