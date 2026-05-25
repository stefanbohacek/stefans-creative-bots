import rainGenerator from "./../../modules/generators/rain.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.RAINDOTGIFBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const status = randomFromArray([
      "🌧️ #rain #weather #gif",
      "🌧️🌧️ #rain #weather #gif",
      "🌧️🌧️🌧️ #rain #weather #gif",
    ]),
    options = {
      width: 640,
      height: 480,
    };

  rainGenerator(options, (err, image) => {
    mastodon.postImage({
      status,
      image,
      alt_text: "Animated GIF of rain.",
    });
  });
};

export default botScript;
