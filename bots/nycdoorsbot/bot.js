import mastodonClient from "./../../modules/mastodon/index.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import { getNextItem } from "../../modules/rotationQueue.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { json as fetchJSON, file as fetchFile } from "./../../modules/fetch.js";
import doors from "./../../data/nyc/doors.json" with { type: "json" };

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const parseStreet = (title) => {
  const [street] = title.split(/\s+between\s+/i);

  return street;
};

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.NYCDOORSBOT_MASTODON_ACCESS_TOKEN,
    // access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const allContainerUrls = doors.map((door) => door.url);
  const nextContainerUrl = await getNextItem(botID, allContainerUrls);
  const container = doors.find((door) => door.url === nextContainerUrl);

  const itemsData = await fetchJSON(container.url, {
    headers: {
      Authorization: `Token token="${process.env.NYPL_DATA_TOKEN}"`,
    },
  });

  const items = itemsData.nyplAPI.response.item;

  if (!items || !items.length) {
    console.log(`${botID}: no items found`, container.url);
    return;
  }

  const item = randomFromArray(items);

  const captureData = await fetchJSON(
    `https://api.repo.nypl.org/api/v2/items/${item.uuid}`,
    {
      headers: {
        Authorization: `Token token="${process.env.NYPL_DATA_TOKEN}"`,
      },
    },
  );

  const capture = captureData.nyplAPI.response.capture?.[0];

  if (!capture || !capture.imageID) {
    console.log(`${botID}: no capture found`, item.uuid);
    return;
  }

  const imageUrl = `https://images.nypl.org/index.php?id=${capture.imageID}&t=w`;
  const street = parseStreet(capture.title);
  const osmSearchUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${street} Manhattan NYC`)}`;

  const imagePath = getTempDirPath("jpg");
  await fetchFile(imageUrl, imagePath);

  const status = `${capture.title}\n\n${osmSearchUrl}\n\n#NYC #NewYorkCity #doors #photography`;

  await mastodon.postImage({
    status,
    image: imagePath,
    alt_text: "A 1976 black-and-white photo of a doorway in New York.",
  });
};

export default botScript;
