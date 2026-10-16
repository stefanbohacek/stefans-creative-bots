import MastodonClient from "./mastodon/index.js";

export default (bot) => {
  let client = null;
  const accessToken = bot.about.access_token_env
    ? process.env[bot.about.access_token_env]
    : null;

  if (accessToken && process.env.MASTODON_API_URL) {
    client = new MastodonClient({
      access_token: accessToken,
      api_url: process.env.MASTODON_API_URL,
    });
  }

  return client;
};
