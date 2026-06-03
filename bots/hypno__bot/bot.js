import getRandomHex from "./../../modules/getRandomHex.js";
import shadeColor from "./../../modules/shadeColor.js";
import invertColor from "./../../modules/invertColor.js";

import spiralGenerator from "./../../modules/generators/spiral.js";
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.HYPNOBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const color = getRandomHex();

  const status = "#hypnosis #spiral #gif #GenerativeArt",
    options = {
      color: color,
      background: shadeColor(invertColor(color), 0.5),
      width: 640,
      height: 480,
    };

  const image = await spiralGenerator(options);
  await mastodon.postImage({
    status,
    image,
    alt_text: `Animated spiral.`,
  });
}


export default botScript;
