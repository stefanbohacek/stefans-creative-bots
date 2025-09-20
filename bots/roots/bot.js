import mastodonClient from "./../../modules/mastodon/index.js";
import UnitConverter from "./../../modules/UnitConverter.js";
import getRandomInt from "./../../modules/get-random-int.js";
import randomFromArray from "./../../modules/random-from-array.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  const botId = "roots";
  //TODO: Pagination should work dynamically.
  const apiURL = `https://images.wur.nl/digital/api/search/collection/coll13/page/${getRandomInt(
    1,
    12
  )}/maxRecords/100`;
  const resp = await fetch(apiURL);
  const respJSON = await resp.json();
  const item = randomFromArray(respJSON.items);
  // console.log(item);

  let plantDescription = item.metadataFields.find(
    (field) => field.field === "descri"
  )?.value;

  if (plantDescription) {
    const unitConverter = new UnitConverter();

    const regex =
      /H plant (\d+) cm, D root (\d+) cm, diameter root system (\d+) cm/;
    const match = plantDescription.match(regex);
    const heightCM = match[1];
    const depthCM = match[2];
    const diameterCM = match[3];
    const heightInch = unitConverter.cmToInches(heightCM, 1);
    const depthInch = unitConverter.cmToInches(depthCM, 1);
    const diameterInch = unitConverter.cmToInches(diameterCM, 1);

    plantDescription = `\n\n- plant height: ${heightCM.toLocaleString()} centimeters / ${heightInch.toLocaleString()} inches\n- root depth: ${depthCM.toLocaleString()} centimeters / ${depthInch.toLocaleString()} inches\n- root system diameter: ${diameterCM.toLocaleString()} centimeters / ${diameterInch.toLocaleString()} inches`;
  } else {
    plantDescription = "";
  }

  let imageUrl = `https://images.wur.nl/digital/api/singleitem/image/coll13/${item.itemId}/default.jpg`;
  const filePath = `${__dirname}/../../temp/${botId}.jpg`;
  await downloadFile(imageUrl, filePath);
  const status = `${item.title}. https://images.wur.nl/digital/collection/coll13/id/${item.itemId}/\n\n#plants #roots #illustration`;

  // console.log(status);
  // console.log(plantDescription);

  const mastodon = new mastodonClient({
    access_token: process.env.ROOTS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  mastodon.postImage({
    status: status.replace("  ", " "),
    image: filePath,
    alt_text: `A drawing of a plant's root system from the linked website.${plantDescription}`,
  });

  return true;
};

export default botScript;
