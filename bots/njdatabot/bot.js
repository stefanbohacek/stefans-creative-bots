import convert from "xml-js";
import mastodonClient from "./../../modules/mastodon/index.js";
import isBetween from "./../../modules/isBetween.js";
import consoleLog from "./../../modules/consolelog.js";
import { getData, makeDataMap } from "./../../modules/datasets.js";
import sleep from "./../../modules/sleep.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const getLongLat = (datapoint) => {
  // console.log("getLongLat BEGIN");
  let location = { latitude: false, longitude: false };

  if (datapoint?._attributes?.latitude && datapoint?._attributes?.latitude) {
    location.latitude = datapoint._attributes.latitude;
    location.longitude = datapoint._attributes.longitude;
  } else {
    const locationData =
      datapoint.dispensary_location ||
      datapoint.geocoded_column ||
      datapoint.georeference ||
      datapoint.geolocation ||
      datapoint.geocode ||
      datapoint.geotag;

    // console.log("location not available directly", datapoint);

    if (locationData) {
      if (locationData._attributes) {
        location.latitude = locationData._attributes.latitude;
        location.longitude = locationData._attributes.longitude;
      } else if (locationData._text) {
        const locationArray = locationData._text.split(" ");
        // console.log("parsing...", {
        //   locationArray,
        //   "locationArray[1]": locationArray[1].replace("(", ""),
        //   "locationArray[2]": locationArray[2].replace(")", ""),
        // });
        location.latitude = parseFloat(locationArray[2].replace(")", ""));
        location.longitude = parseFloat(locationArray[1].replace("(", ""));
        // console.log("location parsed", { location });
      } else {
        // console.log("location data not found");
      }
    } else {
      // console.log("location data not found");
    }
  }
  // console.log("getLongLat END", { location });
  return location;
};

const mastodon = new mastodonClient({
  access_token: process.env.NJ_DATA_BOT_MASTODON_ACCESS_TOKEN_SECRET,
  // access_token: process.env.MASTODON_TEST_TOKEN,
  api_url: process.env.MASTODON_API_URL,
});

const dataOptions = {
  dataSource: "data.nj.gov",
  // dataTypes: ["datasets", "map"],
  dataTypes: "map",
  offsetRange: [0, 10],
};

const { botID } = getBotInfo(import.meta.url);

const botScript = async (retries = 0) => {
  if (retries >= 10) {
    console.log(`${botID}: max retries reached`);
    return;
  }
  const result = await getData(dataOptions);

  if (!result) {
    return;
  }

  const { datasetName, datasetPermalink, resource } = result;

  // const datasetUrl = `https://data.nj.gov/api/views/${resource.id}.json`;
  // const datasetUrl = `https://data.nj.gov/api/views/${resource.parent_fxf[0]}.json`;
  const datasetUrl = `https://data.nj.gov/api/views/${resource.parent_fxf[0]}/rows.xml?accessType=DOWNLOAD`;

  // console.log("loading data...", { datasetName, datasetPermalink });

  const response = await fetch(datasetUrl);
  // const data = await response.json();
  const text = await response.text();
  // consoleLog({text});
  let bodyJSON;
  try {
    bodyJSON = JSON.parse(convert.xml2json(text, { compact: true, spaces: 4 }));
  } catch (err) {
    throw new Error(`njdatabot: failed to parse response from ${datasetUrl} (HTTP ${response.status}): ${text.slice(0, 300)}`);
  }
  // consoleLog({bodyJSON});
  const data = bodyJSON.response.row.row;

  const imgData = await makeDataMap(data, getLongLat);
  if (imgData) {
    await mastodon.postImage({
      status: `${datasetName}\nSource: ${datasetPermalink}\n#nj #data #dataviz`,
      image: imgData,
      alt_text: `A map with locations from the ${datasetName} dataset. Please visit the link for full details.`,
    });
  } else {
    await sleep(3000);
    await botScript(retries + 1);
  }
};

export default botScript;
