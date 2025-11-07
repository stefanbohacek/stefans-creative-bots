import floppies from "./../../data/floppies.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import downloadFile from "./../../modules/download-file.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const botID = "floppies";
const hashtags = "#floppy #RetroTechnology";

const botScript = async () => {
  try {
    await (async () => {
      const mastodon = new mastodonClient({
        access_token: process.env.FLOPPIES_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      const floppy = randomFromArray(floppies);
      const filePath = `${__dirname}/../../temp/${botID}.jpg`;
      await downloadFile(floppy.img_url, filePath);

      mastodon.postImage({
        status: `Via ${floppy.source}\n\n${hashtags}`,
        image: filePath,
        alt_text:
          floppy.alt_text ||
          `A photo of a floppy disk labeled "${floppy.title}".`,
      });

      return true;
    })();
  } catch (error) {
    console.log(`@${botID} error:`, error);
  }
};

export default botScript;
