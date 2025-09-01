import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import wikidata from "./../../modules/wikidata.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  // Query via Wikidata Weekly Summary #695
  const items = await wikidata(
    `
  SELECT ?item ?itemLabel ?itemDescription ?audioFile ?article
  WHERE {
    ?item wdt:P31 wd:Q16521 ;
          wdt:P171* wd:Q5113 ;
          wdt:P51 ?audioFile .
          ?item schema:description ?itemDescription FILTER (LANG(?itemDescription) = "en") . 
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      {
        ?article schema:about ?item .
        ?article schema:inLanguage "en" .
        ?article schema:isPartOf <https://en.wikipedia.org/>
      }
  }
  LIMIT 10000
`,
    false
  );

  console.log("items", items);

  const item = randomFromArray(items);
  console.log(item);

  const status = `${item.label}\n\n${item.wikipediaUrl}\n\n#birds`;

  const filePath = `${__dirname}/../../temp/bird.ogg`;
  await downloadFile(item.audio, filePath);

  const mastodon = new mastodonClient({
    access_token: process.env.BIRDS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  mastodon.postImage({
    status: status.replace("  ", " "),
    image: filePath,
    alt_text: "A recording of a bird singing.",
  });

  return true;
};

export default botScript;
