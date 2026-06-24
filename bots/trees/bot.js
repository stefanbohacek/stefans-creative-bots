import mastodonClient from "./../../modules/mastodon/index.js";
import getRandomInt from "./../../modules/getRandomInt.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import {
  base64 as downloadFileAsBase64,
  json as fetchJSON,
} from "./../../modules/fetch.js";
import { getWikipediaPage } from "./../../modules/wikipedia.js";
import sleep from "./../../modules/sleep.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const getTree = async (itemId, title) => {
  const itemDetails = await fetchJSON(
    `https://images.wur.nl/digital/api/collections/coll5/items/${itemId}/false`,
  );

  if (!itemDetails.parent || !itemDetails.imageUri) {
    throw new Error(`No photo available`);
  }

  const thumbnailUrl = `https://images.wur.nl/digital${itemDetails.thumbnailUri}`;
  const thumbnailData = await downloadFileAsBase64(thumbnailUrl);

  if (Buffer.from(thumbnailData, "base64").length === 3218) {
    throw new Error(`No photo available`);
  }

  const imgData = await downloadFileAsBase64(itemDetails.imageUri);

  const wikipediaUrl = await getWikipediaPage(title);
  const wikipediaLink = wikipediaUrl ? `\n\n${wikipediaUrl}` : "";
  const status = `${title}. https://images.wur.nl/digital/collection/coll5/id/${itemId}/${wikipediaLink}\n\n#trees`;

  return { imgData, status };
};

const botScript = async () => {
  //TODO: Pagination should work dynamically.
  const apiURL = `https://images.wur.nl/digital/api/search/collection/coll5/page/${getRandomInt(
    1,
    10,
  )}/maxRecords/100`;
  const respJSON = await fetchJSON(apiURL);

  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.TREES_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const maxRetries = 10;
  const errorMessages = {};

  for (let retry = 0; retry < maxRetries; retry++) {
    if (retry > 0) {
      await sleep(1000 * retry);
    }

    const item = randomFromArray(respJSON.items);
    // console.log(item);

    try {
      const { imgData, status } = await getTree(item.itemId, item.title);
      // const { imgData, status } = await getTree(
      //   1394,
      //   "THIS IS A TEST!",
      // );

      // console.log(status);

      await mastodon.postImage({
        status: status.replace("  ", " "),
        image: imgData,
        alt_text: `A photo of a tree from the linked website.`,
      });

      return true;
    } catch (err) {
      console.log(
        `${botID}: attempt ${retry + 1} failed for ${item.title}:`,
        err.message,
      );
      errorMessages[err.message] = (errorMessages[err.message] || 0) + 1;
    }
  }

  const summary = Object.entries(errorMessages)
    .map(([errMessage, count]) => `- ${count} x ${errMessage}`)
    .join("\n");

  throw new Error(`${botID}: failed after ${maxRetries} attempts\n${summary}`);
};

export default botScript;
