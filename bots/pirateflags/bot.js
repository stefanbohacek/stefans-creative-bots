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
const flagUrlBase = "https://bots.stefanbohacek.com";

const describeFlagImage = (filename) =>
  filename
    .split("/")
    .pop()
    .replace(".png", "")
    .split("-")
    .filter((part) => !/^\d+$/.test(part))
    .join(" ");

const buildFlagDescription = (flagData) => {
  if (!flagData || !flagData.images.length) {
    return "A randomly generated pirate flag.";
  }

  const elements = flagData.images.map(describeFlagImage);
  const layout = flagData.layout;

  if (elements.length === 1) {
    return `A randomly generated pirate flag featuring a ${elements[0]}.`;
  }

  if (layout === "rows_2" || layout === "rows_3") {
    return `A randomly generated pirate flag featuring ${elements.map((e) => `a ${e}`).join(" on top of ")}.`;
  } else if (elements.length === 2) {
    return `A randomly generated pirate flag featuring a ${elements[0]} next to a ${elements[1]}.`;
  } else {
    const lastElement = elements[elements.length - 1];
    const otherElements = elements.slice(0, -1);
    return `A randomly generated pirate flag featuring ${otherElements.map((e) => `a ${e}`).join(", ")}, and a ${lastElement} side by side.`;
  }
};

const makeFlag = async (page) => {
  try {
    const url = "https://static.stefanbohacek.com/pirate-flags/";
    console.log(`visiting ${url} ...`);
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("img.mw-100", { timeout: 30000 });
    await page.waitForTimeout(10000);

    const flagData = await page.evaluate(() => {
      const grid = document.getElementById("grid");
      return {
        layout: grid.dataset.flagLayout,
        images: JSON.parse(grid.dataset.flagImages || "[]"),
      };
    });

    console.log("@pirateflags flagData:", JSON.stringify(flagData));

    try {
      await page.screenshot({ path: `temp/pirate-flag.jpg` });
    } catch (err) {
      console.log(
        `@pirateflags makeFlag screenshot error on line ${err.lineNumber}: ${err.message}`,
      );
    }

    return flagData;
  } catch (err) {
    console.log(
      `@pirateflags makeFlag error on line ${err.lineNumber}: ${err.message}`,
    );
    return null;
  }
};

const waveFlag = async (page, flagData) => {
  try {
    const url = `https://static.stefanbohacek.com/pirate-flags/flag.html?img=${flagUrlBase}/images/pirate-flag.jpg`;
    console.log(`visiting ${url} ...`);
    await page.goto(url, {
      // waitUntil: "networkidle0",
      waitUntil: "domcontentloaded",
      // timeout: 30000,
    });

    await page.waitForSelector("#renderArea", { timeout: 30000 });

    const pirateTalk = randomFromArray([
      `A${"a".repeat(getRandomInt(1, 7))}${"r".repeat(
        getRandomInt(1, 7),
      )}${"g".repeat(getRandomInt(1, 7))}${"h".repeat(getRandomInt(1, 7))}!`,
      "Ahoy!",
      "Ahoy, matey!",
      "All hands on deck!",
      "Avast ye!",
    ]);

    const description = buildFlagDescription(flagData);

    try {
      const screenshotPath = __dirname + `/../../temp/${botID}.jpg`;
      await page.screenshot({ path: screenshotPath });

      const mastodon = new mastodonClient({
        access_token: process.env.PIRATE_FLAGS_ACCESS_TOKEN_SECRET,
        // access_token: process.env.MASTODON_TEST_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      mastodon.postImage({
        status: `${pirateTalk}\n\n#pirates #flags`,
        image: screenshotPath,
        alt_text: description,
      });
    } catch (err) {
      console.log(
        `@pirateflags waveFlag screenshot error on line ${err.lineNumber}: ${err.message}`,
      );
    }

    console.log(description);
  } catch (err) {
    console.log(
      `@pirateflags waveFlag error on line ${err.lineNumber}: ${err.message}`,
    );
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
        browser.disconnect();
      });

      page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
      );

      await page.setViewport({ width: 1030, height: 760 });

      const flagData = await makeFlag(page);
      await waveFlag(page, flagData);
      await browser.disconnect();
    } catch (err) {
      console.log(`@pirateflags botScript error:`, err);
    }
  })();
};

export default botScript;
