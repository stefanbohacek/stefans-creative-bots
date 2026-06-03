import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";

import getRandomInt from "./../../modules/getRandomInt.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import downloadFileAsBase64 from "./../../modules/downloadFileAsBase64.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import sleep from "./../../modules/sleep.js";

const { botID } = getBotInfo(import.meta.url);

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
      if (!tbody) { return []; }
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
  await (async () => {

    const mastodon = new mastodonClient({
      // access_token: process.env.MASTODON_TEST_TOKEN,
      access_token: process.env.GALAXY_VIEWS_BOT_MASTODON_ACCESS_TOKEN,
      api_url: process.env.MASTODON_API_URL,
    });

    // const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const browser = await puppeteer.connect({
      browserWSEndpoint: process.env.BROWSERLESS_URL
    });
    

    try {
      const page = await browser.newPage();
      page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
      );

      await page.setDefaultNavigationTimeout(120000);

      let galaxies;
      for (let i = 1; i <= 5; i++) {
        galaxies = await findGalaxy(page);
        if (galaxies && galaxies.length) {
          break;
        }
        console.log(`@${botID}: no galaxies found, retrying (${i}/5)...`);
        await sleep(i * 1000);
      }

      if (!galaxies || !galaxies.length) {
        console.log(`@${botID}: no galaxies found after 5 retries`);
        return;
      }

      // console.log({ galaxies });
      const galaxy = randomFromArray(galaxies);
      const imgData = await downloadFileAsBase64(galaxy.image);
      const status = `${galaxy.group_name}: ${galaxy.url}\n\n#space #astronomy #galaxy`;

      await mastodon.postImage({
        status,
        image: imgData,
        alt_text: "Color mosaics showing the data (left panel), model (middle panel), and residuals (right panel).",
      });
    } catch (err) {
      console.error(`@${botID} error:`, err);
      throw err;
    } finally {
      await browser.disconnect();
    }
  })();
};

export default botScript;
