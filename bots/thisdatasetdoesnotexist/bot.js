import fetch from 'node-fetch';
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.THISDATASETDOESNOTEXIST_MASTODON_ACCESS_TOKEN,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  console.log("generating a dataset... ");

  const response = await fetch("https://thisdatasetdoesnotexist.com/generate");
  const responseJSON = await response.json();

  if (responseJSON && responseJSON.dataset) {
    let status = `${responseJSON.dataset}\n\n#data #dataset #dataviz`;
    mastodon.post({ status });
  }
};

export default botScript;
