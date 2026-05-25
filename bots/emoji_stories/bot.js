import mastodonClient from "./../../modules/mastodon/index.js";
import getRandomInt from "./../../modules/getRandomInt.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import emojiList from "./../../data/emoji-list.json" with { type: "json" };

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.EMOJI_STORIES_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const prompts = [
    "Write a short story based on these emoji:",
    "Come up with a story based on these emoji:",
    "Can you write a story based on these emoji?",
  ];

  const selectedPrompt = randomFromArray(prompts);
  const selectedEmoji = randomFromArray(emojiList, getRandomInt(4, 6));
  const selectedEmojiLines = selectedEmoji
    .map((item) => `${item.emoji}: ${item.name}`)
    .join("\n");

  const status =
    selectedPrompt +
    "\n\n" +
    selectedEmojiLines +
    "\n\n#emoji #WritingPrompt #EmojiStories";

  mastodon.post({
    status,
  });
};

export default botScript;
