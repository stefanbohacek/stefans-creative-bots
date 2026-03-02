import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import wikidata from "./../../modules/wikidata.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  const items = await wikidata(
    /* sql */ `
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image ?article 
    WHERE 
    {
      ?item wdt:P105 wd:Q34740 .
      ?item wdt:P171+ wd:Q430 .
      ?item schema:description ?itemDescription FILTER (LANG(?itemDescription) = "en") .
      ?item wdt:P18 ?image .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      {
        ?article schema:about ?item .
        ?article schema:inLanguage "en" .
        ?article schema:isPartOf <https://en.wikipedia.org/>
      }
    }
  `,
    true,
  );

  // TODO: Temporary fix until I can figure out the query.

  const dinosaurs = items.filter(
    (item) =>
      item.description?.toLowerCase().includes("dinosaur") ||
      item.description?.toLowerCase().includes("reptile"),
  );

  const item = randomFromArray(dinosaurs);

  // console.log("items", items);
  // console.log("dinosaurs", dinosaurs);
  // console.log("item", item);

  let imageUrl = "";

  if (item.image) {
    imageUrl = item.image;
  }

  const status = `${item.label}.\n\n${item.wikipediaUrl}\n\n#dinosaur`;

  const filePath = `${__dirname}/../../temp/dinosaur.jpg`;
  await downloadFile(imageUrl, filePath);

  const mastodon = new mastodonClient({
    access_token: process.env.DINOSAURS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  mastodon.postImage({
    status: status.replace("  ", " "),
    image: filePath,
    alt_text:
      "A photo or drawing of a dinosaur or dinosaur remains from the linked Wikipedia page.",
  });

  return true;
};

export default botScript;
