import mastodonClient from "./../../modules/mastodon/index.js";
import getRandomInt from "./../../modules/get-random-int.js";
import randomFromArray from "./../../modules/random-from-array.js";
import emoji from "./../../data/emoji.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.EMOJI_STORIES_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const randomEmoji = randomFromArray(emoji, getRandomInt(4,6));
  const status = randomEmoji.join(" ") + " \n\n#emoji #WritingPrompt #EmojiStories";
  mastodon.post({
    status
  });
};

export default botScript;
