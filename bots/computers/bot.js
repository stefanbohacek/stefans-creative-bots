import wikidataBot from "./../../modules/wikidataBot.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */ `
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
  return wikidataBot(botID, {
    query: WIKIDATA_QUERY,
    // accessToken: process.env.MASTODON_TEST_TOKEN,
    accessToken: process.env.COMPUTERS_BOT_MASTODON_ACCESS_TOKEN,
    hashtags: "#computers #tech #technology",
    altText: "A photo of a computer from the linked website.",
  });
};

export default botScript;
