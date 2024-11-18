import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import wikidata from "./../../modules/wikidata.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  const items = await wikidata(/* sql */ `
    SELECT DISTINCT ?item ?cui ?itemLabel ?itemDescription ?image ?logo ?article 
    WHERE 
    {
      ?item wdt:P2669 ?cui.
      ?item schema:description ?itemDescription FILTER (LANG(?itemDescription) = "en") . 
      ?item wdt:P18|wdt:P154 ?image;
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      {
        ?article schema:about ?item .
        ?article schema:inLanguage "en" .
        ?article schema:isPartOf <https://en.wikipedia.org/>
      }
    }    
  `);

  const item = randomFromArray(items);
  const status = `Hey, remember ${item.label}?\n\n${item.wikipediaUrl}\n\n#discontinued #nostalgia`;
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.DISCONTINUED_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  mastodon.post({
    status: status.replace("  ", " "),
  });

  return true;
};

export default botScript;
