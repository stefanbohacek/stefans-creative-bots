import wikidataBot from "./../../modules/wikidataBot.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */ `
  SELECT ?item ?itemLabel ?itemDescription ?article WHERE {
    ?item wdt:P31 wd:Q8142 .
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
  return wikidataBot(botID, {
    query: WIKIDATA_QUERY,
    // accessToken: process.env.MASTODON_TEST_TOKEN,
    accessToken: process.env.CURRENCIES_BOT_MASTODON_ACCESS_TOKEN,
    hashtags: "#money #currency",
    altText: "A photo of a currency from the linked website.",
  });
};

export default botScript;
