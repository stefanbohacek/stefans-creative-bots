import fetch from 'node-fetch';
import usZips from "us-zips";
import mastodonClient from "./../../modules/mastodon/index.js";
import downloadFile from "./../../modules/download-file.js";
import randomFromArray from "./../../modules/random-from-array.js";
import getRandomInt from "./../../modules/get-random-int.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const locationInRange = (location, centerPoint, km) => {
  km = km || 50;

  var ky = 40000 / 360;
  var kx = Math.cos((Math.PI * centerPoint.latitude) / 180.0) * ky;
  var dx = Math.abs(centerPoint.longitude - location.longitude) * kx;
  var dy = Math.abs(centerPoint.latitude - location.latitude) * ky;
  return Math.sqrt(dx * dx + dy * dy) <= km;
};

const cleanupLocationData = (locationData) => {
  let locationDataClean = [],
    latitudes = [],
    longitudes = [];

  locationData.forEach((location) => {
    latitudes.push(parseFloat(location.latitude));
    longitudes.push(parseFloat(location.longitude));
  });

  const centerPoint = {
    latitude: median(latitudes),
    longitude: median(longitudes),
  };

  // console.log({latitudes, longitudes, centerPoint});

  locationData.forEach((location) => {
    if (locationInRange(location, centerPoint, 50)) {
      locationDataClean.push(location);
    }
  });

  return locationDataClean;
};

const median = (values) => {
  if (values.length === 0) return 0;

  values.sort((a, b) => {
    return a - b;
  });

  const half = Math.floor(values.length / 2);

  if (values.length % 2) {
    return values[half];
  }

  return (values[half - 1] + values[half]) / 2.0;
};

const isBetween = (x, min, max) => {
  return x >= min && x <= max;
};

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

const makeMap = async (datasetName, datasetPermalink, data, cb) => {
  /*
    https://docs.mapbox.com/help/glossary/static-images-api/
    https://docs.mapbox.com/playground/static/
    https://docs.mapbox.com/api/maps/static-images/#example-request-retrieve-a-static-map-with-a-marker-overlay

    https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+555555(-73.915888033,40.84586773),pin-s+555555(-74.077149232,40.627060894)/auto/1200x500?access_token=pk.eyJ1IjoiZm91cnRvbmZpc2giLCJhIjoiY2tlMjN2ZjljMDVsOTJ6cDgxNGgweTJ5ZiJ9.mJ0-aoLZIVU2bqjH3j9kKQ

  */

  console.log("making a map...");
  let locationData = [],
    markers = [];

  data = randomFromArray(data, 100);

  data.forEach((datapoint) => {
    const location = getLongLat(datapoint);

    if (location) {
      locationData.push({
        longitude: location.longitude,
        latitude: location.latitude,
      });
    }
  });

  locationData = cleanupLocationData(locationData);

  locationData.forEach((location) => {
    markers.push(`pin-s+555555(${location.longitude},${location.latitude})`);
  });

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/${markers.join(
    ","
  )}/auto/900x600?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;

  const filePath = `${__dirname}/../../temp/nycdata.jpg`;
  await downloadFile(mapUrl, filePath);

  const mastodon = new mastodonClient({
    access_token: process.env.NYCDATABOT_MASTODON_ACCESS_TOKEN_SECRET,
    api_url: process.env.MASTODON_API_URL,
  });

  const status = `${datasetName}\nSource: ${datasetPermalink}\n#nyc #data #dataviz`;

  mastodon.postImage({
    status,
    image: filePath,
    alt_text: `A map with locations from the ${datasetName} dataset. Please visit the link for full details.`,
  });
};

const getZipCode = (datapoint) => {
  return (
    datapoint.postcode ||
    datapoint.zipcode ||
    datapoint.zip_code ||
    datapoint.zip_code_2 ||
    false
  );
};

const findDataset = async () => {
  // https://socratadiscovery.docs.apiary.io/#reference/0/find-by-domain/search-by-domain
  let datasets = [];

  const dataSource = "data.cityofnewyork.us";
  const dataType = randomFromArray(["datasets", "map"]);

  const dataLimit = "1000";
  const discoveryUrl = `http://api.us.socrata.com/api/catalog/v1?domains=${dataSource}&search_context=${dataSource}&only=${dataType}&limit=${dataLimit}&offset=${getRandomInt(0,351)}`;

  console.log(`finding a dataset in the ${dataSource} domain (${dataType})`);

  let response = await fetch(discoveryUrl);
  let bodyParsed = await response.json();

  datasets = bodyParsed.results.filter((dataset) => {
    return (
      dataset.resource.columns_name && dataset.resource.columns_name.length
    );
  });

  // console.log('filtering data...', datasets.map((dataset) => {
  //   return {
  //     name: dataset.resource.name,
  //     size: dataset.resource.columns_name.length,
  //     url: `https://data.cityofnewyork.us/resource/${ dataset.resource.id }.json`,
  //   }
  // }));

  const dataset = randomFromArray(datasets);

  const datasetUrl = `https://data.cityofnewyork.us/resource/${dataset.resource.id}.json`,
    // const datasetUrl = 'https://data.cityofnewyork.us/resource/tn4g-ski5.json',
    datasetName = dataset.resource.name,
    datasetLabels = dataset.resource.columns_name,
    datasetPermalink = dataset.permalink;

  // console.log("loading data...", {
  //   datasetName,
  //   dataType,
  //   datasetUrl,
  //   datasetPermalink,
  // });

  response = await fetch(datasetUrl);
  bodyParsed = await response.json();

  switch (dataType) {
    case "map":
      makeMap(datasetName, datasetPermalink, bodyParsed);
      break;
    case "datasets":
      // console.log({
      //   datasetLabels,
      //   "data sample": bodyParsed.slice(0, 5),
      // });

      if (bodyParsed[0].latitude && bodyParsed[0].longitude) {
        makeMap(datasetName, datasetPermalink, bodyParsed);
      } else if (getZipCode(bodyParsed[0])) {
        console.log("found dataset with zip codes...");
        bodyParsed.forEach((datapoint) => {
          const zipCode = getZipCode(datapoint);
          if (zipCode) {
            const location = usZips[zipCode];

            if (location && location.latitude && location.longitude) {
              datapoint.latitude = location.latitude;
              datapoint.longitude = location.longitude;
            }
          }
        });
        makeMap(datasetName, datasetPermalink, bodyParsed);
      } else {
        findDataset();
      }
      break;
  }
};

const botScript = async () => {
  findDataset();
};

export default botScript;
