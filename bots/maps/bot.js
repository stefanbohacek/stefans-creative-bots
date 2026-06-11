import mastodonClient from "./../../modules/mastodon/index.js";
import fetchJSON from "./../../modules/fetchJSON.js";
import downloadFileAsBase64 from "./../../modules/downloadFileAsBase64.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.MAPS_BOT_ACCESS_TOKEN_SECRET,
    api_url: process.env.MASTODON_API_URL,
  });

  let map = await fetchJSON(
    "https://www.davidrumsey.com/luna/servlet/as/fetchMediaSearch?&lc=RUMSEY~8~1&q=WHAT=%22Atlas%20Map%22&bs=1&fullData=true&random=true"
  );
  map = map[0];

  // console.log("openig a map...");

  const imageURL =
    map.urlSize4 ||
    map.urlSize3 ||
    map.urlSize2 ||
    map.urlSize1 ||
    map.urlSize0;

  // console.log({ imageURL });

  if (imageURL) {
    try {
      const attributes = JSON.parse(map.attributes);

      // console.log({
      //   "map.date": map.date,
      //   "attributes.country": attributes.country,
      // });

      const imgData = await downloadFileAsBase64(imageURL);

      const source = `https://www.davidrumsey.com/luna/servlet/detail/${map.id}`;
      // const description = attributes.pub_note || ""
      const mapDate = map?.date || attributes?.pub_date || false; 
      const mapAge = mapDate ? ` ${mapDate} ` : "n old ";
      let mapArea = "";

      if (attributes.country && attributes.country.length) {
        if (Array.isArray(attributes.country)) {
          mapArea = ` of ${attributes.country.join(", ")}`;
        } else {
          mapArea = ` of ${attributes.country}`;
        }
      }

      // const description = `A${mapAge}map${mapArea} from the website linked in the post.`;
      const description = `A map${mapArea} from the website linked in the post.`;

      let status = `${attributes.full_title.replaceAll(
        '"',
        '"'
      )}`;

      if (mapDate && !status.includes(mapDate)){
        status += ` Published in ${mapDate}.`
      }

      status += ` ${source}\n\n#map #maps #HistoricalMaps`;

      await mastodon.postImage({
        status,
        image: imgData,
        alt_text: description,
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
