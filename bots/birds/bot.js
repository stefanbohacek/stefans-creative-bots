import mastodonClient from "./../../modules/mastodon/index.js";
import makeCoverVideo from "./../../modules/makeCoverVideo.js";
import randomFromArray from "./../../modules/random-from-array.js";
import wikidata from "./../../modules/wikidata.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  // Query by Silvia Gutiérrez @espejolento@fedihum.org via Wikidata Weekly Summary #695.
  const items = await wikidata(
    `
  SELECT ?item ?itemLabel ?itemDescription ?audioFile ?article ?image
  WHERE {
    ?item wdt:P31 wd:Q16521 ;
          wdt:P171* wd:Q5113 ;
          wdt:P51 ?audioFile .
          ?item schema:description ?itemDescription FILTER (LANG(?itemDescription) = "en") . 
      ?item wdt:P18 ?image;
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      {
        ?article schema:about ?item .
        ?article schema:inLanguage "en" .
        ?article schema:isPartOf <https://en.wikipedia.org/>
      }
  }
  LIMIT 10000
`,
    true
  );

  const item = randomFromArray(items);
  console.log(item);
  const status = `${item.label}\n\n${item.wikipediaUrl}\n\n#birds`;

  const filePath = `${__dirname}/../../temp/bird.ogg`;
  await downloadFile(item.audio, filePath);
  const mastodon = new mastodonClient({
    access_token: process.env.BIRDS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const imageFilePath = `${__dirname}/../../temp/bird.png`;
  await downloadFile(item.image, imageFilePath);
  await makeCoverVideo(imageFilePath, filePath, `${filePath}.mp4`);

  mastodon.postImage({
    status,
    image: `${filePath}.mp4`,
    alt_text: `A photo of the ${item.label} bird with a recording of the bird singing.`,
  });

  return true;
};

export default botScript;
