import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { queryWikidata, getWikidataLabel } from "./../../modules/wikidata.js";
import downloadFileAsBase64 from "./../../modules/downloadFileAsBase64.js";

const botScript = async () => {
  const items = await queryWikidata(
    /* sql */ `
    SELECT DISTINCT ?item ?itemLabel ?itemDescription ?image ?article 
    WHERE 
    {
      ?item wdt:P105 wd:Q34740 .
      ?item wdt:P171+ wd:Q430 .
      ?item schema:description ?itemDescription FILTER (LANG(?itemDescription) = "en") .
      ?item wdt:P18 ?image .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
      {
        ?article schema:about ?item .
        ?article schema:inLanguage "en" .
        ?article schema:isPartOf <https://en.wikipedia.org/>
      }
    }
  `,
    true,
  );

  // TODO: Temporary fix until I can figure out the query.

  const dinosaurs = items.filter(
    (item) =>
      item.description?.toLowerCase().includes("dinosaur") ||
      item.description?.toLowerCase().includes("reptile"),
  );

  const item = randomFromArray(dinosaurs);

  if (item.label === item.wikidataId) {
    item.label = await getWikidataLabel(item);
  }

  // console.log("items", items);
  // console.log("dinosaurs", dinosaurs);
  // console.log("item", item);

  let imageUrl = "";

  if (item.image) {
    imageUrl = item.image;
  }

  const status = `${item.label}.\n\n${item.wikipediaUrl}\n\n#dinosaur`;

  const imgData = await downloadFileAsBase64(imageUrl);

  const mastodon = new mastodonClient({
    access_token: process.env.DINOSAURS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  await mastodon.postImage({
    status: status.replace("  ", " "),
    image: imgData,
    alt_text:
      "A photo or drawing of a dinosaur or dinosaur remains from the linked Wikipedia page.",
  });

  return true;
};

export default botScript;
