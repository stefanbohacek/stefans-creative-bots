import wikidataBot from "./../../modules/wikidataBot.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */ `
  SELECT DISTINCT ?item ?itemLabel ?itemDescription ?article
  WHERE
  {
    ?item wdt:P2669 ?cui.
    ?item schema:description ?itemDescription FILTER (LANG(?itemDescription) = "en") .
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
  return wikidataBot(botID, {
    query: WIKIDATA_QUERY,
    // accessToken: process.env.MASTODON_TEST_TOKEN,
    accessToken: process.env.DISCONTINUED_BOT_MASTODON_ACCESS_TOKEN,
    altText: "An image related to the linked discontinued product or service.",
    status: (item) =>
      `Hey, remember ${item.label}?\n\n${item.wikipediaUrl}\n\n#discontinued #nostalgia`,
  });
};

export default botScript;
