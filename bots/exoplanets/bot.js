import puppeteer from "puppeteer";
import csv from "csvtojson";
import mastodonClient from "./../../modules/mastodon/index.js";

import randomFromArray from "./../../modules/random-from-array.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "exoplanets";

const botScript = async () => {
 await (async () => {
    const mastodon = new mastodonClient({
      access_token: process.env.EXOPLANETS_ACCESS_TOKEN_SECRET,
      api_url: process.env.EXOPLANETS_API,
    });
    csv()
      .fromFile(__dirname + "/../../data/exoplanets.csv")
      .then(async (data) => {
        try {
          const randomPlanet = randomFromArray(data);
          const planetName = randomPlanet.pl_name;
          const planetNameSlug = planetName.replace(/ /g, "_");

          const url = `https://eyes.nasa.gov/apps/exo/#/planet/${planetNameSlug}`;
          const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
          const page = await browser.newPage();
          await page.setDefaultNavigationTimeout(120000);

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
            await page.waitForSelector("#entrySubtitleId", {
              timeout: 120000,
            });
            await page.waitForTimeout(10000);

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

            await page.waitForSelector(".dynamicInfo", { timeout: 120000 });
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
              description += `\nDistance from Earth: ${planetDistance.toLocaleString()}`;
            }

            if (randomPlanet.disc_year) {
              description += `\nYear discovered: ${randomPlanet.disc_year}`;
            }

            if (randomPlanet.disc_facility) {
              description += `\nDiscovered by: ${randomPlanet.disc_facility}`;
            }

            if (randomPlanet.pl_rade) {
              description += `\nPlanet radius: ${randomPlanet.pl_rade.toLocaleString()} x Earth`;
            }

            if (randomPlanet.pl_bmasse) {
              let planetMass;

              if (randomPlanet.pl_bmasse > 1) {
                planetMass = Math.round(randomPlanet.pl_bmasse);
              } else {
                planetMass = Math.round(randomPlanet.pl_bmasse * 100) / 100;
              }
              description += `\nPlanet mass: ${planetMass.toLocaleString()} Earths`;
            }

            if (randomPlanet.pl_orbper) {
              description += `\nOrbital period: ${parseFloat(
                randomPlanet.pl_orbper
              )
                .toFixed(2)
                .toLocaleString()} day(s)`;
            }

            if (randomPlanet.pl_eqt) {
              description += `\nEquilibrium temperature: ${randomPlanet.pl_eqt}° K`;
            }

            await page.addStyleTag({ content: ".ui{display: none}" });

            try {
              const screenshotPath = __dirname + `/../../temp/${botID}.jpg`;
              await page.screenshot({ path: screenshotPath });

              mastodon.postImage({
                status: `${description}\n\n${url}\n\n#space #exoplanets`,
                image: screenshotPath,
                alt_text: `A computer-generated representation of the ${planetName} exoplanet.`,
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
            waitUntil: "domcontentloaded",
            timeout: 120000,
          });
        } catch (error) {
          console.log("exoplanets error:", error);
        }
        return true;
      });
  })();
};

export default botScript;
