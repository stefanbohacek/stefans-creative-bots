import wikidataBot from "./../../modules/wikidataBot.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */ `
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
  return wikidataBot(botID, {
    query: WIKIDATA_QUERY,
    // accessToken: process.env.MASTODON_TEST_TOKEN,
    accessToken: process.env.DINOSAURS_BOT_MASTODON_ACCESS_TOKEN,
    altText:
      "A photo or drawing of a dinosaur or dinosaur remains from the linked Wikipedia page.",
    status: (item) => `${item.label}.\n\n${item.wikipediaUrl}\n\n#dinosaur`,
    // TODO: Temporary fix until I can figure out the query.
    filterItems: (items) =>
      items.filter(
        (item) =>
          item.description?.toLowerCase().includes("dinosaur") ||
          item.description?.toLowerCase().includes("reptile"),
      ),
  });
};

export default botScript;
