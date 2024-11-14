import rainGenerator from "./../../modules/generators/rain.js";
import gtsClient from "./../../modules/GoToSocial/client.js";
import randomFromArray from "./../../modules/random-from-array.js";
import wikidata from "./../../modules/wikidata.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  const gotosocial = new gtsClient({
    access_token: process.env.GTS_RAIN_BOT_TOKEN,
    domain: process.env.GTS_DOMAIN_NAME,
  });

  // const status = randomFromArray([
  //     "🌧️ #rain #weather #gif",
  //     "🌧️🌧️ #rain #weather #gif",
  //     "🌧️🌧️🌧️ #rain #weather #gif",
  //   ]),
  //   options = {
  //     width: 640,
  //     height: 480,
  //   };

  // rainGenerator(options, (err, image) => {
  //   mastodon.postImage({
  //     status,
  //     image,
  //     alt_text: "Animated GIF of rain.",
  //   });
  // });

  let postOptions = {
    status: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis euismod diam, eu placerat neque. Donec massa dolor, suscipit nec nulla ac, egestas imperdiet urna. Pellentesque vestibulum commodo ipsum eu venenatis. Aliquam mi enim, viverra a ipsum eget, iaculis ullamcorper tellus. Suspendisse eleifend sapien euismod, iaculis erat congue, consequat purus. Proin et pretium purus. Phasellus eu finibus ligula. Nunc eget ultrices ligula. In facilisis non lectus ornare vestibulum. Duis ac elementum metus, finibus suscipit leo. Sed fermentum rhoncus diam a dictum. Aliquam accumsan iaculis bibendum.

Proin consequat congue est, eget vehicula elit. Vestibulum in est accumsan, malesuada eros quis, mollis nunc. Aliquam eget ligula sed dui auctor viverra ac dapibus quam. Duis non iaculis metus. Suspendisse efficitur diam nec ligula sagittis feugiat ac non diam. Duis aliquam bibendum risus, sed egestas dui interdum at. Sed elementum luctus accumsan. Nunc viverra elementum risus, eu rhoncus magna tristique vel. Curabitur imperdiet tincidunt nisi.

Nam libero eros, blandit in fermentum non, accumsan non nisi. Aliquam ullamcorper lectus id lobortis euismod. Phasellus sit amet sem sodales, scelerisque lectus tempor, tristique elit. Phasellus quis quam semper, congue elit a, congue eros. Sed aliquam semper sapien, ac congue nisl lacinia consequat. Etiam fermentum magna libero, eu finibus ligula blandit vitae. Nam vel sem consectetur, condimentum tellus at, placerat tellus. Nulla fringilla, urna in tincidunt imperdiet, sem diam tempor arcu, a mattis sapien nisi vel ipsum. Curabitur bibendum metus eros, sed consequat neque gravida vel. Sed porta ligula molestie sollicitudin ullamcorper. Donec id neque efficitur, volutpat tortor eget, posuere metus. Donec fringilla scelerisque dui sit amet convallis. Aliquam et aliquet neque, non egestas justo. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;`,
    visibility: "public",
    // poll: {
    //   options: options,
    //   expires_in: 86400,
    // },
  };

  // const post = await gotosocial.post(postOptions);

  const items = await wikidata(`
    SELECT ?item ?itemLabel ?placeLabel ?itemDescription ?lon ?lat ?image ?article WHERE {
      ?item wdt:P31 wd:Q39715 .
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
        ?article schema:isPartOf <https://en.wikipedia.org/>
      }
    } 
`);

  const item = randomFromArray(items);
  console.log(item);
  let imageUrl = "";

  if (item.image) {
    imageUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/url-${encodeURIComponent(
      item.image
    )}(${item.long},${item.lat})/${item.long},${
      item.lat
    },5/900x720?access_token=pk.eyJ1IjoiZm91cnRvbmZpc2giLCJhIjoiY2tvbjg3d283MDIycTJvcWgyeXh6bXExayJ9.oALSklpKZvB95noosnGNNA`;
  }

  const status = `${item.label ? `${item.label}, ` : ""} ${
    item.description ? `${item.description}. ` : ""
  }\n\n${item.wikipediaUrl}\n\n#lighthouse #map`;

  const filePath = `${__dirname}/../../temp/lighthouse.jpg`;
  await downloadFile(imageUrl, filePath);

  const post = await gotosocial.postImage({
    file: filePath,
    description:
      "A photo of a lighthouse from the linked website, overlaid on a cropped world map where it's located.",
    status: status.replace("  ", " "),
  });

  console.log("posted", post);
};

export default botScript;
