import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { queryWikidata, getWikidataLabel, getWikidataCache, saveWikidataCache } from "./../../modules/wikidata.js";
import capitalizeFirstLetter from "./../../modules/capitalizeFirstLetter.js";
import downloadFileAsBase64 from "./../../modules/downloadFileAsBase64.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */`
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
  LIMIT 40000
`;

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

  const mastodon = new mastodonClient({
    access_token: process.env.CURRENCIES_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const item = randomFromArray(items);

  if (!item) {
    console.log(`${botID}: no items found`);
    return;
  }

  if (item.label === item.wikidataId) {
    item.label = await getWikidataLabel(item);
  }

  // console.log(item);

  const status = `${item.label ? `${item.label}, ` : ""} ${
    item.description ? `${item.description}. ` : ""
  }\n\n${item.wikipediaUrl}\n\n#money #currency`.replace("  ", " ");

  if (item.image) {
    const imgData = await downloadFileAsBase64(item.image);

    await mastodon.postImage({
      status: capitalizeFirstLetter(status),
      image: imgData,
      alt_text: "A photo of a currency from the linked website.",
    });
  } else {
    await mastodon.post({
      status: status,
    });
  }

  return true;
};

export default botScript;
