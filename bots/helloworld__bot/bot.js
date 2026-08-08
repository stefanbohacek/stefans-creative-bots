import fs from "fs";
import { writeFile } from "fs/promises";
import he from "he";
import { parse } from "csv-parse";
import languages from "./../../data/languages.js";
import peopleEmoji from "./../../data/emoji/people.json" with { type: "json" };
import mastodonClient from "./../../modules/mastodon/index.js";
import emojiCard from "./../../modules/generators/emojiCard.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);
const imagePath = getTempDirPath("png");

const botScript = async () => {
  try {
    const mastodon = new mastodonClient({
      // access_token: process.env.MASTODON_TEST_TOKEN,
      access_token: process.env.HELLOWORLDBOT_MASTODON_ACCESS_TOKEN,
      api_url: process.env.MASTODON_API_URL,
    });

    const csvData = await fs.promises.readFile("data/hello.csv", "utf8");

    const helloTranslations = await new Promise((resolve, reject) => {
      parse(csvData, { comment: "#" }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    helloTranslations.shift();

    const findLanguageData = (languageCode) =>
      languages.find(
        (language) =>
          language.two_letter &&
          language.two_letter[0].split("-")[0] === languageCode.split("-")[0],
      );

    const eligibleTranslations = helloTranslations.filter((translation) => {
      const [code, , languageCode] = translation;
      if (["il", "ru"].includes(code)) {
        return false;
      }
      return Boolean(findLanguageData(languageCode));
    });

    const [, countryName, languageCode, helloEncoded] =
      randomFromArray(eligibleTranslations);
    // const [, countryName, languageCode, helloEncoded] = helloTranslations.find(
    //   (translation) => translation[0] === "kh",
    // );
    const helloTranslation = he.decode(helloEncoded);

    const languageData = findLanguageData(languageCode);
    const languageName = languageData.language[0];
    const emoji = randomFromArray(peopleEmoji).emoji;

    const imageBuffer = await emojiCard({
      mainText: helloTranslation,
      captionText: `(Hello in ${languageName})`,
      emoji,
      width: 400,
      height: 400,
      mainFontSize: 48,
      captionFontSize: 24,
      captionMarginTop: 16,
      emojiFontSize: 80,
      emojiMarginTop: 32,
      scale: 2,
    });

    await writeFile(imagePath, imageBuffer);

    // const status = `Hello from ${countryName}! #HelloWorld #${countryName.replace(
    const status = `#hello #HelloWorld #language #linguistics`;

    await mastodon.postImage({
      status,
      image: imagePath,
      alt_text: `${helloTranslation} (Hello in ${languageName}) ${emoji}`,
    });
  } catch (err) {
    console.log(`${botID} error on line ${err.lineNumber}: ${err.message}`);
    throw err;
  }
};

export default botScript;
