import mastodonClient from "./../../modules/mastodon/index.js";
const botScript = async () => {
  const date = new Date();
  const month = date.toLocaleString("default", { month: "long" });
  const day = new Date().getDate();
  const status = `https://en.wikipedia.org/wiki/${month}_${day}\n\n#OnThisDay #OTD #history #wikipedia`;

  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.WIKIPEDIAOTD_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  mastodon.post({
    status,
  });

  return true;
};

export default botScript;
