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

const getParks = async () => {
  const query = `
  SELECT ?item ?itemLabel ?placeLabel ?itemDescription ?lon ?lat ?image
  {
    ?item wdt:P31 wd:Q22698 .
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
  }
  `;

  const apiUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
    query
  )}&format=json`;
  const resp = await fetch(apiUrl);
  const respJSON = await resp.json();
  const parks = respJSON?.results?.bindings || [];
  // consoleLog(parks)
  return parks;
};

const pickPark = async (parks) => {
  const park = randomFromArray(parks);

  const p = {
    item: {
      type: "uri",
      value: "http://www.wikidata.org/entity/Q1185583",
    },
    image: {
      type: "uri",
      value:
        "http://commons.wikimedia.org/wiki/Special:FilePath/Demianiplatz%202006.jpg",
    },
    lon: {
      datatype: "http://www.w3.org/2001/XMLSchema#double",
      type: "literal",
      value: "14.984879",
    },
    lat: {
      datatype: "http://www.w3.org/2001/XMLSchema#double",
      type: "literal",
      value: "51.154159",
    },
    itemLabel: {
      "xml:lang": "en",
      type: "literal",
      value: "Demianiplatz",
    },
    placeLabel: {
      "xml:lang": "en",
      type: "literal",
      value: "Görlitz",
    },
  };

  const label = park.itemLabel.value || "";
  const description = park.itemDescription.value || "";

  // const image = encodeURIComponent(park.image.value);
  const image = park.image.value.split(
    "http://commons.wikimedia.org/wiki/Special:FilePath/"
  )[1];
  let imageUrl = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${image}&width=410`;
  const lat = park.lat.value || "";
  const long = park.lon.value || "";

  consoleLog({ label, description, image, imageUrl });

  imageUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/url-${encodeURIComponent(
    imageUrl
  )}(${long},${lat})/${long},${lat},5/900x720?access_token=pk.eyJ1IjoiZm91cnRvbmZpc2giLCJhIjoiY2tvbjg3d283MDIycTJvcWgyeXh6bXExayJ9.oALSklpKZvB95noosnGNNA`;

  consoleLog({ imageUrl });

  // console.log("data?.sitelinks", data?.sitelinks);
  // console.log("park.tags.wikidata", park.tags.wikidata);
  const wikidata = park.item.value.split("/entity/")[1];
  const wikipediaUrl = `\nhttps://www.wikidata.org/wiki/${wikidata}`;

  const status = `${label ? `${label}, ` : ""} ${
    description ? `${description}. ` : ""
  } ${wikipediaUrl}\n\n#parks #outdoors #map`;
  return { status, imageUrl };
};

const botScript = async () => {
  const parks = await getParks();
  const park = await pickPark(parks);

  if (park && park.status && park.imageUrl) {
    const filePath = `${__dirname}/../../temp/park.jpg`;
    await downloadFile(park.imageUrl, filePath);

    const mastodon = new mastodonClient({
      access_token: process.env.PARKS_BOT_MASTODON_ACCESS_TOKEN,
      api_url: process.env.BOTSINSPACE_API_URL,
    });

    mastodon.postImage({
      status: park.status.replace("  ", " "),
      image: filePath,
      alt_text: "A photo of a park from the linked website, overlaid on a map.",
    });
  } else {
    botScript();
  }

  return true;
};

export default botScript;
