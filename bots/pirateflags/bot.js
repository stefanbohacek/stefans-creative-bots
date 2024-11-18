// PIRATEFLAGS

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import getRandomInt from "./../../modules/get-random-int.js";

const botID = "pirateflags";
const flagUrlBase = "https://stefans-creative-bots.glitch.me";

const makeFlag = async (page) => {
  try {
    const url = "https://static.stefanbohacek.dev/pirate-flags/";
    console.log(`visiting ${url} ...`);
    await page.goto(url, {
      // waitUntil: "networkidle0",
      waitUntil: "domcontentloaded",
      // timeout: 120000,
    });

    await page.waitForSelector("img.mw-100", { timeout: 30000 });
    await page.waitForTimeout(10000);

    try {
      await page.screenshot({ path: `temp/pirate-flag.jpg` });
    } catch (err) {
      console.log(`@pirateflags makeFlag screenshot error on line ${err.lineNumber}: ${err.message}`);
    }
  } catch (err) {
    console.log(`@pirateflags makeFlag error on line ${err.lineNumber}: ${err.message}`);
  }
};

const waveFlag = async (page) => {
  try {
    const url = `https://static.stefanbohacek.dev/pirate-flags/flag.html?img=${flagUrlBase}/images/pirate-flag.jpg`;
    console.log(`visiting ${url} ...`);
    await page.goto(url, {
      // waitUntil: "networkidle0",
      waitUntil: "domcontentloaded",
      // timeout: 30000,
    });

    await page.waitForSelector("#renderArea", { timeout: 30000 });

    const pirateTalk = randomFromArray([
      `A${"a".repeat(getRandomInt(1, 7))}${"r".repeat(
        getRandomInt(1, 7)
      )}${"g".repeat(getRandomInt(1, 7))}${"h".repeat(getRandomInt(1, 7))}!`,
      "Ahoy!",
      "Ahoy, matey!",
      "All hands on deck!",
      "Avast ye!",
    ]);

    let description = `A randomly generated pirate flag. Elements of the flag may include skeletons, skulls, pirates, crossed bones, hourglasses, hearts, and swords.`;

    try {
      const screenshotPath = __dirname + `/../../temp/${botID}.jpg`;
      await page.screenshot({ path: screenshotPath });

      const mastodon = new mastodonClient({
        access_token: process.env.PIRATE_FLAGS_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      mastodon.postImage({
        status: `${pirateTalk}\n\n#pirates #flags`,
        image: screenshotPath,
        alt_text: description,
      });
    } catch (err) {
      console.log(`@pirateflags waveFlag screenshot error on line ${err.lineNumber}: ${err.message}`);
    }

    console.log(description);
  } catch (err) {
    console.log(`@pirateflags waveFlag error on line ${err.lineNumber}: ${err.message}`);
  }
};

const botScript = async () => {
  await (async () => {
    try {
      const browser = await puppeteer.connect({
        browserWSEndpoint: process.env.BROWSERLESS_URL,
      });

      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(30000);
  
      console.log("making a new pirate flag...");
  
      process.on("unhandledRejection", (reason, p) => {
        console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
        browser.close();
      });
  
      page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
      );
  
      await page.setViewport({ width: 1030, height: 760 });
  
      await makeFlag(page);
      await waveFlag(page);
      await browser.close();
    } catch (err) {
      console.log(`@pirateflags botScript error on line ${err.lineNumber}: ${err.message}`);
    }
  })();
};

export default botScript;
