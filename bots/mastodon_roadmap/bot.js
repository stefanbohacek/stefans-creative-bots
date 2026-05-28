import cheerio from "cheerio";
import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";
import db from "./../../modules/db.js";

const getItems = (html, statusLabel) => {
  let items = [];
  let $ = cheerio.load(html, {
    normalizeWhitespace: true,
  });

  $("section.px-3.py-5").each(function () {
    const statusSpan = $(this).find("span.px-3").first();
    const statusText = statusSpan.text().trim();

    if (statusText === statusLabel) {
      const title = $(this).find("h2.font-bold.text-b1").text().trim();
      const description = $(this).find("div.body-text p").first().text().trim();

      if (title) {
        items.push({
          id: title.toLowerCase().replace(/\s+/g, "-"),
          label: title,
          description: description,
        });
      }
    }
  });

  return items;
};

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.MASTODON_ROADMAP_BOT_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      const browser = await puppeteer.connect({
        browserWSEndpoint: process.env.BROWSERLESS_URL,
      });

      process.on("unhandledRejection", (reason, p) => {
        console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
        browser.disconnect();
      });

      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(120000);

      page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
      );

      page.on("load", async (response) => {
        let html = await page.evaluate(() => document.body.innerHTML);

        const releasedCurrent = getItems(html, "Released");
        const nextReleaseCurrent = getItems(html, "Next release");
        const exploringCurrent = getItems(html, "Exploring");

        console.log("checking Mastodon roadmap...");

        console.log(`found ${releasedCurrent.length} item(s) under "Released"`);
        console.log(
          `found ${nextReleaseCurrent.length} item(s) under "Next release"`,
        );
        console.log(
          `found ${exploringCurrent.length} item(s) under "Exploring"`,
        );

        const [savedRows] = await db.execute(
          /* sql */ `SELECT item_id, category FROM mastodon_roadmap_items`,
        );

        const savedIDs = {
          released: savedRows
            .filter((r) => r.category === "released")
            .map((r) => r.item_id),
          nextRelease: savedRows
            .filter((r) => r.category === "nextRelease")
            .map((r) => r.item_id),
          exploring: savedRows
            .filter((r) => r.category === "exploring")
            .map((r) => r.item_id),
        };

        const releasedNew = releasedCurrent.filter(
          (item) => !savedIDs.released.includes(item.id),
        );
        const nextReleaseNew = nextReleaseCurrent.filter(
          (item) => !savedIDs.nextRelease.includes(item.id),
        );
        const exploringNew = exploringCurrent.filter(
          (item) => !savedIDs.exploring.includes(item.id),
        );

        console.log("checking new items...");

        console.log(
          `found ${releasedNew.length} item(s) under "Released"`,
          releasedNew,
        );
        console.log(
          `found ${nextReleaseNew.length} item(s) under "Next release"`,
          nextReleaseNew,
        );
        console.log(
          `found ${exploringNew.length} item(s) under "Exploring"`,
          exploringNew,
        );

        let text = "";

        if (releasedNew.length) {
          text += `Released:\n\n${releasedNew
            .map((item) => `- ${item.label}: ${item.description}`)
            .join("\n")}`;
        }

        if (nextReleaseNew.length) {
          text += `\n\nNext release:\n\n${nextReleaseNew
            .map((item) => `- ${item.label}: ${item.description}`)
            .join("\n")}`;
        }

        if (exploringNew.length) {
          text += `\n\nExploring:\n\n${exploringNew
            .map((item) => `- ${item.label}: ${item.description}`)
            .join("\n")}`;
        }

        console.log(text);

        if (text && text.length) {
          mastodon.post({
            status: `${text}\n\n#mastodon #roadmap`,
          });
        }

        const newItems = [
          ...releasedNew.map((item) => ({ ...item, category: "released" })),
          ...nextReleaseNew.map((item) => ({
            ...item,
            category: "nextRelease",
          })),
          ...exploringNew.map((item) => ({ ...item, category: "exploring" })),
        ];

        for (const item of newItems) {
          await db.execute(
            /* sql */ `INSERT IGNORE INTO mastodon_roadmap_items (item_id, category, label, description) VALUES (?, ?, ?, ?)`,
            [item.id, item.category, item.label, item.description || ""],
          );
        }
      });

      try {
        await page.goto("https://joinmastodon.org/roadmap", {
          waitUntil: "networkidle0",
        });
      } catch (error) {
        console.log(error);
        browser.disconnect();
      }

      await browser.disconnect();
    } catch (error) {
      console.log("mastodon roadmap error", error);
    }
  })();
};

export default botScript;
