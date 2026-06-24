import wikidataBot from "./../../modules/wikidataBot.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */ `
  SELECT ?item ?itemLabel ?placeLabel ?itemDescription ?lon ?lat ?image ?article WHERE {
    ?item wdt:P31 wd:Q179700 .
    ?item wdt:P131 ?place .
    FILTER NOT EXISTS { ?item wdt:P576 ?abolishedDate . }
    ?item schema:description ?itemDescription FILTER (LANG(?itemDescription) = "en") .
    ?item wdt:P18 ?image;
          p:P625 [
            ps:P625 ?coord;
            psv:P625 [
              wikibase:geoLongitude ?lon;
              wikibase:geoLatitude ?lat;
            ] ;
          ]
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    {
      ?article schema:about ?item .
      ?article schema:inLanguage "en" .
      ?article schema:isPartOf <https://en.wikipedia.org/>
    }
  }
  LIMIT 40000
`;

const ignoreList = [
  "Columbus Circle",
  "Christopher Columbus",
  "Daytoy ni Bannawag",
  "Edward Colston",
  "George Davis",
  "George Washington",
  "James Cook",
  "Joseph Bryan",
  "Leopold II",
  "Margaret Thatcher",
  "Reiterdenkmal",
  "Raphael Semmes",
  "Roger B. Taney",
  "Williams Carter Wickham",
  "confederate general",
];

const botScript = async () => {
  return wikidataBot(botID, {
    query: WIKIDATA_QUERY,
    // accessToken: process.env.MASTODON_TEST_TOKEN,
    accessToken: process.env.STATUES_BOT_MASTODON_ACCESS_TOKEN,
    hashtags: "#statue #history #map",
    altText:
      "A photo of a statue from the linked Wikipedia article, overlaid on a cropped world map where it's located.",
    filterItems: (items) =>
      items.filter(
        (item) =>
          !ignoreList.some(
            (ignored) =>
              item.label?.toLowerCase().includes(ignored.toLowerCase()) ||
              item.description?.toLowerCase().includes(ignored.toLowerCase()),
          ),
      ),
  });
};

export default botScript;
