import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import getRandomInt from "./../../modules/get-random-int.js";

const botID = "pirateflags";
const flagUrlBase = "https://stefans-creative-bots.glitch.me";

const makeFlag = async () => {
  try {
    const url = "https://static.stefanbohacek.dev/pirate-flags/";
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);

    console.log("making a new pirate flag...");

    process.on("unhandledRejection", (reason, p) => {
      console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
      browser.close();
    });

    page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    );

    page.on("load", async (response) => {
      await page.waitForSelector("img.mw-100", { timeout: 120000 });
      await page.waitForTimeout(5000);

      try {
        await page.screenshot({ path: `temp/pirate-flag.jpg` });
      } catch (err) {
        console.log(`Error: ${err.message}`);
      } finally {
        await browser.close();
      }
    });

    await page.setViewport({ width: 1030, height: 760 });
    await page.goto(url, {
      // waitUntil: "networkidle0",
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
  } catch (error) {
    console.log("@pirateflags error", error);
  }
};

const waveFlag = async () => {
  try {
    const url = `https://static.stefanbohacek.dev/pirate-flags/flag.html?img=${flagUrlBase}/images/pirate-flag.jpg`;
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);

    console.log("waving the pirate flag...");

    process.on("unhandledRejection", (reason, p) => {
      console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
      browser.close();
    });

    page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    );

    page.on("load", async (response) => {
      await page.waitForSelector("#renderArea", { timeout: 120000 });
      await page.waitForTimeout(15000);

      const pirateTalk = randomFromArray([
        `A${"a".repeat(getRandomInt(1, 7))}${"r".repeat(
          getRandomInt(1, 7)
        )}${"g".repeat(getRandomInt(1, 7))}${"h".repeat(
          getRandomInt(1, 7)
        )}!`,
        "Ahoy!",
        "Ahoy, matey!",
        "All hands on deck!",
        "Avast ye!",
      ]);

      let description = `A randomly generated pirate flag. Elements of the flag include skeletons, skulls, pirates, crossed bones, hourglasses, hearts, and swords.`;

      try {
        const screenshotPath = __dirname + `/../../temp/${botID}.jpg`;
        await page.screenshot({ path: screenshotPath });

        const mastodon = new mastodonClient({
          access_token: process.env.PIRATE_FLAGS_ACCESS_TOKEN_SECRET,
          api_url: process.env.PIRATE_FLAGS_API,
        });

        mastodon.postImage({
          status: `${pirateTalk}\n\n#pirates #flags`,
          image: screenshotPath,
          alt_text: description,
        });
      } catch (err) {
        console.log(`Error: ${err.message}`);
      } finally {
        await browser.close();
      }

      console.log(description);
    });

    await page.setViewport({ width: 1024, height: 700 });
    await page.goto(url, {
      // waitUntil: "networkidle0",
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
  } catch (error) {
    console.log("@pirateflags error", error);
  }
};

const botScript = async () => {
  await (async () => {
    await makeFlag();
    await waveFlag();
  })();
};

export default botScript;
