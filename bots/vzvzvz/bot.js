import fs from "fs";
import he from "he";
import onomatopoeias from "./../../data/onomatopoeias.js";
import languages from "./../../data/languages.js";
import overlayGenerator from "./../../modules/generators/overlay.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import { parse } from "csv-parse";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.VZVZVZ_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.VZVZVZ_BOT_MASTODON_API,
  });

  const category = randomFromArray(onomatopoeias);
  const item = randomFromArray(category.data);
  let language,
    sounds = [];

  //   console.log('picking a random item...');
  //   console.log({item});
  //   console.log('iterating...');

  for (let key in item) {
    // console.log({key, item});

    if (key === "language") {
      language = item[key][0];
    } else {
      let sound = {};
      sound[key] = item[key][0];
      sounds.push(sound);
    }
  }

  //   console.log('finished...');
  //   console.log({language, sounds});

  const randomSound = randomFromArray(sounds);
  const action = Object.keys(randomSound)[0];

  const languageData = languages.filter((l) => l["language"][0] === language);
  //   console.log({languageData});

  if (languageData && languageData.length) {
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
              // console.log({helloTranslations});

              const locationData = randomFromArray(
                helloTranslations.filter(
                  (hello) =>
                    hello[2] === languageData[0].two_letter[0] ||
                    hello[2] === languageData[0].two_letter[0].split("-")[0]
                )
              );

              if (locationData && locationData.length) {
                const country = randomFromArray(locationData);
                // console.log({country});
                const lat = country[4];
                const lon = country[5];

                console.log({
                  language,
                  action,
                  sound: randomSound[action],
                  lat,
                  lon,
                });
                console.log({ locationData });

                const languageCode = locationData[2],
                  countryName = locationData[1],
                  countryLat = locationData[4],
                  countryLong = locationData[5],
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

                let fontSize = 200;

                if (randomSound[action].length > 5){
                  fontSize = Math.floor(5/randomSound[action].length * 200);
                }

                overlayGenerator(
                  [
                    {
                      url: map_url,
                      x: 0,
                      y: 0,
                      width,
                      height,
                    },
                    {
                      text: randomSound[action],
                      fontSize,
                      fontFileName,
                      fontFamily,
                      style: "#fff",
                      position: "center center",
                    },
                  ],
                  { width, height },
                  (err, image) => {
                    const status = `The sound of "${action}" in ${language}!\n#language #linguistics #onomatopoeia #maps`;

                    mastodon.postImage({
                      status,
                      image,
                      alt_text: `Map of ${countryName} overlayed with "${randomSound[action]}".`,
                    });
                  }
                );
              } else {
                botScript();
              }
            }
          }
        );
      }
    });
  } else {
    botScript();
  }
};

export default botScript;
