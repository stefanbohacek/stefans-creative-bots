import snowGenerator from "./../../modules/generators/snow.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.SNOWDOTGIFBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.SNOWDOTGIFBOT_MASTODON_API,
  });

  const status = randomFromArray([
      "🌨️ #snow #weather #gif",
      "🌨️🌨️ #snow #weather #gif",
      "🌨️🌨️🌨️ #snow #weather #gif",
    ]),
    options = {
      width: 640,
      height: 480,
    };

  snowGenerator(options, (err, image) => {
    mastodon.postImage({
      status,
      image,
      alt_text: "Animdated GIF of snow.",
    });
  });
};

export default botScript;
