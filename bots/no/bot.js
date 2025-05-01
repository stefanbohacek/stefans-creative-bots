import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  await (async () => {
    const botID = "@no";

    try {
      const mastodon = new mastodonClient({
        access_token: process.env.NO_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      mastodon.post({
        status: "No.",
      });
    } catch (error) {
      console.log(`${botID} error`, error);
    }
  })();
};

export default botScript;
