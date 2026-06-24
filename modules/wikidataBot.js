import mastodonClient from "./mastodon/index.js";
import randomFromArray from "./randomFromArray.js";
import sleep from "./sleep.js";
import {
  queryWikidata,
  getWikidataLabel,
  getWikidataCache,
  saveWikidataCache,
  resolveImageURL,
} from "./wikidata.js";
import { getMainImage } from "./wikipedia.js";
import { base64 as downloadFileAsBase64 } from "./fetch.js";
import capitalizeFirstLetter from "./capitalizeFirstLetter.js";

const MAX_RETRIES = 5;

const wikidataBot = async (
  botID,
  { query, accessToken, hashtags, altText, filterItems, status: buildStatus },
) => {
  let items = [];
  const cached = await getWikidataCache(botID);
  const filterImage = query.includes("?lon") && query.includes("?lat");

  if (!cached || cached.isStale) {
    const freshItems = await queryWikidata(query, filterImage);
    if (freshItems.length) {
      await saveWikidataCache(botID, freshItems);
      items = freshItems;
    } else if (cached) {
      console.log(`${botID}: live fetch failed, using stale cache`);
      items = cached.data;
    }
  } else {
    items = cached.data;
  }

  if (filterItems) {
    items = filterItems(items);
  }

  if (!items.length) {
    console.log(`${botID}: no items found`);
    return;
  }

  const mastodon = new mastodonClient({
    access_token: accessToken,
    api_url: process.env.MASTODON_API_URL,
  });

  const errorMessages = {};

  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    if (retry > 0) {
      await sleep(1000 * retry);
    }

    const item = randomFromArray(items);

    if (item.label === item.wikidataId) {
      item.label = await getWikidataLabel(item);
    }

    console.log(item);

    try {
      const addDescription =
        item.description &&
        !item.label?.toLowerCase().includes(item.description.toLowerCase());

      const status = capitalizeFirstLetter(
        (buildStatus
          ? buildStatus(item)
          : `${item.label ? `${item.label}, ` : ""}${
              addDescription ? `${item.description}. ` : ""
            }\n\n${item.wikipediaUrl}\n\n${hashtags}`
        ).replace("  ", " "),
      );

      let imageUrl = null;

      if (filterImage) {
        const resolvedImageURL = await resolveImageURL(item.image);
        imageUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/url-${encodeURIComponent(
          resolvedImageURL,
        )}(${item.long},${item.lat})/${item.long},${item.lat},5/900x720?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`;
      } else {
        imageUrl = await getMainImage(item.wikipediaUrl);
      }

      if (imageUrl) {
        const imgData = await downloadFileAsBase64(imageUrl);
        await mastodon.postImage({
          status,
          image: imgData,
          alt_text: altText,
        });
      } else {
        await mastodon.post({ status });
      }

      return true;
    } catch (err) {
      console.log(
        `${botID}: attempt ${retry + 1} failed for ${item.wikipediaUrl}:`,
        err.message,
      );
      errorMessages[err.message] = (errorMessages[err.message] || 0) + 1;
    }
  }

  const summary = Object.entries(errorMessages)
    .map(([errMessage, count]) => `- ${count} x ${errMessage}`)
    .join("\n");

  throw new Error(`${botID}: failed after ${MAX_RETRIES} attempts\n${summary}`);
};

export default wikidataBot;
