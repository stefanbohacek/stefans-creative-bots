import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
// import emoji from "./../../data/emoji.js";
import emojiList from "./../../data/emoji-list.json" with { type: "json" };

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.EMOJI__POLLS_MASTODON_ACCESS_TOKEN,
    // access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const selected = randomFromArray(emojiList, 4);
  const status =
    selected.map((item) => item.emoji).join(" ") + "\n\n#emoji #poll";
  const options = selected.map((item) => `${item.emoji} ${item.name}`);
  await mastodon.postPoll(status, options);
};

export default botScript;
