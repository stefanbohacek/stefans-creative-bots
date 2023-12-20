import fs from "fs";
import puppeteer from "puppeteer";
import csv from "csvtojson";
import mastodonClient from "./../../modules/mastodon/index.js";

import downloadFile from "./../../modules/download-file.js";
import getRandomInt from "./../../modules/get-random-int.js";
import randomFromArray from "./../../modules/random-from-array.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "tickets";

const findTicket = async (page) => {
  let link;

  try {
    let url, pageNumber, maxPageNumber;
    // let url = `https://www.gbticket.com/busca.php?ordem=&pag=${pageNumber}&buscar=&onde=&recente=`;

    if (getRandomInt(1, 4) === 1) {
      // UK tickets
      maxPageNumber = 269;
      pageNumber = getRandomInt(1, maxPageNumber);
      url = `https://www.gbticket.com/categoria_produto.php?codcategoriaproduto=2&ordem=&pag=${pageNumber}`;
    } else {
      // non-UK tickets
      maxPageNumber = 64;
      pageNumber = getRandomInt(1, maxPageNumber);
      url = `https://www.gbticket.com/categoria_produto.php?codcategoriaproduto=115&ordem=&pag=${pageNumber}`;
    }

    console.log("searching for tickets...", {
      url,
    });

    await page.goto(url, {
      // waitUntil: "networkidle0",
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });
    await page.waitForSelector(".imgProm", { timeout: 120000 });
    await page.waitForTimeout(10000);

    const tickets = await page.$$(".imgProm a");
    const ticket = randomFromArray(tickets);

    link = await page.evaluate((ticket) => ticket.getAttribute("href"), ticket);
    return link;
  } catch (error) {
    console.log("@tickets:findTicket error:", error);
  }
};

const getTicket = async (page, url) => {
  try {
    console.log("getting a ticket...", {
      url,
    });

    await page.goto(url, {
      // waitUntil: "networkidle0",
      waitUntil: "domcontentloaded",
      timeout: 120000,
    });

    await page.waitForSelector(".imgProm", { timeout: 120000 });
    await page.waitForTimeout(10000);

    const ticketElement = await page.$(".foto-maior img");
    const ticket = await page.evaluate(
      (ticketElement) => ticketElement.getAttribute("src"),
      ticketElement
    );
    const name = await page.evaluate(
      (ticketElement) => ticketElement.getAttribute("title"),
      ticketElement
    );

    const descriptionElement = await page.$(".dados");
    const description = await page.evaluate(
      (descriptionElement) => descriptionElement.innerText,
      descriptionElement
    );

    return { ticket, name, description };
  } catch (error) {
    console.log("@tickets:getTicket error:", error);
  }
};

const botScript = async () => {
  (async () => {
    const mastodon = new mastodonClient({
      access_token: process.env.TICKETS_BOT_ACCESS_TOKEN_SECRET,
      api_url: process.env.BOTSINSPACE_API_URL,
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

    const link = await findTicket(page);
    const ticket = await getTicket(page, link);

    console.log({ link, ticket });

    const imgPath = `${__dirname}/../../temp/${botID}.jpg`;

    await downloadFile(ticket.ticket, imgPath);
    const status = `${ticket.name}\n${ticket.description}\nVia ${link} #trains #tickets #transit #travel`;

    const imgData = await fs.readFileSync(imgPath, {
      encoding: "base64",
    });

    mastodon.postImage({
      status,
      image: imgData,
      alt_text: `Picture of a public transportation ticket from attached website, usually for a train or bus.`,
    });

    await browser.close();
  })();
};

export default botScript;
