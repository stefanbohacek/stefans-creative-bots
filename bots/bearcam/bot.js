import fs from "fs";
import mastodonClient from "./../../modules/mastodon/index.js";
import webcams from "./../../data/webcams/bearcams.js";
import extractVideoLive from "./../../modules/extract-video-live.js";
import downloadFile from "./../../modules/download-file.js";
import getRandomInt from "./../../modules/get-random-int.js";
import randomFromArray from "./../../modules/random-from-array.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "bearcam";

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.BEARCAM_ACCESS_TOKEN_SECRET,
        api_url: process.env.BOTSINSPACE_API_URL,
      });

      // const webcam = randomFromArray(webcams);
      const webcam = randomFromArray(
        webcams.filter((webcam) => webcam.video_start === undefined)
      );

      console.log(webcam);
      const status = `${webcam.name}: ${webcam.youtube_url}\n\n${webcam.tags}`;

      if ("video_start" in webcam && "video_end" in webcam) {
        const url = `https://tools.stefanbohacek.dev/video-dl/?platform=youtube&id=${
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

      mastodon.postImage({
        status,
        image: __dirname + `/../../temp/${botID}.mp4`,
        alt_text: webcam.description,
      });
    } catch (error) {
      console.log(`${botID} error`, error);
    }
  })();
};

export default botScript;
