import mastodonClient from "./../../modules/mastodon/index.js";
import { getRandomUserbox } from "../../modules/wikipedia.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.WIKIPEDIA_USERBOXES_BOT_ACCESS_TOKEN_SECRET,
    api_url: process.env.MASTODON_API_URL,
  });

  const status = await getRandomUserbox();
  mastodon.post({ status: `${status}\n\n#wikipedia` });
};

export default botScript;
