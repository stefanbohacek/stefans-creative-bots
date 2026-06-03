import pollockGenerator from "./../../modules/generators/pollock.js";
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.POLLOCKDOTEXE_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });
  const status = "🎨🤖 #GenerativeArt",
    options = {
      width: 1184,
      height: 506,
    };

  const { gif: imageDataGIF, imageDataStatic } =
    await pollockGenerator(options);

  const firstPost = await mastodon.postImage({
    status,
    image: imageDataStatic,
    alt_text: "Animated generative art in the style of Jackson Pollock.",
  });

  if (firstPost && firstPost.id) {
    await mastodon.postImage({
      status,
      image: imageDataGIF,
      alt_text: "Generative art in the style of Jackson Pollock",
      in_reply_to_id: firstPost.id,
    });
  }
};

export default botScript;
