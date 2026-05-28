import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { queryWikidata, getWikidataLabel, getWikidataCache, saveWikidataCache } from "./../../modules/wikidata.js";
import downloadFileAsBase64 from "./../../modules/downloadFileAsBase64.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const WIKIDATA_QUERY = /* sql */`
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

  const item = randomFromArray(items);

  if (!item) {
    console.log(`${botID}: no items found`);
    return;
  }

  if (item.label === item.wikidataId) {
    item.label = await getWikidataLabel(item);
  }

  // console.log(item);
  let imageUrl = "";

  if (item.image) {
    imageUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/url-${encodeURIComponent(
      item.image,
    )}(${item.long},${item.lat})/${item.long},${
      item.lat
    },5/900x720?access_token=pk.eyJ1IjoiZm91cnRvbmZpc2giLCJhIjoiY2tvbjg3d283MDIycTJvcWgyeXh6bXExayJ9.oALSklpKZvB95noosnGNNA`;
  }

  const status = `${item.label ? `${item.label}, ` : ""} ${
    item.description ? `${item.description}. ` : ""
  }\n\n${item.wikipediaUrl}\n\n#libraries #books #map`;

  const imgData = await downloadFileAsBase64(imageUrl);

  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.LIBRARIES_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  await mastodon.postImage({
    status: status.replace("  ", " "),
    image: imgData,
    alt_text:
      "A photo of or from a library from the linked website, overlaid on a cropped world map where it's located.",
  });

  return true;
};

export default botScript;
