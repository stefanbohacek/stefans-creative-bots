import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import mastodonClient from "./../../modules/mastodon/index.js";
import downloadFile from './../../modules/download-file.js';


const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.INTROSPECTORBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.INTROSPECTORBOT_MASTODON_API,
  });

  const url = `https://api.screenshotmachine.com?key=${process.env.SCREENSHOTMACHINE_API_KEY}&url=https%3A%2F%2Ftwitter.com%2Fintrospectorbot&dimension=1024x768&cacheLimit=0&delay=3000`;

  const filePath = `${__dirname}/../../temp/introspector.jpg`;
  await downloadFile(url, filePath);

  const status = "";

  mastodon.postImage({
    status,
    image: filePath,
    // alt_text: datasetName,
  });
}

export default botScript;
