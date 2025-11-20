import fs from "fs";
import randomFromArray from "./../../modules/random-from-array.js";
import mastodonClient from "./../../modules/mastodon/index.js";

const instructions = fs
  .readFileSync("./data/pet-rock.txt")
  .toString("UTF8")
  .split("\n");

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.PET_ROCK_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const status = randomFromArray(instructions) + "\n\n#pets #PetRock";
  mastodon.post({ status });
};

export default botScript;
