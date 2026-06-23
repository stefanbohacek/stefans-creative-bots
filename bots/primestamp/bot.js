import mastodonClient from "./../../modules/mastodon/index.js";
import isPrime from "./../../modules/isPrime.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const botScript = async () => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const oneHourAgo = nowSeconds - 3600;
  const primes = [];

  for (let ts = oneHourAgo; ts <= nowSeconds; ts++) {
    if (isPrime(ts)) {
      primes.push(ts);
    }
  }

  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.PRIMESTAMP_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  let rootStatus;

  if (primes.length === 0) {
    rootStatus = `There were no prime timestamps in the past hour.`;
  } else if (primes.length === 1) {
    rootStatus = `There was 1 prime timestamp in the past hour!`;
  } else {
    rootStatus = `There were ${primes.length} prime timestamps in the past hour!`;
  }

  console.log(`${botID}: ${rootStatus}`);
  const rootPost = await mastodon.post({ status: `${rootStatus}\n\n#math #PrimeNumbers #primes` });

  const list = primes.map((ts) => `- ${ts}`).join("\n");
  await mastodon.post({ status: list, in_reply_to_id: rootPost.id });
};

export default botScript;
