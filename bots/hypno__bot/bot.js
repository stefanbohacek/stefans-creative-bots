import getRandomHex from "./../../modules/get-random-hex.js";
import shadeColor from "./../../modules/shade-color.js";
import invertColor from "./../../modules/invert-color.js";

import spiralGenerator from "./../../modules/generators/spiral.js";
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.HYPNOBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.HYPNOBOT_MASTODON_API,
  });

  const color = getRandomHex();

  const status = "#hypnosis #spiral #gif #GenerativeArt",
    options = {
      color: color,
      background: shadeColor(invertColor(color), 0.5),
      width: 640,
      height: 480,
    };

  spiralGenerator(options, (err, image) => {
    mastodon.postImage({
      status,
      image,
      alt_text: `Animated spiral.`,
    });
  });  
}


export default botScript;
