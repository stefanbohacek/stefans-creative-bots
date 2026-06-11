import { base64 as downloadFileAsBase64 } from "./fetch.js";
import randomFromArray from "./randomFromArray.js";
import getRandomInt from "./getRandomInt.js";
import sleep from "./sleep.js";

const locationInRange = (location, centerPoint, km) => {
  km = km || 50;

  var ky = 40000 / 360;
  var kx = Math.cos((Math.PI * centerPoint.latitude) / 180.0) * ky;
  var dx = Math.abs(centerPoint.longitude - location.longitude) * kx;
  var dy = Math.abs(centerPoint.latitude - location.latitude) * ky;
  return Math.sqrt(dx * dx + dy * dy) <= km;
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

export const getData = async (options, retries = 5) => {
  const { dataSource, dataTypes, offsetRange } = options;

  const dataType = Array.isArray(dataTypes)
    ? randomFromArray(dataTypes)
    : dataTypes;
  const offset = getRandomInt(offsetRange[0], offsetRange[1]);
  const discoveryUrl = `http://api.us.socrata.com/api/catalog/v1?domains=${dataSource}&search_context=${dataSource}&only=${dataType}&limit=1000&offset=${offset}`;

  console.log(
    `finding a dataset in the ${dataSource} domain (${dataType})`,
    discoveryUrl,
  );

  const response = await fetch(discoveryUrl);
  const body = await response.json();

  if (!body.results) {
    console.log(`${dataSource}: no results in response, retrying...`);
    if (retries > 0) {
      await sleep((5 - retries + 1) * 5000);
      return getData(options, retries - 1);
    }
    return null;
  }

  const dataset = randomFromArray(body.results);

  if (!dataset) {
    console.log(`${dataSource}: no valid datasets found, retrying...`);
    if (retries > 0) {
      await sleep((5 - retries + 1) * 5000);
      return getData(options, retries - 1);
    }
    return null;
  }

  return {
    dataType,
    datasetName: dataset.resource.name,
    datasetPermalink: dataset.permalink,
    resource: dataset.resource,
  };
};

export const makeDataMap = async (data, getLongLat) => {
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

  if (
    !locationData.length ||
    !locationData[0].latitude ||
    !locationData[0].longitude
  ) {
    return null;
  }

  locationData.forEach((location) => {
    markers.push(`pin-s+555555(${location.longitude},${location.latitude})`);
  });

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/${markers.join(
    ",",
  )}/auto/900x600?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;

  return await downloadFileAsBase64(mapUrl);
};
