import fs from "fs";
import { writeFile } from "fs/promises";
import he from "he";
import { parse } from "csv-parse";
import languages from "./../../data/languages.js";
import peopleEmoji from "./../../data/emoji/people.json" with { type: "json" };
import mastodonClient from "./../../modules/mastodon/index.js";
import renderHtml from "./../../modules/renderHtml.js";
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

    const eligibleTranslations = helloTranslations.filter(
      (translation) => !["il", "ru"].includes(translation[0]),
    );

    const [, countryName, languageCode, helloEncoded] =
      randomFromArray(eligibleTranslations);
    // const [, countryName, languageCode, helloEncoded] = helloTranslations.find(
    //   (translation) => translation[0] === "kh",
    // );
    const helloTranslation = he.decode(helloEncoded);

    const languageData = languages.find(
      (language) =>
        language.two_letter &&
        language.two_letter[0].split("-")[0] === languageCode.split("-")[0],
    );
    const languageName = languageData ? languageData.language[0] : languageCode;
    const emoji = randomFromArray(peopleEmoji).emoji;

    const html = /* html */ `
      <div id="hello">${helloTranslation}</div>
      <div id="language">(Hello in ${languageName})</div>
      <div id="emoji">${emoji}</div>
    `;

    const imageBuffer = await renderHtml({
      html,
      cssInline: /* css */ `
        @font-face {
          font-family: "Go Noto Kurrent";
          src: url("https://bots.stefanbohacek.com/fonts/GoNotoKurrent-Regular.ttf");
        }
        body {
          margin: 0;
          width: 400px;
          height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-family: "Go Noto Kurrent", serif;
          transform: scale(2);
          transform-origin: top left;
        }
        #hello {
          font-size: 48px;
        }
        #language {
          margin-top: 16px;
          font-size: 24px;
        }
        #emoji {
          margin-top: 32px;
          font-size: 80px;
        }
      `,
    });

    await writeFile(imagePath, imageBuffer);

    const status = `Hello from ${countryName}! #HelloWorld #${countryName.replace(
      /\s+/g,
      "",
    )} #language #linguistics`;

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
