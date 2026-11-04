import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mastodonClient from "./../../modules/mastodon/index.js";
import meme from "./../../modules/generators/meme.js";
import randomFromArray from "./../../modules/randomFromArray.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../../data");

const adjectives = readFileSync(join(dataDir, "adjectives.csv"), "utf8")
  .split("\n")
  .slice(1)
  .filter(Boolean)
  .map((line) => line.split(",")[1]);

const nounFiles = [
  "objects/objects.json",
  "objects/clothing.json",
  "animals/common.json",
  "foods/fruits.json",
  "foods/vegetables.json",
  "foods/breads_and_pastries.json",
];

const nouns = nounFiles.flatMap((nounFile) => {
  const nounData = JSON.parse(
    readFileSync(join(dataDir, "corpora-curated/data", nounFile), "utf8"),
  );
  return Object.keys(nounData)
    .filter((key) => key !== "description")
    .flatMap((key) => nounData[key])
    .map((noun) => noun.trim());
});

const fontFileName = "Cairo-700-3.ttf";
const fontFamily = "Cairo";

const botScript = async () => {
  const imageUrl =
    "https://bots.stefanbohacek.com/images/jaws-bigger-boat-cropped.jpg";

  const mastodon = new mastodonClient({
    access_token: process.env.BIGGER_BOAT_BOT_ACCESS_TOKEN_SECRET,
    // access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const adjective = randomFromArray(adjectives);
  const noun = randomFromArray(randomFromArray(nouns).split("/"));
  const article = /^[aeiou]/i.test(adjective) ? "an" : "a";
  const topText = "WE'RE GOING TO NEED";
  const bottomText = `${article} ${adjective} ${noun}`.toUpperCase();

  const image = await meme({
    imageUrl,
    topText,
    bottomText,
    fontFamily,
    fontFileName,
  });

  const status = `We're going to need ${article} ${adjective} ${noun}.`;

  await mastodon.postImage({
    status,
    image,
    alt_text: `A scene from the 1975 American thriller "Jaws" showing police chief Martin Brody, a white man in his forties wearing glasses, with a stunned expression on his face, and a cigarette in his mouth, standing on the deck of a boat, captioned "${topText}" at the top and "${bottomText}" at the bottom.`,
  });
};

export default botScript;
