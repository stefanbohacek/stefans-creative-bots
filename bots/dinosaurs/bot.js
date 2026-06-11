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
    ?item wdt:P105 wd:Q34740 .
    ?item wdt:P171+ wd:Q430 .
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

  // TODO: Temporary fix until I can figure out the query.
  const dinosaurs = items.filter(
    (item) =>
      item.description?.toLowerCase().includes("dinosaur") ||
      item.description?.toLowerCase().includes("reptile"),
  );

  const item = randomFromArray(dinosaurs);

  if (!item) {
    console.log(`${botID}: no items found`);
    return;
  }

  if (item.label === item.wikidataId) {
    item.label = await getWikidataLabel(item);
  }

  // console.log("items", items);
  // console.log("dinosaurs", dinosaurs);
  // console.log("item", item);

  const imageUrl = await getMainImage(item.wikipediaUrl);

  if (!imageUrl) {
    console.log(`${botID}: no image found for ${item.label}`);
    return;
  }

  const status = `${item.label}.\n\n${item.wikipediaUrl}\n\n#dinosaur`;

  const imgData = await downloadFileAsBase64(imageUrl);

  const mastodon = new mastodonClient({
    access_token: process.env.DINOSAURS_BOT_MASTODON_ACCESS_TOKEN,
    // access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  await mastodon.postImage({
    status: status.replace("  ", " "),
    image: imgData,
    alt_text:
      "A photo or drawing of a dinosaur or dinosaur remains from the linked Wikipedia page.",
  });

  return true;
};

export default botScript;
