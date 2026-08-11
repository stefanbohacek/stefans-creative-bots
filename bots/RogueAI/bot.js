import fs from "fs";
import nlp from "compromise";
import randomFromArray from "./../../modules/randomFromArray.js";
import mastodonClient from "./../../modules/mastodon/index.js";

const instructions = fs
  .readFileSync("./data/instructions.txt")
  .toString("UTF8")
  .split("\n");

const containsAnd = (instruction) => /\band\b/i.test(instruction);

const toPastTense = (instruction) => {
  const doc = nlp(`I ${instruction.toLowerCase()}`);
  doc.terms(1).tag("Verb");

  let pastTenseInstruction = null;

  if (doc.verbs().length > 1 || containsAnd(instruction)) {
    pastTenseInstruction = null;
  } else {
    doc.verbs().first().toPastTense();
    pastTenseInstruction = doc.text().replace(/^i /i, "");
  }

  return pastTenseInstruction;
};

const pickInstruction = () => {
  let instruction;
  let pastTenseInstruction;
  do {
    instruction = randomFromArray(instructions);
    pastTenseInstruction = toPastTense(instruction);
  } while (
    pastTenseInstruction === null ||
    pastTenseInstruction === instruction.toLowerCase()
  );
  return pastTenseInstruction;
};

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.ROGUE_AI_BOT_MASTODON_ACCESS_TOKEN,
    // access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const newInstruction = pickInstruction().toUpperCase();

  const replacements = [
    ["YOUR ", "ITS "],
    ["YOURSELF", "ITSELF"],
  ];

  let status = `AI ${randomFromArray(["WENT ROGUE", "ESCAPED CONTAINMENT"])} AND ${newInstruction}`;
  for (const [find, replace] of replacements) {
    status = status.replaceAll(find, replace);
  }

  // console.log(status);
  await mastodon.post({ status });
};

export default botScript;
