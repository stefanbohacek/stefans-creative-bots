const fs = require("fs"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  puppeteer = require("puppeteer"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js");

const mastodon = new mastodonClient({
  access_token: process.env.PIRATE_FLAGS_ACCESS_TOKEN_SECRET,
  api_url: process.env.PIRATE_FLAGS_API,
});

const makeFlag = async () => {
  try {
    const url = `https://static.stefanbohacek.dev/pirate-flags/`;
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
        await page.screenshot({ path: `.data/pirate-flag.jpg` });
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
    const url = `https://static.stefanbohacek.dev/pirate-flags/flag.html?img=https://stefans-creative-bots.glitch.me/images/pirate-flag.jpg`;
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
      await page.waitForTimeout(5000);

      const pirateTalk = helpers.randomFromArray([
        `A${"a".repeat(helpers.getRandomInt(1, 7))}${"r".repeat(
          helpers.getRandomInt(1, 7)
        )}${"g".repeat(helpers.getRandomInt(1, 7))}${"h".repeat(
          helpers.getRandomInt(1, 7)
        )}!`,
        "Ahoy!",
        "Ahoy, matey!",
        "All hands on deck!",
        "Avast ye!",
      ]);

      let description = `A randomly generated pirate flag. Elements of the flag include skeletons, skulls, pirates, crossed bones, hourglasses, hearts, and swords.`;

      try {
        await page.screenshot({ path: `.data/pirate-flag-wave.jpg` });

        let screenshot = await page
          .screenshot({ encoding: "base64" })
          .then(function (data) {
            let base64Encode = `data:image/png;base64,${data}`;
            mastodon.postImage({
              status: `${pirateTalk}\n\n#pirates #flags`,
              image: data,
              alt_text: description,
            });
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

module.exports = {
  active: true,
  name: "@pirateflags",
  description: "Arrgh!",
  thumbnail:
    "https://botwiki.org/wp-content/uploads/2023/07/pirate-flags-1690400779.png",
  about_url: "https://botwiki.org/bot/pirate-flags/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@pirateflags",
    },
  ],
  interval: cronSchedules.EVERY_THREE_HOURS_5,
  script: async () => {
    (async () => {
      await makeFlag();
      await waveFlag();
    })();
  },
};
