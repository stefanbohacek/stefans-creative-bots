import wikidataBot from "./../../modules/wikidataBot.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */ `
  SELECT DISTINCT ?item ?itemLabel ?itemDescription ?article ?date
  WHERE
  {
    ?item wdt:P2669 ?date.
    FILTER(YEAR(?date) >= 1980)
    FILTER(?date <= NOW())
    ?item schema:description ?itemDescription FILTER (LANG(?itemDescription) = "en") .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    {
      ?article schema:about ?item .
      ?article schema:inLanguage "en" .
      ?article schema:isPartOf <https://en.wikipedia.org/>
    }
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q3231690 } # car model
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q18643213 }  # military equipment
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q357104 }  # military exercises
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q137188246 }  # military vehicle model
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q15142894 }  # weapon model
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q1071902 }  # shock site
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q89290172 }  # "notorious market" website
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q622499 }  # refugee camp
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q10791 }  # nudity
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q849203 }  # electronic countermeasure
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q3545649 }  # decoy
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q80359036 }  # alcohol brand
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q281 }  # whisky
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q16917 }  # hospital
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q108325 }  # chapel
    FILTER NOT EXISTS { ?item wdt:P31 wd:Q106651430 }  # communist newspaper
    FILTER NOT EXISTS { ?item wdt:P279* wd:Q728 }  # weapon
    FILTER(?item NOT IN (wd:Q19867869, wd:Q3144635, wd:Q4048614))  # neo-Nazi site, prison, military exhibition
  }
  LIMIT 40000
`;

const botScript = async () => {
  return wikidataBot(botID, {
    query: WIKIDATA_QUERY,
    // accessToken: process.env.MASTODON_TEST_TOKEN,
    accessToken: process.env.DISCONTINUED_BOT_MASTODON_ACCESS_TOKEN,
    altText: "An image related to the linked discontinued product or service.",
    filterItems: (items) =>
      items.filter((item) => item.date && new Date(item.date) <= new Date()),
    status: (item) =>
      `Hey, remember ${item.label}?\n\n${item.wikipediaUrl}\n\n#discontinued #nostalgia`,
  });
};

export default botScript;
