import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";
import getUserAgent from "./../../modules/getSCBUserAgent.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import sleep from "./../../modules/sleep.js";
import createFighterSelectScreen from "./../../modules/generators/fighterSelectScreen.js";
import { base64 as downloadFileAsBase64 } from "./../../modules/fetch.js";
import truncate from "./../../modules/truncate.js";

const { botID } = getBotInfo(import.meta.url);
const BASE_URL = "https://www.fightersgeneration.com";

const getCharacterList = async (page) => {
  console.log(`@${botID}:getCharacterList: loading character list`);

  await page.goto(`${BASE_URL}/characters.html`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  const characters = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a[href]"));
    const characterPattern = /^characters\d*\//;
    const seen = new Set();
    const result = [];

    for (const a of links) {
      const href = a.getAttribute("href");
      const url = a.href;
      const name = a.textContent.trim().replace(/\s+/g, " ");
      if (characterPattern.test(href) && name.length > 0 && !seen.has(url)) {
        seen.add(url);
        result.push({ name, url });
      }
    }

    return result;
  });

  console.log(
    `@${botID}:getCharacterList: found ${characters.length.toLocaleString()} characters`,
  );

  return characters;
};

const getCharacterInfo = async (page, character, retries = 3) => {
  console.log(
    `@${botID}:getCharacterInfo: loading ${character.name} (${character.url})`,
  );

  try {
    await page.goto(character.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const info = await page.evaluate((name) => {
      let origin = null;
      const pElements = document.querySelectorAll("p");
      for (const p of pElements) {
        const text = p.textContent.toLowerCase().replace(/\s+/g, " ");
        if (text.includes("origin:") || text.includes("featured appearance:")) {
          const link = p.querySelector("a") || p.parentElement?.querySelector("a");
          if (link) {
            origin = link.textContent.trim().replace(/\s+/g, " ");
            break;
          }
        }
      }

      const lower = name.toLowerCase();
      const words = lower.split(/\s+/);
      const slugs = [
        ...new Set([lower, words.join("-"), words.join(""), ...words]),
      ];

      const urlContainsSlug = (url) => {
        const filename = url.split("/").pop().toLowerCase();
        return slugs.some((slug) => filename.includes(slug));
      };

      const images = Array.from(document.querySelectorAll("img"));
      const candidates = [];
      const seen = new Set();

      for (const img of images) {
        const link = img.closest("a");
        if (link && urlContainsSlug(link.href) && !seen.has(link.href)) {
          seen.add(link.href);
          candidates.push(link.href);
        }
      }

      return { origin, candidates };
    }, character.name);

    if (info.candidates.length === 0) {
      console.log(
        `@${botID}:getCharacterInfo: no image found for ${character.name}`,
      );
      return null;
    }

    const imageUrl = randomFromArray(info.candidates);

    return {
      name: character.name,
      origin: info.origin || "Unknown",
      imageUrl,
      url: character.url,
      candidates: info.candidates,
    };
  } catch (err) {
    console.log(`@${botID}:getCharacterInfo error:`, err.message);
    if (retries > 0) {
      await sleep(2000);
      return getCharacterInfo(page, character, retries - 1);
    }
    return null;
  }
};

const pickFighterTest = async (page, name, url) => {
  return getCharacterInfo(page, { name, url });
};

const pickFighter = async (page, characters, exclude = null) => {
  let retries = 5;
  while (retries > 0) {
    const available = exclude
      ? characters.filter((c) => c.url !== exclude.url)
      : characters;
    const character = randomFromArray(available);
    const info = await getCharacterInfo(page, character);
    if (info) {
      return info;
    }
    retries--;
  }
  return null;
};

const downloadImage = async (fighter) => {
  const urls = [
    fighter.imageUrl,
    ...fighter.candidates.filter((c) => c !== fighter.imageUrl),
  ];
  for (const url of urls) {
    try {
      return await downloadFileAsBase64(url);
    } catch (err) {
      console.log(
        `@${botID}: download failed for ${url}, trying next candidate`,
      );
    }
  }
  throw new Error(`Unable to download images for ${fighter.name}`);
};

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.CHOOSE_YOUR_FIGHTER_BOT_ACCESS_TOKEN_SECRET,
    // access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.BROWSERLESS_URL,
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(getUserAgent());
    await page.setDefaultNavigationTimeout(60000);

    const characters = await getCharacterList(page);

    if (characters.length < 2) {
      console.log(`@${botID}: not enough characters found`);
      return;
    }

    const fighter1 = await pickFighter(page, characters);
    // const fighter1 = await pickFighterTest(page, "Dark Kahn", "https://www.fightersgeneration.com/characters4/darkkahn.html");

    if (!fighter1) {
      console.log(`@${botID}: could not find fighter 1`);
      return;
    }

    const fighter2 = await pickFighter(page, characters, fighter1);
    // const fighter2 = await pickFighterTest(page, "Dr. Fate", "https://www.fightersgeneration.com/characters5/dr-fate.html");

    if (!fighter2) {
      console.log(`@${botID}: could not find fighter 2`);
      return;
    }

    console.log(`@${botID}: fighters selected`, {
      fighter1: fighter1.name,
      fighter2: fighter2.name,
    });

    const [img1b64, img2b64] = await Promise.all([
      downloadImage(fighter1),
      downloadImage(fighter2),
    ]);
    const img1Buffer = Buffer.from(img1b64, "base64");
    const img2Buffer = Buffer.from(img2b64, "base64");

    const compositeImage = await createFighterSelectScreen({
      fighter1: img1Buffer,
      fighter2: img2Buffer,
    });

    const status = [
      "CHOOSE YOUR FIGHTER!",
      `${fighter1.name} (${fighter1.origin})\n${fighter1.url}`,
      `vs.`,
      `${fighter2.name} (${fighter2.origin})\n${fighter2.url}`,
      "#ChooseYourFighter #videogames #FightingGames #poll",
    ].join("\n\n");

    const altText = `Two fighting videogame characters side by side: ${fighter1.name} from ${fighter1.origin} on the left and ${fighter2.name} from ${fighter2.origin} on the right.`;

    const mediaId = await mastodon.uploadMedia({
      image: compositeImage,
      alt_text: altText,
    });

    await mastodon.postPoll(
      status,
      [
        truncate(`${fighter1.name} (${fighter1.origin})`, 50),
        truncate(`${fighter2.name} (${fighter2.origin})`, 50),
      ],
      { media_ids: [mediaId] },
    );
  } catch (err) {
    console.error(`@${botID} error:`, err);
    throw err;
  } finally {
    await browser.disconnect();
  }
};

export default botScript;
