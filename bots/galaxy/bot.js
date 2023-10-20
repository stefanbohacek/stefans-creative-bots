import fs from "fs";
import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";

import downloadFile from "./../../modules/download-file.js";
import getRandomInt from "./../../modules/get-random-int.js";
import randomFromArray from "./../../modules/random-from-array.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "galaxy";

const findGalaxy = async (page) => {
  let link;

  try {
    const maxPageNumber = 7673;
    const pageNumber = getRandomInt(1, maxPageNumber);
    const url = `https://sga.legacysurvey.org/?page=${pageNumber}#results`;

    console.log("searching for galaxies...", {
      url,
    });

    await page.goto(url, {
      // waitUntil: "networkidle0",
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    await page.waitForSelector("td a img", { timeout: 120000 });
    // await page.waitForTimeout(10000);
    await page.waitForTimeout(3000);

    const content = await page.evaluate(() => {
      const tbody = document.querySelector("table.table tbody");
      const trs = Array.from(tbody.querySelectorAll("tr"));
      const content = [];

      for (const tr of trs) {
        const tds = Array.from(tr.querySelectorAll("td"));
        const data = tds.map((td) => {
          let value;

          if (td.innerHTML.includes("<img")) {
            value = td.querySelector("a").getAttribute("href");
          } else {
            value = td.innerText;
          }

          return value;
        });

        content.push({
          image: data[0],
          number: data[1],
          sga_id: data[2],
          group_name: data[3],
          galaxy: data[4],
          ra_degrees: data[5],
          dec_degrees: data[6],
          galaxy_diameter_arcmin: data[7],
          url: `https://sga.legacysurvey.org/group/${data[3]}`
        });
      }

      return content;
    });

    return content;
  } catch (error) {
    console.log("@galaxies:findGalaxy error:", error);
  }
};

const botScript = async () => {
  (async () => {

    const mastodon = new mastodonClient({
      access_token: process.env.GALAXY_VIEWS_BOT_MASTODON_ACCESS_TOKEN,
      api_url: process.env.GALAXY_VIEWS_BOT_MASTODON_API,
    });

    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });

    process.on("unhandledRejection", (reason, p) => {
      console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
      browser.close();
    });

    const page = await browser.newPage();
    page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    );

    await page.setDefaultNavigationTimeout(120000);

    const galaxies = await findGalaxy(page);
    // console.log({ galaxies });

    const galaxy = randomFromArray(galaxies);
    const imgPath = `${__dirname}/../../temp/${botID}.jpg`;

    await downloadFile(galaxy.image, imgPath);
    const status = `${galaxy.group_name}: ${galaxy.url}\n\n#space #astronomy #galaxy`;

    const imgData = await fs.readFileSync(imgPath, {
      encoding: "base64",
    });

    mastodon.postImage({
      status,
      image: imgData,
      alt_text: "Color mosaics showing the data (left panel), model (middle panel), and residuals (right panel).",
    });

    await browser.close();
  })();
};

export default botScript;
