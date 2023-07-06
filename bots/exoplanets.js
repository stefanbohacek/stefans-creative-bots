const fs = require("fs"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  puppeteer = require("puppeteer"),
  csv = require("csvtojson"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js");

const mastodon = new mastodonClient({
  access_token: process.env.EXOPLANETS_ACCESS_TOKEN_SECRET,
  api_url: process.env.EXOPLANETS_API,
});

module.exports = {
  active: true,
  name: "@exoplanets",
  description: "Explore distant worlds.",
  thumbnail:
    "https://botwiki.org/wp-content/uploads/2023/07/-exoplanets-1688591006.png",
  about_url: "https://botwiki.org/bot/exoplanets/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@exoplanets",
    },
  ],
  interval: cronSchedules.EVERY_FOUR_HOURS,
  script: async () => {
    (async () => {
      csv()
        .fromFile(__dirname + "/../data/exoplanets.csv")
        .then(async (data) => {
          const randomPlanet = helpers.randomFromArray(data);
          const planetName = randomPlanet.pl_name;
          const planetNameSlug = planetName.replace(/ /g, "_");

          const url = `https://eyes.nasa.gov/apps/exo/#/planet/${planetNameSlug}`;
          const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
          const page = await browser.newPage();

          console.log("loading exoplanet data...", {
            url,
          });

          process.on("unhandledRejection", (reason, p) => {
            console.error(
              "Unhandled Rejection at: Promise",
              p,
              "reason:",
              reason
            );
            browser.close();
          });

          page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
          );

          page.on("load", async (response) => {
            await page.waitForTimeout(100000);

            const html = await page.evaluate(() => document.body.innerHTML);
            let element;
            let planetDescription;
            let planetDistance;

            // const planetDescription = $('#entrySubtitleId').text();

            element = await page.$("#entrySubtitleId");

            if (element) {
              planetDescription = await page.evaluate(
                (el) => el.textContent,
                element
              );
            }

            element = await page.$(".dynamicInfo");

            if (element) {
              planetDistance = await page.evaluate(
                (el) => el.textContent,
                element
              );
            }

            console.log({
              planetDescription,
              planetDistance,
            });

            let description = `Name: ${planetName}`;

            if (planetDescription) {
              description += `\n${planetDescription}.`;
            }

            if (planetDistance) {
              description += `\nDistance from Earth: ${planetDistance}`;
            }

            if (randomPlanet.disc_year) {
              description += `\nYear discovered: ${randomPlanet.disc_year}`;
            }

            if (randomPlanet.disc_facility) {
              description += `\nDiscovered by: ${randomPlanet.disc_facility}`;
            }

            if (randomPlanet.pl_rade) {
              description += `\nPlanet radius: ${randomPlanet.pl_rade} x Jupiter`;
            }

            if (randomPlanet.pl_bmasse) {
              description += `\nPlanet mass: ${randomPlanet.pl_bmasse} Jupiters`;
            }

            if (randomPlanet.pl_orbper) {
              description += `\nOrbital period: ${parseFloat(
                randomPlanet.pl_orbper
              ).toFixed(2)} day(s)`;
            }

            if (randomPlanet.pl_eqt) {
              description += `\nEquilibrium temperature: ${randomPlanet.pl_eqt}° K`;
            }

            await page.addStyleTag({ content: ".ui{display: none}" });

            try {
              await page.screenshot({ path: `.data/nasa-exoplanet.jpg` });

              let screenshot = await page
                .screenshot({ encoding: "base64" })
                .then(function (data) {
                  let base64Encode = `data:image/png;base64,${data}`;
                  mastodon.postImage({
                    status: `${description}\n\n${url}\n\n#space #exoplanets`,
                    image: data,
                    alt_text: `A computer-generated representation of the ${planetName} exoplanet.`,
                  });
                });
            } catch (err) {
              console.log(`Error: ${err.message}`);
            } finally {
              await browser.close();
            }

            console.log(description);
          });

          await page.setViewport({ width: 720, height: 720 });
          await page.goto(url, {
            // waitUntil: "networkidle0",
          });
        });
    })();
  },
};
