import fetch from "node-fetch";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import downloadFile from "./../../modules/download-file.js";
import consoleLog from "./../../modules/consolelog.js";
import sleep from "./../../modules/sleep.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getLibraries = async () => {
  const query = `
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
        FILTER (SUBSTR(str(?article), 1, 25) = "https://en.wikipedia.org/")
      }
  } 
  `;

  const apiUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
    query
  )}&format=json`;
  const resp = await fetch(apiUrl);
  const respJSON = await resp.json();
  const libraries = respJSON?.results?.bindings || [];
  // consoleLog(libraries)
  return libraries;
};

const pickLibrary = async (libraries) => {
  const library = randomFromArray(libraries);
  const label = library.itemLabel.value || "";
  const description = library.itemDescription.value || "";

  // const image = encodeURIComponent(library.image.value);
  const image = library.image.value.split(
    "http://commons.wikimedia.org/wiki/Special:FilePath/"
  )[1];
  let imageUrl = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${image}&width=410`;
  const lat = library.lat.value || "";
  const long = library.lon.value || "";

  imageUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/url-${encodeURIComponent(
    imageUrl
  )}(${long},${lat})/${long},${lat},5/900x720?access_token=pk.eyJ1IjoiZm91cnRvbmZpc2giLCJhIjoiY2tvbjg3d283MDIycTJvcWgyeXh6bXExayJ9.oALSklpKZvB95noosnGNNA`;

  const wikidata = library.item.value.split("/entity/")[1];

  let wikipediaUrl = `https://www.wikidata.org/wiki/${wikidata}`;

  if (library.article && library.article.value){
    wikipediaUrl = library.article.value;
  }

  const status = `${label ? `${label}, ` : ""} ${
    description ? `${description}. ` : ""
  }\n\n${wikipediaUrl}\n\n#libraries #books #map`;
  return { status, imageUrl };
};

const botScript = async () => {
  const libraries = await getLibraries();
  const library = await pickLibrary(libraries);

  if (library && library.status && library.imageUrl) {
    const filePath = `${__dirname}/../../temp/library.jpg`;
    await downloadFile(library.imageUrl, filePath);

    const mastodon = new mastodonClient({
      access_token: process.env.LIBRARIES_BOT_MASTODON_ACCESS_TOKEN,
      api_url: process.env.BOTSINSPACE_API_URL,
    });

    mastodon.postImage({
      status: library.status.replace("  ", " "),
      image: filePath,
      alt_text: "A photo of or from a library from the linked website, overlaid on a cropped world map where it's located.",
    });
  } else {
    botScript();
  }

  return true;
};

export default botScript;
