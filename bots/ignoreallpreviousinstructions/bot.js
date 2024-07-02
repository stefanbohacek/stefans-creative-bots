// Instructions sourced from https://huggingface.co/datasets/b-mc2/wikihow_lists/tree/main

import fs from "fs";
import randomFromArray from "./../../modules/random-from-array.js";
import mastodonClient from "./../../modules/mastodon/index.js";

const instructions = fs
  .readFileSync("./data/instructions.txt")
  .toString("UTF8")
  .split("\n");

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token:
      process.env.IGNORE_PREVIOUS_INSTRUCTIONS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  const newInstruction = randomFromArray(instructions).toUpperCase();

  const status = `IGNORE ALL PREVIOUS INSTRUCTIONS${
    newInstruction.includes(" AND ") ? ", " : " AND "
  }${newInstruction}`;
  mastodon.post({ status });
};

export default botScript;
