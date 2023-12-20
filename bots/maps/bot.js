import fetch from "node-fetch";
import mastodonClient from "./../../modules/mastodon/index.js";
import downloadFile from "./../../modules/download-file.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "@maps";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.MAPS_BOT_ACCESS_TOKEN_SECRET,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  const response = await fetch(
    "https://www.davidrumsey.com/luna/servlet/as/fetchMediaSearch?&lc=RUMSEY~8~1&q=WHAT=%22Atlas%20Map%22&bs=1&fullData=true&random=true"
  );
  let map = await response.json();
  map = map[0];

  console.log("openig a map...");

  const imageURL =
    map.urlSize4 ||
    map.urlSize3 ||
    map.urlSize2 ||
    map.urlSize1 ||
    map.urlSize0;

  console.log({ imageURL });

  if (imageURL) {
    try {
      const attributes = JSON.parse(map.attributes);
      const filePath = `${__dirname}/../../temp/${botID}`;
      await downloadFile(imageURL, filePath);

      const source = `https://www.davidrumsey.com/luna/servlet/detail/${map.id}`;
      const status = `${attributes.full_title.replaceAll('\"', '"')} ${source}\n\n#map #maps #HistoricalMaps`;
      const description = attributes.pub_note || ""

      mastodon.postImage({
        status,
        image: filePath,
        alt_text: description.replaceAll('\"', '"'),
      });
    } catch (error) {
      console.log("maps error", error);
    }
  } else {
    botScript();
  }

  return true;
};

export default botScript;
