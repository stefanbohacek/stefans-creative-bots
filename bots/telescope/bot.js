import fs from "fs";
import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const botID = "telescope";

const botScript = async () => {
  (async () => {
    const mastodon = new mastodonClient({
      access_token: process.env.TELESCOPE_BOT_MASTODON_ACCESS_TOKEN,
      // access_token: process.env.MASTODON_TEST_TOKEN,
      api_url: process.env.MASTODON_API_URL,
    });

    try {
      // const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
      const browser = await puppeteer.connect({
        browserWSEndpoint: process.env.BROWSERLESS_URL,
      });

      process.on("unhandledRejection", (reason, p) => {
        console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
        browser.close();
      });

      const page = await browser.newPage();
      page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
      );

      const telescopes = [
        {
          name: "Hubble",
          url: "https://spacetelescopelive.org/hubble?obsId=01KFQ3EM1TFYWMTKZDT3B0CTSY",
          selector: ".aladin-imageCanvas",
        },
        {
          name: "Webb",
          url: "https://spacetelescopelive.org/webb?obsId=01KG0HH0KBWM94V5W19MK3QTZR",
          selector: ".aladin-imageCanvas",
        },
      ];

      const telescope = randomFromArray(telescopes);

      await page.setDefaultNavigationTimeout(120000);

      await page.goto(telescope.url, {
        // waitUntil: "networkidle0",
        waitUntil: "domcontentloaded",
        timeout: 120000,
      });

      await page.waitForSelector(telescope.selector, { timeout: 120000 });

      const latestTargetBtn = await page.$(".button--view-latest");

      if (latestTargetBtn) {
        await latestTargetBtn.click();
      }

      await page.waitForTimeout(20000);

      const canvasData = await page.evaluate((selector) => {
        const canvas = document.querySelector(selector);
        if (!canvas) {
          return null;
        }
        return canvas.toDataURL("image/png");
      }, telescope.selector);

      if (canvasData) {
        const base64Data = canvasData.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        const imgPath = `${__dirname}/../../temp/${botID}.jpg`;
        fs.writeFileSync(imgPath, buffer);

        let status = `What is ${telescope.name} observing?`;

        // let element = await page.$(".telescope-header__desktop-target-info h2");
        // let value;

        // if (element) {
        //   value = await page.evaluate(
        //     (el) => el.textContent.replace("Target: ", "").trim(),
        //     element,
        //   );
        //   if (value) {
        //     status += `\nTarget: ${value}`;
        //   }
        // }

        // const programElements = await page.$$(
        //   ".telescope-header__desktop-program",
        // );

        // if (programElements[0]) {
        //   value = await page.evaluate(
        //     (el) => el.textContent,
        //     programElements[0],
        //   );
        //   if (value) {
        //     status += `\n${value}`;
        //   }
        // }

        // if (programElements[1]) {
        //   value = await page.evaluate(
        //     (el) => el.textContent,
        //     programElements[1],
        //   );
        //   if (value) {
        //     status += `\n${value}`;
        //   }
        // }

        status += `\n\n${telescope.url}\n\n #${telescope.name.toLowerCase()} #space #astronomy #telescope`;

        const imgData = await fs.readFileSync(imgPath, {
          encoding: "base64",
        });

        mastodon.postImage({
          status,
          image: imgData,
          alt_text:
            "A photo captured by a space telescope from the linked website, typically showing a wide image of distant galaxies with stars and interstellar gas.",
        });
      }

      await browser.close();
    } catch (error) {
      console.log("telescope:error", error);
    }
  })();
};

export default botScript;
