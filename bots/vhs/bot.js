import fs from "fs";
import mastodonClient from "./../../modules/mastodon/index.js";
import webcams from "./../../data/webcams/vhs.js";
import extractVideoLive from "./../../modules/extractVideoLive.js";
import { file as downloadFile } from "./../../modules/fetch.js";
import getRandomInt from "./../../modules/getRandomInt.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        // access_token: process.env.MASTODON_TEST_TOKEN,
        access_token: process.env.VHS_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      const webcam = randomFromArray(webcams);
      const status = `${webcam.youtube_url}\n\n${webcam.tags}`;

      if ("video_start" in webcam && "video_end" in webcam) {
        const url = `https://tools.stefanbohacek.com/video-dl/?platform=youtube&id=${
          webcam.youtube_id
        }&start=${getRandomInt(
          webcam.video_start,
          webcam.video_end - 10
        )}&length=10&token=${process.env.STEFANS_TOOLS_ACCESS_TOKEN}`;
        console.log(url);
        await downloadFile(url, getTempDirPath("mp4"));
        try {
          fs.renameSync(
            getTempDirPath("mp4.mkv"),
            getTempDirPath("mp4")
          );
        } catch (err) {
          /* noop */
        }
      } else {
        await extractVideoLive(webcam.youtube_url, `${botID}.mp4`, 10);
      }
      
      console.log({status, alt_text: webcam.description});

      await mastodon.postImage({
        status,
        spoiler_text: "May contain flashing images.",
        image: getTempDirPath("mp4"),
        alt_text: webcam.description,
      });
    } catch (error) {
      console.log(`${botID} error`, error);
      throw error;
    }
  })();
};

export default botScript;
