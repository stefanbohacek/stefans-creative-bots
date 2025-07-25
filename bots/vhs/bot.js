import fs from "fs";
import mastodonClient from "./../../modules/mastodon/index.js";
import webcams from "./../../data/webcams/vhs.js";
import extractVideoLive from "./../../modules/extract-video-live.js";
import downloadFile from "./../../modules/download-file.js";
import getRandomInt from "./../../modules/get-random-int.js";
import randomFromArray from "./../../modules/random-from-array.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "vhs";

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
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
        await downloadFile(url, __dirname + `/../../temp/${botID}.mp4`);
        try {
          fs.renameSync(
            __dirname + `/../../temp/${botID}.mp4.mkv`,
            __dirname + `/../../temp/${botID}.mp4`
          );
        } catch (err) {
          /* noop */
        }
      } else {
        await extractVideoLive(webcam.youtube_url, `${botID}.mp4`, 10);
      }
      
      console.log({status, alt_text: webcam.description});

      mastodon.postImage({
        status,
        spoiler_text: "May contain flashing images.",
        image: __dirname + `/../../temp/${botID}.mp4`,
        alt_text: webcam.description,
      });
    } catch (error) {
      console.log(`${botID} error`, error);
    }
  })();
};

export default botScript;
