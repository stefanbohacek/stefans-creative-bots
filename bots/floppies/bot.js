import floppies from "./../../data/floppies.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import downloadFileAsBase64 from "./../../modules/downloadFileAsBase64.js";
import getBotInfo from "./../../modules/getBotInfo.js";
const { botID } = getBotInfo(import.meta.url);
const hashtags = "#floppy #RetroTechnology";

const botScript = async () => {
  try {
    await (async () => {
      const mastodon = new mastodonClient({
        // access_token: process.env.MASTODON_TEST_TOKEN,
        access_token: process.env.FLOPPIES_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      const floppy = randomFromArray(floppies);
      const imgData = await downloadFileAsBase64(floppy.img_url);

      await mastodon.postImage({
        status: `Via ${floppy.source}\n\n${hashtags}`,
        image: imgData,
        alt_text:
          floppy.alt_text ||
          `A photo of a floppy disk labeled "${floppy.title}".`,
      });

      return true;
    })();
  } catch (error) {
    console.log(`@${botID} error:`, error, floppy);
  }
};

export default botScript;
