import mastodonClient from "./../../modules/mastodon/index.js";
import { base64 as downloadFileAsBase64 } from "./../../modules/fetch.js";


const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.INTROSPECTORBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const url = `https://api.screenshotmachine.com?key=${process.env.SCREENSHOTMACHINE_API_KEY}&url=https%3A%2F%2Ftwitter.com%2Fintrospectorbot&dimension=1024x768&cacheLimit=0&delay=3000`;

  const imgData = await downloadFileAsBase64(url);

  const status = "";

  await mastodon.postImage({
    status,
    image: imgData,
    // alt_text: datasetName,
  });
}

export default botScript;
