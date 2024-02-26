// import fetch from "node-fetch";
// import mastodonClient from "./../../modules/mastodon/index.js";
// import progressbar from "./../../modules/generators/progressbar.js";
// import dayOfYear from "./../../modules/day-of-year.js";
// import isLeapYear from "./../../modules/is-leap-year.js";

// const botScript = async () => {
//   await (async () => {
//     try {
//       const mastodon = new mastodonClient({
//         access_token: process.env.YEAR_BOT_MASTODON_TOKEN,
//         api_url: process.env.BOTSINSPACE_API_URL,
//       });

//       const days = isLeapYear() ? 366 : 365;
//       const progress = 100 * (dayOfYear()-1/days);
//       const status = `Testing.`;
//       console.log(status, progress);

//       progressbar(
//         {
//           progress,
//           // color: "red",
//           // background: "blue"
//         },
//         (err, image) => {
//           mastodon.postImage({
//             status,
//             image,
//             alt_text: `Progress bar that's ${progress}% full.`,
//           });
//         }
//       );
//     } catch (error) {
//       console.log("@year error:", error);
//     }
//   })();
// };

// export default botScript;



import fetch from "node-fetch";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import downloadFile from "./../../modules/download-file.js";
import consoleLog from "./../../modules/consolelog.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getLighthouses = async () => {
  let lighthouses = [];
  const apiUrl =
    "https://www.overpass-api.de/api/interpreter?data=%0A%09%09%09%5Bout%3Ajson%5D%5Btimeout%3A300%5D%3B%0A%09%09%09(%0A%09%09%09%20%20node%5B%22seamark%3Alight%3Asequence%22%5D(-90%2C-180%2C90%2C180)%3B%0A%09%09%09%20%20node%5B%22seamark%3Alight%3A1%3Asequence%22%5D(-90%2C-180%2C90%2C180)%3B%0A%09%09%09%20%20way%5B%22seamark%3Alight%3Asequence%22%5D(-90%2C-180%2C90%2C180)%3B%0A%09%09%09%20%20way%5B%22seamark%3Alight%3A1%3Asequence%22%5D(-90%2C-180%2C90%2C180)%3B%0A%09%09%09)%3B%0A%09%09%09out%20body%3B%0A%09%09%09%3E%3B%0A%09%09%09out%20skel%20qt%3B%0A%09%09";

  const response = await fetch(apiUrl);
  const data = await response.json();
  if (data && data.elements && data.elements.length > 0) {
    lighthouses = data.elements.filter(
      (lighthouse) => lighthouse.tags && lighthouse.tags.wikidata
    );
  }
  // consoleLog(lighthouses)
  return lighthouses;
};

const pickLighthouse = async (lighthouses) => {
  const lighthouse = randomFromArray(lighthouses);
  const apiUrl = `https://www.wikidata.org/w/rest.php/wikibase/v0/entities/items/${lighthouse.tags.wikidata}`;
  const response = await fetch(apiUrl);
  const data = await response.json();

  let wikipediaUrl = "";

  if (
    data?.statements?.P18 &&
    data.statements?.P18.length > 0 &&
    data?.statements?.P625 &&
    data.statements?.P625.length > 0
  ) {
    const label = data.labels.en || "";
    const description = data.descriptions.en || "";
    const image = encodeURIComponent(data.statements.P18[0].value.content);
    const lat = data.statements.P625[0].value.content.latitude;
    const long = data.statements.P625[0].value.content.longitude;
    let imageUrl = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${image}&width=300`;

    // consoleLog({ label, description, image, imageUrl });

    imageUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/url-${encodeURIComponent(
      imageUrl
    )}(${long},${lat})/${long},${lat},5/900x720?access_token=pk.eyJ1IjoiZm91cnRvbmZpc2giLCJhIjoiY2tvbjg3d283MDIycTJvcWgyeXh6bXExayJ9.oALSklpKZvB95noosnGNNA`;

    // console.log("data?.sitelinks", data?.sitelinks);
    console.log("lighthouse.tags.wikidata", lighthouse.tags.wikidata);

    if (data?.sitelinks?.enwiki?.url) {
      wikipediaUrl = `\n${data.sitelinks.enwiki.url}`;
    } else {
      wikipediaUrl = `\nhttps://www.wikidata.org/wiki/${lighthouse.tags.wikidata}`;
    }

    const status = `${label ? `${label}, `: ''} ${description ? `${description}. `: ''} ${wikipediaUrl}\n\n#lighthouse #map`;
    return { status, imageUrl };
  } else {
    return await pickLighthouse(lighthouses);
  }
};

const botScript = async () => {
  const lighthouses = await getLighthouses();
  const lighthouse = await pickLighthouse(lighthouses);

  if (lighthouse && lighthouse.status && lighthouse.imageUrl) {
    const filePath = `${__dirname}/../../temp/lighthouse.jpg`;
    await downloadFile(lighthouse.imageUrl, filePath);

    const mastodon = new mastodonClient({
      access_token: process.env.MASTODON_TEST_TOKEN,
      api_url: process.env.BOTSINSPACE_API_URL,
    });

    mastodon.postImage({
      status: lighthouse.status,
      image: filePath,
      alt_text: "A photo of a lighthouse overlaid on a map.",
    });
  } else {
    botScript();
  }

  return true;
};

export default botScript;
