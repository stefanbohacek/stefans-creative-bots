import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const { verbs } = JSON.parse(
  readFileSync(
    join(__dirname, "../../data/corpora-curated/data/words/verbs.json"),
    "utf8",
  ),
);

const nounFiles = [
  { path: "objects/objects.json" },
  { path: "objects/clothing.json" },
  { path: "animals/common.json" },
  { path: "foods/fruits.json", cw: "Food mention" },
  { path: "foods/vegetables.json", cw: "Food mention" },
  { path: "foods/breads_and_pastries.json", cw: "Food mention" },
];

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        // access_token: process.env.MASTODON_TEST_TOKEN,
        access_token: process.env.XEDYOURLASTY_BOT_MASTODON_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      const { past } = randomFromArray(verbs);
      const nounFile = randomFromArray(nounFiles);
      const nounData = JSON.parse(
        readFileSync(
          join(__dirname, "../../data/corpora-curated/data", nounFile.path),
          "utf8",
        ),
      );
      const keys = Object.keys(nounData).filter((key) => key !== "description");
      const nouns = nounData[randomFromArray(keys)];
      const noun = randomFromArray(nouns);
      const status = `You have ${past} your last ${noun}.`;
      console.log(status);

      mastodon.post({
        status,
        ...(nounFile.cw && { spoiler_text: nounFile.cw }),
      });
    } catch (error) {
      console.log("@XedYourLastY error:", error);
    }
  })();
};

export default botScript;
