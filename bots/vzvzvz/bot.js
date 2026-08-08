import { writeFile } from "fs/promises";
import onomatopoeias from "./../../data/onomatopoeias.js";
import onomatopoeiaEmoji from "./../../data/emoji/onomatopoeias.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import emojiCard from "./../../modules/generators/emojiCard.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { getTempDirPath } = getBotInfo(import.meta.url);
const imagePath = getTempDirPath("png");

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.VZVZVZ_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const category = randomFromArray(onomatopoeias);
  // const item = randomFromArray(category.data);
  const item = randomFromArray(
    category.data.filter((d) => !d.language.includes("Russian")),
  );

  let language;
  let sounds = [];

  //   console.log('picking a random item...');
  //   console.log({item});
  //   console.log('iterating...');

  for (let key in item) {
    // console.log({key, item});

    if (key === "language") {
      language = item[key][0];
    } else {
      let sound = {};
      sound[key] = item[key][0];
      sounds.push(sound);
    }
  }

  //   console.log('finished...');
  //   console.log({language, sounds});

  const randomSound = randomFromArray(sounds);
  const action = Object.keys(randomSound)[0];
  const emoji = onomatopoeiaEmoji[action];
  const fullSound = randomSound[action];
  const mainText = fullSound.split(/[([]/)[0].trim() || fullSound;

  console.log({ language, action, sound: fullSound, mainText });

  const width = 1280,
    height = 1280;

  let fontSize = 200;

  if (mainText.length > 5) {
    fontSize = Math.max(75, Math.floor((5 / mainText.length) * 200));
  }

  const imageBuffer = await emojiCard({
    mainText,
    captionText: `(The sound of "${action}" in ${language})`,
    emoji,
    width,
    height,
    mainFontSize: fontSize,
    captionFontSize: 48,
    captionMarginTop: 32,
    emojiFontSize: 160,
    emojiMarginTop: 64,
  });

  await writeFile(imagePath, imageBuffer);

  const status = `#language #linguistics #onomatopoeia`;

  await mastodon.postImage({
    status,
    image: imagePath,
    alt_text: `"${randomSound[action]}": the sound of ${action} in ${language}. ${emoji}`,
  });
};

export default botScript;
