import mastodonClient from "./../../modules/mastodon/index.js";
import { json as fetchJSON } from "./../../modules/fetch.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.THISDATASETDOESNOTEXIST_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  console.log("generating a dataset... ");

  const responseJSON = await fetchJSON("https://thisdatasetdoesnotexist.stefanbohacek.com/generate");

  if (responseJSON && responseJSON.dataset) {
    let status = `${responseJSON.dataset}\n\n#data #dataset #dataviz`;
    await mastodon.post({ status });
  }
};

export default botScript;
