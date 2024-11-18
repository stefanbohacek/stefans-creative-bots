import mastodonClient from "./../../modules/mastodon/index.js";
import isPrime from "./../../modules/is-prime.js";

const botScript = async () => {
  const timestamp = Date.now();

  if (isPrime(timestamp)) {
    const status = `BEEP! ${timestamp} is a prime number!`;
    console.log(status);

    const mastodon = new mastodonClient({
      access_token: process.env.PRIMESTAMP_BOT_MASTODON_ACCESS_TOKEN,
      api_url: process.env.MASTODON_API_URL,
    });
    mastodon.post({ status });
  } else {
    console.log(`${timestamp} is not a prime number...`);
  }
};

export default botScript;
