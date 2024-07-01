import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import wikidata from "./../../modules/wikidata.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  const items = await wikidata(`
    SELECT ?item ?itemLabel ?placeLabel ?itemDescription ?lon ?lat ?image ?article 
    WHERE 
    {
      VALUES ?type {  wd:Q28542014 wd:Q68  }
      ?item wdt:P31 ?type .
      ?item schema:description ?itemDescription FILTER (LANG(?itemDescription) = "en") . 
      ?item wdt:P18 ?image;
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      {
        ?article schema:about ?item .
        ?article schema:inLanguage "en" .
        FILTER (SUBSTR(str(?article), 1, 25) = "https://en.wikipedia.org/")
      }
    }
  `);

  const item = randomFromArray(items);
  console.log(item);
  let imageUrl = "";

  if (item.image) {
    imageUrl = item.image;
  }

  const status = `${item.label ? `${item.label}, ` : ""} ${
    item.description ? `${item.description}. ` : ""
  }\n\n${item.wikipediaUrl}\n\n#computers #tech #technology`;

  const filePath = `${__dirname}/../../temp/computer.jpg`;
  await downloadFile(imageUrl, filePath);

  const mastodon = new mastodonClient({
    access_token: process.env.COMPUTERS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  mastodon.postImage({
    status: status.replace("  ", " "),
    image: filePath,
    alt_text:
      "A photo of a computer from the linked website.",
  });

  return true;
};

export default botScript;
