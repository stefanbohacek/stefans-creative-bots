import mastodonClient from "./../../modules/mastodon/index.js";
import makeCoverVideo from "./../../modules/makeCoverVideo.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { queryWikidata, getWikidataLabel, getWikidataCache, saveWikidataCache } from "./../../modules/wikidata.js";
import { file as downloadFile } from "./../../modules/fetch.js";
import { dirname, extname } from "path";
import { fileURLToPath } from "url";
import getBotInfo from "./../../modules/getBotInfo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */`
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
  LIMIT 40000
`;

const getAudioExtension = (url) => {
  const extension = extname(new URL(url).pathname);
  return extension || ".ogg";
};

const botScript = async () => {
  let items = [];
  const cached = await getWikidataCache(botID);

  if (!cached || cached.isStale) {
    const freshItems = await queryWikidata(WIKIDATA_QUERY, true);
    if (freshItems.length) {
      await saveWikidataCache(botID, freshItems);
      items = freshItems;
    } else if (cached) {
      console.log(`${botID}: live fetch failed, using stale cache`);
      items = cached.data;
    }
  } else {
    items = cached.data;
  }

  const item = randomFromArray(items);

  if (!item) {
    console.log(`${botID}: no items found`);
    return;
  }

  if (item.label === item.wikidataId) {
    item.label = await getWikidataLabel(item);
  }

  console.log(item);
  const status = `${item.label}\n\n${item.wikipediaUrl}\n\n#birds #birdwatching`;

  const audioExtension = getAudioExtension(item.audio);
  const filePath = `${__dirname}/../../temp/bird${audioExtension}`;
  await downloadFile(item.audio, filePath);

  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.BIRDS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });
  const imageFilePath = `${__dirname}/../../temp/bird.png`;
  await downloadFile(item.image, imageFilePath);
  await makeCoverVideo(imageFilePath, filePath, `${filePath}.mp4`, 10);
  await mastodon.postImage({
    status,
    image: `${filePath}.mp4`,
    alt_text: `A photo of the ${item.label} bird with a recording of the bird singing.`,
  });
  return true;
};

export default botScript;
