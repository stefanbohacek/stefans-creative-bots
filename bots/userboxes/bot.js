import mastodonClient from "./../../modules/mastodon/index.js";
import { getRandomUserbox } from "../../modules/wikipedia.js";
import renderHTML from "../../modules/renderHtml.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { writeFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const botID = "userboxes";
const imagePath = `${__dirname}/../../temp/${botID}.png`;

const botScript = async () => {
  try {
    const mastodon = new mastodonClient({
      // access_token: process.env.MASTODON_TEST_TOKEN,
      access_token: process.env.WIKIPEDIA_USERBOXES_BOT_ACCESS_TOKEN_SECRET,
      api_url: process.env.MASTODON_API_URL,
    });

    const { text, html } = await getRandomUserbox();

    const imageBuffer = await renderHTML({
      html,
      cssUrls: [
        "https://en.wikipedia.org/w/load.php?modules=site.styles&only=styles&skin=vector",
      ],
      cssInline: /* css */ `
        body {
          transform: scale(2);
          transform-origin: top left;
        }
      `,
    });

    await writeFile(imagePath, imageBuffer);

    mastodon.postImage({
      status: `#wikipedia`,
      image: imagePath,
      alt_text: text,
    });
  } catch (error) {
    console.log(`${botID} error`, error);
  }
};

export default botScript;
