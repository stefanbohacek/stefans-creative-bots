import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { file as downloadFile } from "./../../modules/fetch.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const execAsync = promisify(exec);

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { botID } = getBotInfo(import.meta.url);

const botScript = async () => {
  await (async () => {
    const mastodon = new mastodonClient({
      access_token: process.env.SUN_BOT_MASTODON_ACCESS_TOKEN,
      // access_token: process.env.MASTODON_TEST_TOKEN,
      api_url: process.env.MASTODON_API_URL,
    });

    try {
      const cameras = [
        {
          name: "Extreme ultraviolet Imaging Telescope (EIT)",
          description:
            "Data from the Extreme ultraviolet Imaging Telescope (EIT) rendered as an animated GIF showing the Sun as a glowing and rotating red-colored orb with visible sun flares.",
          url: "https://soho.nascom.nasa.gov/data/realtime/gif/",
          imageURL:
            "https://soho.nascom.nasa.gov/data/LATEST/current_eit_304.gif",
        },
      ];

      const camera = randomFromArray(cameras);

      console.log(`@${botID}: downloading image from ${camera.imageURL}`);

      const imgPath = `${__dirname}/../../temp/${botID}.gif`;
      const resizedPath = `${__dirname}/../../temp/${botID}_resized.gif`;
      await downloadFile(camera.imageURL, imgPath);
      await execAsync(`ffmpeg -y -r 10 -i "${imgPath}" -vf "fps=10" -loop 0 "${resizedPath}"`);
      let status = `${camera.url}\n\n#TheSun #space #astronomy #telescope`;

      const imgData = await fs.readFileSync(resizedPath, {
        encoding: "base64",
      });

      await mastodon.postImage({
        status,
        image: imgData,
        alt_text: camera.description,
      });
    } catch (error) {
      console.log(`${botID} error:`, error);
      throw error;
    }
  })();
};

export default botScript;
