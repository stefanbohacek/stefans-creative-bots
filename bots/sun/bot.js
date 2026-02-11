import fs from "fs";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const botID = "sun";

const botScript = async () => {
  (async () => {
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

      const imgPath = `${__dirname}/../../temp/${botID}.jpg`;
      await downloadFile(camera.imageURL, imgPath);
      let status = `${camera.url}\n\n#TheSun #space #astronomy #telescope`;

      const imgData = await fs.readFileSync(imgPath, {
        encoding: "base64",
      });

      mastodon.postImage({
        status,
        image: imgData,
        alt_text: camera.description,
      });
    } catch (error) {
      console.log("sun:error", error);
    }
  })();
};

export default botScript;
