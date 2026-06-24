import wikidataBot from "./../../modules/wikidataBot.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */ `
  SELECT ?item ?itemLabel ?placeLabel ?itemDescription ?lon ?lat ?image ?article WHERE {
    ?item wdt:P31 wd:Q28564 .
    ?item wdt:P131 ?place .
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

const botScript = async () => {
  return wikidataBot(botID, {
    query: WIKIDATA_QUERY,
    // accessToken: process.env.MASTODON_TEST_TOKEN,
    accessToken: process.env.LIBRARIES_BOT_MASTODON_ACCESS_TOKEN,
    hashtags: "#libraries #books #map",
    altText:
      "A photo of or from a library from the linked website, overlaid on a cropped world map where it's located.",
  });
};

export default botScript;
