import mastodonClient from "./../../modules/mastodon/index.js";
import UnitConverter from "./../../modules/UnitConverter.js";
import getRandomInt from "./../../modules/getRandomInt.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import {
  base64 as downloadFileAsBase64,
  json as fetchJSON,
} from "./../../modules/fetch.js";
import { getWikipediaPage } from "./../../modules/wikipedia.js";
import { searchWikidata, getWikidataEntity } from "./../../modules/wikidata.js";

const getCommonName = async (title) => {
  const baseName = title.split(" ").slice(0, 2).join(" ");

  let [wikidataResult] = await searchWikidata(title);
  let searchTitle = title;

  if (!wikidataResult && baseName !== title) {
    [wikidataResult] = await searchWikidata(baseName);
    searchTitle = baseName;
  }

  let commonName;

  if (wikidataResult) {
    const entity = await getWikidataEntity(wikidataResult.id);
    const aliases = entity?.aliases?.en || [];
    const otherAliases = aliases.filter(
      (alias) => alias.value.toLowerCase() !== searchTitle.toLowerCase(),
    );
    commonName = otherAliases[0]?.value;

    if (!commonName) {
      const taxonCommonNames = entity?.claims?.P1843 || [];
      const englishCommonName = taxonCommonNames.find(
        (claim) => claim.mainsnak?.datavalue?.value?.language === "en",
      );
      commonName = englishCommonName?.mainsnak?.datavalue?.value?.text;
    }
  }

  return commonName;
};

const botScript = async () => {
  //TODO: Pagination should work dynamically.
  const apiURL = `https://images.wur.nl/digital/api/search/collection/coll13/page/${getRandomInt(
    1,
    12,
  )}/maxRecords/100`;
  const respJSON = await fetchJSON(apiURL);
  const item = randomFromArray(respJSON.items);
  item.title = item.title.trim();
  // console.log(item);

  let plantDescription = item.metadataFields.find(
    (field) => field.field === "descri",
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

  const imageUrl = `https://images.wur.nl/digital/api/singleitem/image/coll13/${item.itemId}/default.jpg`;
  const imgData = await downloadFileAsBase64(imageUrl);

  const commonName = await getCommonName(item.title);
  // const commonName = await getCommonName("Ornithopus perpusillus");
  const commonNameText = commonName ? ` (${commonName})` : "";

  const wikipediaUrl = await getWikipediaPage(item.title);
  const wikipediaLink = wikipediaUrl ? `\n\n${wikipediaUrl}` : "";
  const status = `${item.title}${commonNameText}. https://images.wur.nl/digital/collection/coll13/id/${item.itemId}/${wikipediaLink}\n\n#plants #roots #illustration`;

  // console.log(status);

  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.ROOTS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  await mastodon.postImage({
    status: status.replace("  ", " "),
    image: imgData,
    alt_text: `A drawing of a plant's root system from the linked website.${plantDescription}`,
  });

  return true;
};

export default botScript;
