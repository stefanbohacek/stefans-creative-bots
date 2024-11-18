import mastodonClient from "./../../modules/mastodon/index.js";

import webcams from "./../../data/webcams/african-wildlife.js";
import extractVideoLive from "./../../modules/extract-video-live.js";
import extractVideo from "./../../modules/extract-video.js";
import randomFromArray from "./../../modules/random-from-array.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "africanwildlife";

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.AFRICAN_WILDLIFE_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      const webcam = randomFromArray(webcams);
      // const status = `${webcam.name}: ${webcam.url}\n\n${webcam.tags}`;
      const status = `${webcam.name}: ${webcam.youtube_url}\n\n${webcam.tags}`;

      mastodon.post(
        {
          status,
        },
        () => {
          console.log("done");
        }
      );

      // await extractVideoLive(webcam.youtube_url, `${botID}.mp4`, 10);

      // mastodon.postImage({
      //   status,
      //   image: __dirname + `/../../temp/${botID}.mp4`,
      //   alt_text: webcam.description,
      // }, () => {
      //   console.log('done');
      // });
    } catch (error) {
      console.log(`${botID} error`, error);
    }
  })();
};

export default botScript;
