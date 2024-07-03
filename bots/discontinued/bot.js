import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import wikidata from "./../../modules/wikidata.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  const items = await wikidata( /* sql */`
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

  const status = `Hey, remember ${item.label}?\n\n${item.wikipediaUrl}\n\n#discontinued #nostalgia`;

  const filePath = `${__dirname}/../../temp/discontinued.jpg`;
  await downloadFile(imageUrl, filePath);

  const mastodon = new mastodonClient({
    // access_token: process.env.DISCONTINUED_BOT_MASTODON_ACCESS_TOKEN,
    access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  mastodon.postImage({
    status: status.replace("  ", " "),
    image: filePath,
    alt_text:
      "A photo or a logo of a discontinued product or service from the linked website.",
  });

  return true;
};

export default botScript;
