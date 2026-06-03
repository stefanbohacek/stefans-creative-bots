import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { queryWikidata, getWikidataLabel, getWikidataCache, saveWikidataCache } from "./../../modules/wikidata.js";
import downloadFile from "./../../modules/downloadFile.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */`
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

    FILTER NOT EXISTS { ?item wdt:P31 wd:Q3231690 }
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

  // console.log(items);
  const item = randomFromArray(items);
  // const item = items.filter((i) => i.label === "Q1063978")[0];

  if (!item) {
    console.log(`${botID}: no items found`);
    return;
  }

  if (item.label === item.wikidataId) {
    item.label = await getWikidataLabel(item);
  }

  // console.log(item);

  const status = `Hey, remember ${item.label}?\n\n${item.wikipediaUrl}\n\n#discontinued #nostalgia`;
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.DISCONTINUED_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  await mastodon.post({
    status: status.replace("  ", " "),
  });

  return true;
};

export default botScript;
