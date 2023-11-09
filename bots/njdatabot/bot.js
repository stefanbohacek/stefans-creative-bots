import fetch from "node-fetch";
import usZips from "us-zips";
import convert from "xml-js";
import mastodonClient from "./../../modules/mastodon/index.js";
import downloadFile from "./../../modules/download-file.js";
import randomFromArray from "./../../modules/random-from-array.js";
import getRandomInt from "./../../modules/get-random-int.js";
import consoleLog from "./../../modules/consolelog.js";

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
        console.log("location data not found");
      }
    } else {
      console.log("location data not found");
    }
  }
  // console.log("getLongLat END", { location });
  return location;
};

const makeMap = async (datasetName, datasetPermalink, data, cb) => {
  /*
    https://docs.mapbox.com/help/glossary/static-images-api/
    https://docs.mapbox.com/playground/static/
    https://docs.mapbox.com/api/maps/static-images/#example-request-retrieve-a-static-map-with-a-marker-overlay

    https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+555555(-73.915888033,40.84586773),pin-s+555555(-74.077149232,40.627060894)/auto/1200x500?access_token=pk.eyJ1IjoiZm91cnRvbmZpc2giLCJhIjoiY2tlMjN2ZjljMDVsOTJ6cDgxNGgweTJ5ZiJ9.mJ0-aoLZIVU2bqjH3j9kKQ

  */

  console.log("making a map...");
  let locationData = [];
  let markers = [];

  data = randomFromArray(data, 100);

  // console.log("data[0]", data[0]);

  data.forEach((datapoint) => {
    const location = getLongLat(datapoint);

    if (location) {
      locationData.push({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  });

  if (locationData[0].latitude && locationData[0].longitude) {
    locationData = cleanupLocationData(locationData);

    locationData.forEach((location) => {
      markers.push(`pin-s+555555(${location.longitude},${location.latitude})`);
    });

    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/${markers.join(
      ","
    )}/auto/900x600?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;

    console.log({mapUrl});

    const filePath = `${__dirname}/../../temp/njdata.jpg`;
    await downloadFile(mapUrl, filePath);

    const mastodon = new mastodonClient({
      access_token: process.env.NJ_DATA_BOT_MASTODON_ACCESS_TOKEN_SECRET,
      api_url: process.env.NJDATABOT_MASTODON_API,
    });

    const status = `${datasetName}\nSource: ${datasetPermalink}\n#nj #data #dataviz`;

    mastodon.postImage({
      status,
      image: filePath,
      alt_text: `A map with locations from the ${datasetName} dataset. Please visit the link for full details.`,
    });
  } else {
    console.log("finding a new dataset...");
    findDataset();
  }
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

  const dataSource = "data.nj.gov";
  // const dataType = randomFromArray(["datasets", "map"]);
  const dataType = "map";

  const dataLimit = "1000";
  const discoveryUrl = `http://api.us.socrata.com/api/catalog/v1?domains=${dataSource}&search_context=${dataSource}&only=${dataType}&limit=${dataLimit}&offset=${getRandomInt(
    0,
    10
  )}`;

  console.log(`finding a dataset in the ${dataSource} domain (${dataType})`);

  let response = await fetch(discoveryUrl);
  let bodyParsed = await response.json();
  // consoleLog(bodyParsed);

  // datasets = bodyParsed.results.filter((dataset) => {
  //   // return true;
  //   return (
  //     dataset.resource.columns_name && dataset.resource.columns_name.length
  //   );
  // });
  datasets = bodyParsed.results;

  // console.log('filtering data...', datasets.map((dataset) => {
  //   return {
  //     name: dataset.resource.name,
  //     size: dataset.resource.columns_name.length,
  //     url: `https://data.cityofnewyork.us/resource/${ dataset.resource.id }.json`,
  //   }
  // }));

  const dataset = randomFromArray(datasets);
  // consoleLog(dataset);

  // const datasetUrl = `https://${dataSource}/api/views/${dataset.resource.id}.json`;
  // const datasetUrl = `https://${dataSource}/api/views/${dataset.resource.parent_fxf[0]}.json`;

  const datasetUrl = `https://${dataSource}/api/views/${dataset.resource.parent_fxf[0]}/rows.xml?accessType=DOWNLOAD`;
  // const datasetUrl = 'https://data.nj.gov/api/views/a7mk-8suc/rows.json',
  const datasetName = dataset.resource.name;
  const datasetLabels = dataset.resource.columns_name;
  const datasetPermalink = dataset.permalink;

  // console.log("loading data...", {
  //   datasetName,
  //   dataType,
  //   datasetUrl,
  //   datasetPermalink,
  // });

  // console.log({ discoveryUrl, datasetUrl });
  response = await fetch(datasetUrl);
  // bodyParsed = await response.json();
  bodyParsed = await response.text();
  // consoleLog({bodyParsed});

  const bodyJSON = JSON.parse(
    convert.xml2json(bodyParsed, { compact: true, spaces: 4 })
  );

  bodyParsed = bodyJSON.response.row;

  // consoleLog({bodyJSON});
  // console.log({datasetUrl});
  // consoleLog({bodyParsed});

  switch (dataType) {
    case "map":
      makeMap(datasetName, datasetPermalink, bodyJSON.response.row.row);
      break;
    case "datasets":
      // console.log({
      //   datasetLabels,
      //   "data sample": bodyParsed.slice(0, 5),
      // });

      if (bodyParsed.data[0].latitude && bodyParsed[0].data.longitude) {
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
