import mastodonClient from "./../../modules/mastodon/index.js";

import webcams from "./../../data/webcams/aerial-views.js";
import extractVideoLive from "./../../modules/extractVideoLive.js";
import extractVideo from "./../../modules/extractVideo.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const botScript = async () => {
 await (async () => {
    try {
      const mastodon = new mastodonClient({
        // access_token: process.env.MASTODON_TEST_TOKEN,
        access_token: process.env.AERIAL_VIEWS_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      const webcam = randomFromArray(webcams);
      const status = `${webcam.name}: ${webcam.youtube_url}\n\n${webcam.tags}`;
      await extractVideoLive(webcam.youtube_url, `${botID}.mp4`, 10);

      await mastodon.postImage({
        status,
        image: getTempDirPath("mp4"),
        alt_text: webcam.description,
      });
    } catch (error) {
      console.log(`${botID} error`, error);
      throw error;
    }
  })();
}

export default botScript;
