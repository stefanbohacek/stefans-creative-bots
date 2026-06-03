import fetch from 'node-fetch';
import usZips from "us-zips";
import mastodonClient from "./../../modules/mastodon/index.js";
import isBetween from "./../../modules/isBetween.js";
import getZipCodeFromDataPoint from "./../../modules/getZipCodeFromDataPoint.js";
import { getData, makeDataMap } from "./../../modules/datasets.js";

const getLongLat = (datapoint) => {
  let dp = false;

  if (
    datapoint.longitude &&
    datapoint.latitude &&
    parseFloat(datapoint.longitude) !== 0 &&
    parseFloat(datapoint.latitude) !== 0
  ) {
    dp = {
      longitude: datapoint.longitude,
      latitude: datapoint.latitude,
    };
  } else if (
    datapoint.lon &&
    datapoint.lat &&
    parseFloat(datapoint.lon) !== 0 &&
    parseFloat(datapoint.lat) !== 0
  ) {
    dp = {
      longitude: datapoint.lon,
      latitude: datapoint.lat,
    };
  } else if (
    datapoint.location &&
    datapoint.location.longitude &&
    datapoint.location.latitude &&
    parseFloat(datapoint.location.longitude) !== 0 &&
    parseFloat(datapoint.location.latitude) !== 0
  ) {
    dp = {
      longitude: datapoint.location.longitude,
      latitude: datapoint.location.latitude,
    };
  }

  return dp;
};

const mastodon = new mastodonClient({
  // access_token: process.env.NYCDATABOT_MASTODON_ACCESS_TOKEN_SECRET,
  access_token: process.env.MASTODON_TEST_TOKEN,
  api_url: process.env.MASTODON_API_URL,
});

const dataOptions = {
  dataSource: "data.cityofnewyork.us",
  dataTypes: ["datasets", "map"],
  offsetRange: [0, 351],
};

const botScript = async () => {
  const result = await getData(dataOptions);

  if (!result) {
    return;
  }

  const { dataType, datasetName, datasetPermalink, resource } = result;

  // const datasetUrl = 'https://data.cityofnewyork.us/resource/tn4g-ski5.json';
  const datasetUrl = `https://data.cityofnewyork.us/resource/${resource.id}.json`;

  // console.log("loading data...", { datasetName, dataType, datasetPermalink });

  const response = await fetch(datasetUrl);
  const data = await response.json();

  const postMap = async () => {
    const imgData = await makeDataMap(data, getLongLat);
    if (imgData) {
      await mastodon.postImage({
        status: `${datasetName}\nSource: ${datasetPermalink}\n#nyc #data #dataviz`,
        image: imgData,
        alt_text: `A map with locations from the ${datasetName} dataset. Please visit the link for full details.`,
      });
    }
  };

  switch (dataType) {
    case "map":
      await postMap();
      break;
    case "datasets":
      // console.log({ "data sample": data.slice(0, 5) });

      if (data[0].latitude && data[0].longitude) {
        await postMap();
      } else if (getZipCodeFromDataPoint(data[0])) {
        console.log("found dataset with zip codes...");
        data.forEach((datapoint) => {
          const zipCode = getZipCodeFromDataPoint(datapoint);
          if (zipCode) {
            const location = usZips[zipCode];

            if (location && location.latitude && location.longitude) {
              datapoint.latitude = location.latitude;
              datapoint.longitude = location.longitude;
            }
          }
        });
        await postMap();
      } else {
        await botScript();
      }
      break;
  }
};

export default botScript;
