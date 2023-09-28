import fs from "fs";
import he from "he";
import overlayGenerator from "./../../modules/generators/overlay.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { parse } from 'csv-parse';

// import {generate, parse, transform, stringify} from 'csv/sync';


// const csvParse = require("csv-parse");
// const mastodon = new mastodonClient({
//   access_token: process.env.HELLOWORLDBOT_MASTODON_ACCESS_TOKEN,
//   api_url: process.env.HELLOWORLDBOT_MASTODON_API,
// });

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.HELLOWORLDBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.HELLOWORLDBOT_MASTODON_API,
  });

  fs.readFile("data/hello.csv", "utf8", (err, csvData) => {
    if (!err && csvData) {
      parse(
        csvData,
        {
          comment: "#",
        },
        (err, helloTranslations) => {
          helloTranslations.shift(); // Remove the table header

          if (!err && helloTranslations && helloTranslations.length > 0) {
            // /* For testing. */ const randomTranslation = helloTranslations[69];
            const randomTranslation = randomFromArray(helloTranslations);

            console.log(randomTranslation);

            const languageCode = randomTranslation[2],
              helloTranslation = he.decode(randomTranslation[3]),
              countryName = randomTranslation[1],
              countryLat = randomTranslation[4],
              countryLong = randomTranslation[5],
              center = `${countryLat},${countryLong}`,
              width = 1280,
              height = 1280,
              scale = 2,
              zoom = 6,
              maptype = "roadmap",
              style =
                "feature:all|element:all|visibility:on&style=feature:administrative|element:labels.text.fill|color:0x444444&style=feature:landscape|element:all|color:0xf2f2f2&style=feature:poi|element:all|visibility:off&style=feature:road|element:all|saturation:-100|lightness:45|visibility:on|weight:1|gamma:.5&style=feature:road|element:geometry.fill|color:0xd6d5d5&style=feature:road|element:geometry.stroke|color:0xbab7b7&style=feature:road.highway|element:all|visibility:simplified&style=feature:road.arterial|element:labels.icon|visibility:off&style=feature:transit|element:all|visibility:off&style=feature:water|element:all|color:0xc8d7d4|visibility:onoff",
              map_url = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${width}x${height}&scale=${scale}&maptype=${maptype}&style=${style}&key=${process.env.HELLOWORLDBOT_GOOGLE_MAPS_API_KEY}`;

            let fontFileName, fontFamily;

            if (languageCode === "ja") {
              fontFileName = "Noto_Sans_JP-700-2.otf";
              fontFamily = "Noto Sans JP";
            } else if (languageCode === "zh" || languageCode === "zh-hk") {
              fontFileName = "Noto_Sans_TC-700-9.otf";
              fontFamily = "Noto Sans TC";
            } else if (
              languageCode === "ar" ||
              languageCode.indexOf("ar-") !== -1
            ) {
              fontFileName = "Cairo-700-3.ttf";
              fontFamily = "Cairo";
            } else if (languageCode === "bn") {
              fontFileName = "Hind_Siliguri-700-5.ttf";
              fontFamily = "Hind Siliguri";
            } else if (languageCode === "ka") {
              fontFileName = "Baloo_Tamma-400-1.ttf";
              fontFamily = "Baloo Tamma";
            } else {
              fontFileName = "Pridi-700-11.ttf";
              fontFamily = "Pridi";
            }

            overlayGenerator(
              [
                {
                  url: map_url,
                  x: 0,
                  y: 0,
                  width: width,
                  height: height,
                },
                {
                  text: helloTranslation,
                  fontSize: 200,
                  fontFileName: fontFileName,
                  fontFamily: fontFamily,
                  style: "#fff",
                  position: "center center",
                },
              ],
              { width, height },
              (err, image) => {
                const status = `Hello from ${countryName}! #HelloWorld #${countryName.replace(
                  /\s+/g,
                  ""
                )}`;

                console.log("status", status);

                // twitter.postImage({
                //   status,
                //   image: image,
                //   alt_text: `Map of ${ countryName } overlayed with a translation of the word "hello".`,
                // });

                mastodon.postImage({
                  status,
                  image,
                  alt_text: `Map of ${countryName} overlayed with a translation of the word "hello": ${helloTranslation}.`,
                });
              }
            );
          }
        }
      );
    }
  });
};

export default botScript;
