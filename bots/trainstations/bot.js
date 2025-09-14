import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import wikidata from "./../../modules/wikidata.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  const items = await wikidata(
    /* sql */ `
    SELECT ?item ?itemLabel ?placeLabel ?itemDescription ?lon ?lat ?image ?article WHERE {
      ?item wdt:P31 wd:Q55488 .
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
  `,
    true
  );

  const item = randomFromArray(items);
  console.log(item);
  let imageUrl = "";

  if (item.image) {
    imageUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/url-${encodeURIComponent(
      item.image
    )}(${item.long},${item.lat})/${item.long},${
      item.lat
    },5/900x720?access_token=pk.eyJ1IjoiZm91cnRvbmZpc2giLCJhIjoiY2tvbjg3d283MDIycTJvcWgyeXh6bXExayJ9.oALSklpKZvB95noosnGNNA`;
  }

  const status = `${item.label ? `${item.label}, ` : ""} ${
    item.description ? `${item.description}. ` : ""
  }\n\n${item.wikipediaUrl}\n\n#trains #TrainStations #map`;

  const filePath = `${__dirname}/../../temp/trainstations.jpg`;
  await downloadFile(imageUrl, filePath);

  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.TRAIN_STATIONS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  mastodon.postImage({
    status: status.replace("  ", " "),
    image: filePath,
    alt_text:
      "A photo of or from a train station from the linked website, overlaid on a cropped world map where it's located.",
  });

  return true;
};

export default botScript;
