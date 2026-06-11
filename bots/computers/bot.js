import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { queryWikidata, getWikidataLabel, getWikidataCache, saveWikidataCache } from "./../../modules/wikidata.js";
import { getMainImage } from "./../../modules/wikipedia.js";
import { base64 as downloadFileAsBase64 } from "./../../modules/fetch.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */`
  SELECT ?item ?itemLabel ?itemDescription ?article
  WHERE
  {
    VALUES ?type { wd:Q28542014 wd:Q68 wd:Q60484681 }
    ?item wdt:P31 ?type .
    ?item schema:description ?itemDescription FILTER (LANG(?itemDescription) = "en") .
    ?item wdt:P18 [] .
    ?article schema:about ?item .
    ?article schema:inLanguage "en" .
    ?article schema:isPartOf <https://en.wikipedia.org/> .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
  }
  GROUP BY ?item ?itemLabel ?itemDescription ?article
  LIMIT 40000
`;

const botScript = async () => {
  let items = [];
  const cached = await getWikidataCache(botID);

  if (!cached || cached.isStale) {
    const freshItems = await queryWikidata(WIKIDATA_QUERY, false);
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

  // console.log(item);

  const imageUrl = await getMainImage(item.wikipediaUrl);

  if (!imageUrl) {
    console.log(`${botID}: no image found for ${item.label}`);
    return;
  }

  const status = `${item.label ? `${item.label}, ` : ""} ${
    item.description ? `${item.description}. ` : ""
  }\n\n${item.wikipediaUrl}\n\n#computers #tech #technology`;

  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.COMPUTERS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const imageData = await downloadFileAsBase64(imageUrl);

  await mastodon.postImage({
    status: status.replace("  ", " "),
    image: imageData,
    alt_text: "A photo of a computer from the linked website.",
  });

  return true;
};

export default botScript;
