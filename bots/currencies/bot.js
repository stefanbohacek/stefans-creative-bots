import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import wikidata from "./../../modules/wikidata.js";
import downloadFile from "./../../modules/download-file.js";
import capitalizeFirstLetter from "./../../modules/capitalize-first-letter.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.CURRENCIES_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const items = await wikidata(`
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image ?article WHERE {
        ?item wdt:P31 wd:Q8142 .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        OPTIONAL {
          ?item wdt:P18 ?image .
          ?article schema:about ?item .
          ?article schema:inLanguage "en" .
          ?article schema:isPartOf <https://en.wikipedia.org/>
        }
    } 
  `, true);

  const item = randomFromArray(items);
  // console.log(item);

  const status = `${item.label ? `${item.label}, ` : ""} ${
    item.description ? `${item.description}. ` : ""
  }\n\n${item.wikipediaUrl}\n\n#money #currency`.replace("  ", " ");

  if (item.image) {
    const imageUrl = item.image;
    const filePath = `${__dirname}/../../temp/currency.jpg`;
    await downloadFile(imageUrl, filePath);
  
    mastodon.postImage({
      status: capitalizeFirstLetter(status),
      image: filePath,
      alt_text:
        "A photo of a currency from the linked website.",
    });
  
  } else {
    mastodon.post({
      status: status,
    });
  }

  return true;
};

export default botScript;
