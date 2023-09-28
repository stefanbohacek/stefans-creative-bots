import fs from "fs";
import cheerio from "cheerio";
import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getItems = (html, section) => {
  let items = [];
  let $ = cheerio.load(html, {
    normalizeWhitespace: true,
  });

  $("h2")
    .filter(function () {
      return $(this).text().trim() === section;
    })
    .next()
    .find("> div")
    .each(function (i, elem) {
      const arr = $(this)
        .text()
        .split(/([a-zA-Z]{3}-[0-9]+)/);
      items.push({
        id: arr[1],
        label: arr[2],
      });
    });

  return items;
};

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.MASTODON_ROADMAP_BOT_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_ROADMAP_BOT_API,
      });

      const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(120000);

      process.on("unhandledRejection", (reason, p) => {
        console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
        browser.close();
      });

      page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
      );
      page.on("load", async (response) => {
        let html = await page.evaluate(() => document.body.innerHTML);
        const inProgressCurrent = getItems(html, "In Progress");
        const plannedCurrent = getItems(html, "Planned");
        const exploringCurrent = getItems(html, "Exploring");
        const recentlyCompletedCurrent = getItems(html, "Recently completed");

        console.log("checking Mastodon roadmap...");

        console.log(
          `found ${inProgressCurrent.length} item(s) under "in-progress"`
        );
        console.log(`found ${plannedCurrent.length} item(s) under "planned"`);
        console.log(
          `found ${exploringCurrent.length} item(s) under "exploring"`
        );
        console.log(
          `found ${recentlyCompletedCurrent.length} item(s) under "recently completed"`
        );

        const dataPath = `${__dirname}/../../data/mastodon-roadmap`;

        let inProgressSaved = [],
          plannedSaved = [],
          exploringSaved = [],
          recentlyCompletedSaved = [];
        let inProgressNew = [],
          plannedNew = [],
          exploringNew = [],
          recentlyCompletedNew = [];

        if (!fs.existsSync(dataPath)) {
          fs.mkdirSync(dataPath);
          inProgressSaved = inProgressCurrent;
          plannedSaved = plannedCurrent;
          exploringSaved = exploringCurrent;
          recentlyCompletedSaved = recentlyCompletedCurrent;
        } else {
          inProgressSaved = JSON.parse(
            fs.readFileSync(`${dataPath}/inProgress.json`, "utf8")
          );
          plannedSaved = JSON.parse(
            fs.readFileSync(`${dataPath}/planned.json`, "utf8")
          );
          exploringSaved = JSON.parse(
            fs.readFileSync(`${dataPath}/exploring.json`, "utf8")
          );
          recentlyCompletedSaved = JSON.parse(
            fs.readFileSync(`${dataPath}/recentlyCompleted.json`, "utf8")
          );

          const inProgressIDs = inProgressSaved.map((item) => item.id);
          const plannedIDs = plannedSaved.map((item) => item.id);
          const exploringIDs = exploringSaved.map((item) => item.id);
          const recentlyCompletedIDs = recentlyCompletedSaved.map(
            (item) => item.id
          );

          inProgressNew = inProgressCurrent.filter(
            (item) => !inProgressIDs.includes(item.id)
          );
          plannedNew = plannedCurrent.filter(
            (item) => !plannedIDs.includes(item.id)
          );
          exploringNew = exploringCurrent.filter(
            (item) => !exploringIDs.includes(item.id)
          );
          recentlyCompletedNew = exploringCurrent.filter(
            (item) => !recentlyCompletedIDs.includes(item.id)
          );

          console.log("checking new items...");

          console.log(
            `found ${inProgressNew.length} item(s) under "in-progress"`,
            inProgressNew
          );
          console.log(
            `found ${plannedNew.length} item(s) under "planned"`,
            plannedNew
          );
          console.log(
            `found ${exploringNew.length} item(s) under "exploring"`,
            exploringNew
          );
          console.log(
            `found ${recentlyCompletedNew.length} item(s) under "recently completed"`,
            recentlyCompletedNew
          );

          let text = "";

          if (inProgressNew.length) {
            text += `
              In progress:\n\n${inProgressNew
                .map((item) => `- ${item.id}: ${item.label}`)
                .join("\n")}
              `;
          }

          if (plannedNew.length) {
            text += `\nPlanned:\n\n${plannedNew
              .map((item) => `- ${item.id}: ${item.label}`)
              .join("\n")}
              `;
          }

          if (exploringNew.length) {
            text += `\nExploring:\n\n${exploringNew
              .map((item) => `- ${item.id}: ${item.label}`)
              .join("\n")}
              `;
          }

          if (recentlyCompletedNew.length) {
            text += `\nRecently completed:\n\n${recentlyCompletedNew
              .map((item) => `- ${item.id}: ${item.label}`)
              .join("\n")}
              `;
          }
          mastodon.post({
            status: `${text}\n\n#mastodon #roadmap`,
          });
        }

        fs.writeFileSync(
          `${dataPath}/inProgress.json`,
          JSON.stringify(inProgressSaved.concat(inProgressNew)),
          "utf8",
          (error) => {
            console.log(error);
          }
        );

        fs.writeFileSync(
          `${dataPath}/planned.json`,
          JSON.stringify(plannedSaved.concat(plannedNew)),
          "utf8",
          (error) => {
            console.log(error);
          }
        );

        fs.writeFileSync(
          `${dataPath}/exploring.json`,
          JSON.stringify(exploringSaved.concat(exploringNew)),
          "utf8",
          (error) => {
            console.log(error);
          }
        );

        fs.writeFileSync(
          `${dataPath}/recentlyCompleted.json`,
          JSON.stringify(recentlyCompletedSaved.concat(recentlyCompletedNew)),
          "utf8",
          (error) => {
            console.log(error);
          }
        );
      });

      try {
        await page.goto("https://joinmastodon.org/roadmap", {
          waitUntil: "networkidle0",
        });
      } catch (error) {
        console.log(error);
        browser.close();
      }

      await browser.close();
    } catch (error) {
      console.log("mastodon roadmap error", error);
    }
  })();
};

export default botScript;
