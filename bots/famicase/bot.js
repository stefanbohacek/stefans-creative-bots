import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";
import getUserAgent from "./../../modules/getSCBUserAgent.js";
import getRandomInt from "./../../modules/getRandomInt.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import downloadFileAsBase64 from "./../../modules/downloadFileAsBase64.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import isTextJapanese from "./../../modules/isTextJapanese.js";
import sleep from "./../../modules/sleep.js";

const { botID } = getBotInfo(import.meta.url);

const getGameInfo = async (page, year) => {
  console.log(`@${botID}:getGameInfo: waiting for selector`);
  try {
    await page.waitForSelector("#window, #wrapper, table", { timeout: 15000 });
  } catch (err) {
    console.log(
      `@${botID}:getGameInfo: selector not found, unsupported layout`,
    );
    return null;
  }
  console.log(`@${botID}:getGameInfo: selector found`);
  const game = await page.evaluate((year) => {
    const windowDiv = document.querySelector("#window");

    if (windowDiv) {
      const cartridgeImage =
        windowDiv.querySelector("img:not(.img-logo)")?.src ?? null;
      const title =
        windowDiv.querySelector(".right h3")?.textContent.trim() ?? null;
      const author =
        windowDiv.querySelector(".right h4")?.textContent.trim() ?? null;
      const rawDescription =
        windowDiv.querySelector(".right p.ss, .right p.small")?.textContent ??
        null;
      const description = rawDescription
        ? rawDescription.replace(/\s+/g, " ").trim()
        : null;
      return { title, year, author, description, cartridgeImage };
    }

    const wrapper = document.querySelector("#wrapper");

    if (wrapper) {
      const cartridgeImage = wrapper.querySelector(":scope > img")?.src ?? null;
      const title = wrapper.querySelector("h3")?.textContent.trim() ?? null;
      const author = wrapper.querySelector("h4")?.textContent.trim() ?? null;
      const rawDescription =
        wrapper.querySelector("#text")?.textContent ?? null;
      const description = rawDescription
        ? rawDescription.replace(/\s+/g, " ").trim()
        : null;
      return { title, year, author, description, cartridgeImage };
    }

    const table = document.querySelector("table");

    if (table) {
      const imgs = table.querySelectorAll("img");
      const cartridgeImage = imgs[0]?.src ?? null;
      const strongEl = table.querySelector("span.style2 strong");
      let title = null;
      let author = null;

      if (strongEl) {
        const parts = [];
        let current = "";
        for (const node of Array.from(strongEl.childNodes)) {
          if (node.nodeName === "BR") {
            parts.push(current.trim());
            current = "";
          } else if (node.nodeName !== "A") {
            current += node.textContent;
          }
        }
        parts.push(current.trim());
        title = parts[0] || null;
        author = parts[1] || null;
      }

      const spans = table.querySelectorAll("span.style2");
      const rawDescription =
        spans[1]?.textContent ??
        table.querySelector("td.style2")?.textContent ??
        null;
      const description = rawDescription
        ? rawDescription.replace(/\s+/g, " ").trim()
        : null;
      return { title, year, author, description, cartridgeImage };
    }

    return null;
  }, year);

  if (!game) {
    console.log(`@${botID}:getGameInfo: no game found`);
    return null;
  }

  return game;
};

const FIRST_YEAR = 8;
const LAST_YEAR = 26;
const IGNORED_GAMES = ["famicase.com/08/softs/39"];

const findGame = async (
  page,
  year = getRandomInt(FIRST_YEAR, LAST_YEAR),
  retries = 3,
) => {
  try {
    const yearPadded = year.toString().padStart(2, "0");
    const url = `https://famicase.com/${yearPadded}/`;

    console.log(`@${botID}:findGame`, { url });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    await page.waitForSelector("a[rel='famicase'], a.thickbox", {
      timeout: 120000,
    });

    const cartridgeLinks = await page.evaluate(() => {
      const famicase = Array.from(
        document.querySelectorAll("a[rel='famicase']"),
      ).map((a) => a.href);

      const thickbox = Array.from(
        document.querySelectorAll("a.thickbox[href]"),
      ).map((a) => a.href);

      return famicase.length > 0 ? famicase : thickbox;
    });

    const filteredLinks = cartridgeLinks.filter(
      (url) => !IGNORED_GAMES.some((blocked) => url.includes(blocked)),
    );

    if (filteredLinks.length === 0) {
      console.log(`@${botID}:findGame: no cartridge links found`);
      return null;
    }

    const cartridgeUrl = randomFromArray(filteredLinks);

    console.log(`@${botID}:findGame`, { cartridgeUrl });

    await page.goto(cartridgeUrl, {
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    console.log(`@${botID}:findGame: cartridge page loaded`);

    const game = await getGameInfo(page, yearPadded);

    if (!game) {
      if (retries > 0) {
        console.log(`@${botID}:findGame: retrying (${retries} left)`);
        await sleep(3000);
        return findGame(page, getRandomInt(FIRST_YEAR, LAST_YEAR), retries - 1);
      }
      return null;
    }

    return { ...game, url: cartridgeUrl };
  } catch (err) {
    console.log(`@${botID}:findGame error:`, err);
  }
};

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.FAMICASE_BOT_MASTODON_ACCESS_TOKEN,
    // access_token: process.env.MASTODON_TEST_TOKEN,
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

  await page.setUserAgent(getUserAgent());
  await page.setDefaultNavigationTimeout(120000);

  // const game = await findGame(page, 24);
  // const game = await findGame(page, 8);
  const game = await findGame(page);

  if (!game) {
    console.log(`@${botID}: no game found`);
    await browser.disconnect();
    return;
  }

  console.log(`@${botID}: found game`, { game });

  const imgData = await downloadFileAsBase64(game.cartridgeImage);
  const language = isTextJapanese(game.description) ? "ja" : "en";

  const status = [
    `${game.title} by ${game.author}`,
    game.description,
    game.url,
    "#famicase #art #exhibition #games #videogames #design",
  ].join("\n\n");

  await mastodon.postImage({
    status,
    image: imgData,
    alt_text: "Game cartridge from the linked website.",
    language,
  });

  await browser.disconnect();
};

export default botScript;
