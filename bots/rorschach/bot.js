import rorschachGenerator from "./../../modules/generators/rorschach.js";
import randomFromArray from "./../../modules/random-from-array.js";
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.RORSCHACH_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const prompts = [
    "What do you see?",
    "Describe what's in this image.",
    "Choose a word that best describes this image.",
    "What word would you use to describe this image?",
    "What would be the best description of this image?",
    "How does this image make you feel?",
    "What does this image remind you of?"
  ];

  const status = `${randomFromArray(
    prompts
  )}\n\n#rorschach #RorschachTest #GenerativeArt`;

  const options = {
    width: 640,
    height: 480,
    resolution: 5,
    inkThreshold: 0.75,
    noiseLevelX: 0.15,
    noiseLevelY: 0.15,
    overlapAmount: -4,
  };

  rorschachGenerator(options, (err, image) => {
    mastodon.postImage({
      status,
      image,
      alt_text: "A randomly generated symmetrical pixelated ink blot pattern.",
    });
  });
};

export default botScript;
