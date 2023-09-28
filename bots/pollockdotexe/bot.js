import pollockGenerator from "./../../modules/generators/pollock.js";
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.POLLOCKDOTEXE_MASTODON_ACCESS_TOKEN,
    api_url: process.env.POLLOCKDOTEXE_MASTODON_API,
  });
  const status = "🎨🤖 #GenerativeArt",
    options = {
      width: 1184,
      height: 506,
    };

  pollockGenerator(options, function (err, imageDataGIF, imageDataStatic) {
    mastodon.postImage(
      {
        status,
        image: imageDataStatic,
        alt_text: "Animated generative art in the style of Jackson Pollock.",
      },
      (err, data, response) => {
        if (data && data.id) {
          mastodon.postImage({
            status,
            image: imageDataGIF,
            alt_text: "Generative art in the style of Jackson Pollock",
            in_reply_to_id: data.id,
          });
        }
      }
    );
  });
};

export default botScript;
