import { parse } from "csv-parse/sync";
import { JWT } from "google-auth-library";
import mastodonClient from "./../../modules/mastodon/index.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { file as downloadFile } from "./../../modules/fetch.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const MAX_ALT_TEXT_LENGTH = 1500;

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.BOOK_DEDICATION_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const sheets = new JWT({
    email: process.env.BOOK_DEDICATION_BOT_GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.BOOK_DEDICATION_BOT_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(
      /\\n/g,
      "\n",
    ),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const response = await fetch(process.env.BOOK_DEDICATION_BOT_DATA_URL_CSV);
  const rows = parse(await response.text(), { columns: true });
  console.log(`${botID}: found ${rows.length} item(s)`);

  const dedications = rows
    .map((row, index) => ({
      ...row,
      row: index + 2,
      posted: parseInt(row.posted) || 0,
    }))
    .filter(
      (dedication) =>
        dedication.image_url &&
        dedication.dedication_text &&
        dedication.title &&
        dedication.author,
    );

  const priorityDedications = dedications.filter(
    (dedication) => dedication.priority === "yes",
  );

  let candidates = dedications;

  if (priorityDedications.length > 0) {
    console.log(`${botID}: using priority list`);
    candidates = priorityDedications;
  }

  const minPostedCount = Math.min(
    ...candidates.map((dedication) => dedication.posted),
  );

  const leastPostedDedications = candidates.filter(
    (dedication) => dedication.posted === minPostedCount,
  );

  console.log(
    `${botID}: picking from ${leastPostedDedications.length} item(s)`,
  );

  const dedication = randomFromArray(leastPostedDedications);
  const imageID = dedication.image_url.split("/")[5];
  const imagePath = getTempDirPath("jpg");

  await downloadFile(
    `http://drive.google.com/uc?export=view&id=${imageID}`,
    imagePath,
  );

  let altText = dedication.dedication_text;

  if (altText.length > MAX_ALT_TEXT_LENGTH) {
    altText = `${altText.slice(0, MAX_ALT_TEXT_LENGTH - 3)}...`;
  }

  await mastodon.postImage({
    status: `${dedication.title} by ${dedication.author} #books #literature #dedication`,
    image: imagePath,
    alt_text: altText,
  });

  await sheets.request({
    url: `${process.env.BOOK_DEDICATION_BOT_DATA_URL_API}!E${dedication.row}:E${dedication.row}?valueInputOption=USER_ENTERED`,
    method: "PUT",
    data: { values: [[dedication.posted + 1]] },
  });

  await sheets.request({
    url: `${process.env.BOOK_DEDICATION_BOT_DATA_URL_API}!G${dedication.row}:G${dedication.row}?valueInputOption=USER_ENTERED`,
    method: "PUT",
    data: { values: [[""]] },
  });
};

export default botScript;
