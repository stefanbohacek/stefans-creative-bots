import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import emoji from "./../../data/emoji.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.EMOJI__POLLS_MASTODON_ACCESS_TOKEN,
    api_url: process.env.EMOJI__POLLS_MASTODON_API,
  });

  const options = randomFromArray(emoji, 4);
  const status = options.join(" ") + " #emoji #poll";
  console.log({ status, options });
  mastodon.postPoll(status, options);
};

export default botScript;
