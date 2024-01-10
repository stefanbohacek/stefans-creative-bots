import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.VIBECHECK_BOT_MASTODON_TOKEN,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  const options = ["Great!", "Could be better."];
  const status = "How's your day going? #vibe #VibeCheck #poll";
  console.log({ status, options });
  mastodon.postPoll(status, options);
};

export default botScript;
