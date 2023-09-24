const fs = require("fs"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  puppeteer = require("puppeteer"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js");

const findTicket = async (page) => {
  let link;

  try {
    let url, pageNumber, maxPageNumber;
    // let url = `https://www.gbticket.com/busca.php?ordem=&pag=${pageNumber}&buscar=&onde=&recente=`;

    if (helpers.getRandomInt(1, 2) === 1){
        maxPageNumber = 64;
        pageNumber = helpers.getRandomInt(1, maxPageNumber);
        url = `https://www.gbticket.com/categoria_produto.php?codcategoriaproduto=115&ordem=&pag=${pageNumber}`;
      } else {
        maxPageNumber = 269;
        pageNumber = helpers.getRandomInt(1, maxPageNumber);
        url = `https://www.gbticket.com/categoria_produto.php?codcategoriaproduto=2&ordem=&pag=${pageNumber}`;
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
    const ticket = helpers.randomFromArray(tickets);

    link = await page.evaluate(ticket => ticket.getAttribute('href'), ticket);
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
    const ticket = await page.evaluate(ticketElement => ticketElement.getAttribute('src'), ticketElement);
    const name = await page.evaluate(ticketElement => ticketElement.getAttribute('title'), ticketElement);

    const descriptionElement = await page.$(".dados");
    const description = await page.evaluate(descriptionElement => descriptionElement.innerText, descriptionElement);

    return {ticket, name, description};

  } catch (error) {
    console.log("@tickets:getTicket error:", error);
  }
};

const botScript = async () => {
  (async () => {
    const mastodon = new mastodonClient({
      access_token: process.env.TICKETS_BOT_ACCESS_TOKEN_SECRET,
      api_url: process.env.TICKETS_BOT_API,
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

    const imgPath = __dirname + "/../.data/tickets.jpg"

    helpers.downloadImage(ticket.ticket, imgPath, async () => {
      const status = `${ticket.name}\n${ticket.description}\nVia ${link} #trains #tickets #transit #travel`;

      const imgData = await fs.readFileSync(imgPath, {
        encoding: "base64",
      });

/*
      link
      ticket.ticket: 'https://www.gbticket.com/imgs/produtos/20130606055946_Leeds 6533 (Copy).jpg',
      ticket.name: 'Platform Ticket, LNE & LMS Rlys, Leeds (City), 1d, Serial No C 6533 ',
      ticket.description: 'Undated, Condition of ticket: good, undamaged\n' +
*/    

      mastodon.postImage({
        status,
        image: imgData,
        alt_text: `Picture of a train ticket from attached website.`,
      });
    });    

    await browser.close();
  })();
};

module.exports = {
  active: true,
  name: "@tickets",
  description: "All aboard!",
  // thumbnail:
  //   "https://botwiki.org/wp-content/uploads/2023/07/-exoplanets-1688591006.png",
  // about_url: "https://botwiki.org/bot/exoplanets/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@tickets",
    },
  ],
  interval: cronSchedules.EVERY_THREE_HOURS,
  script: botScript,
};
