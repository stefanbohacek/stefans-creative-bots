import puppeteer from "puppeteer";
import pluralize from "pluralize";
import mastodonClient from "./../../modules/mastodon/index.js";
import getBotInfo from "./../../modules/getBotInfo.js";

// https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now/

const VOYAGER_1_LIGHT_DAY_DATE = new Date("2026-11-18T10:16:07Z");
const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const botScript = async () => {
  await (async () => {
    const mastodon = new mastodonClient({
      access_token: process.env.VOYAGERS_BOT_MASTODON_ACCESS_TOKEN,
      // access_token: process.env.MASTODON_TEST_TOKEN,
      api_url: process.env.MASTODON_API_URL,
    });

    let browser;
    try {
      browser = await puppeteer.connect({
        browserWSEndpoint: process.env.BROWSERLESS_URL,
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
      );

      const voyagers = [
        {
          name: "Voyager 1",
          url: "https://eyes.nasa.gov/apps/solar-system/#/sc_voyager_1/distance?to=earth",
        },
        {
          name: "Voyager 2",
          url: "https://eyes.nasa.gov/apps/solar-system/#/sc_voyager_2/distance?to=earth",
        },
      ];

      await page.setDefaultNavigationTimeout(120000);

      const mediaIds = [];
      const statusLines = [];

      const getDistance = () =>
        page.$eval(".distance-subcontainer", (el) => {
          const value = el.querySelector(".result-text")?.textContent.trim();
          const unit = el.querySelector(".result-unit")?.textContent.trim();
          return value && unit ? { value, unit } : null;
        });

      const formatDistance = (reading) =>
        `${reading.value} ${reading.unit === "mi" ? "miles" : reading.unit}`;

      for (const [index, voyager] of voyagers.entries()) {
        await page.goto(voyager.url, {
          waitUntil: "domcontentloaded",
          timeout: 120000,
        });

        await page.waitForTimeout(10000);

        await page.addStyleTag({
          content:
            ".top-right-nav, .item-toggle-btn, .clock-shortcut, #float-right-bottom { display: none !important; }",
        });

        const screenshotPath = getTempDirPath(`${index}.jpg`);
        await page.screenshot({ path: screenshotPath });

        const mediaId = await mastodon.uploadMedia({
          image: screenshotPath,
          alt_text: `Computer-generated image showing position of ${voyager.name} interstellar spacecraft relative to the planets of our Solar System.`,
        });

        mediaIds.push(mediaId);

        const firstReading = await getDistance().catch(() => null);
        const unitToggle = await page.$(".distance-subcontainer .result-unit");

        if (unitToggle) {
          await unitToggle.click();
          await page.waitForTimeout(2000);
        }

        const secondReading = await getDistance().catch(() => null);
        const distances = [firstReading, secondReading].filter(Boolean);
        const distanceMiles = distances.find(
          (reading) => reading.unit === "mi",
        );
        const distanceKM = distances.find((reading) => reading.unit === "km");

        if (distanceMiles || distanceKM) {
          const distance = [distanceKM, distanceMiles]
            .filter(Boolean)
            .map(formatDistance)
            .join("/");

          let voyager1description = `${voyager.name} is ${distance} away from Earth`;

          if (voyager.name === "Voyager 1") {
            const msRemaining = VOYAGER_1_LIGHT_DAY_DATE.getTime() - Date.now();

            if (msRemaining > 0) {
              const hoursRemaining = msRemaining / (60 * 60 * 1000);

              if (hoursRemaining < 1) {
                const minutes = Math.floor(msRemaining / (60 * 1000));

                if (minutes <= 1) {
                  voyager1description += ` and will reach 1 light-day from Earth about now`;
                } else {
                  voyager1description += ` and will reach 1 light-day from Earth in approximately ${minutes} ${pluralize("minute", minutes)}`;
                }
              } else {
                const days = Math.floor(hoursRemaining / 24);
                const hours = Math.floor(hoursRemaining % 24);

                if (days === 0) {
                  voyager1description += ` and will reach 1 light-day from Earth in ${hours} ${pluralize("hour", hours)}`;
                } else {
                  voyager1description += ` and will reach 1 light-day from Earth in ${days.toLocaleString()} ${pluralize("day", days)}, ${hours} ${pluralize("hour", hours)}`;
                }
              }
            }
          }

          voyager1description += `: ${voyager.url}`;
          statusLines.push(voyager1description);
        }
      }

      const status = [
        ...statusLines,
        "#Voyager1 #Voyager2 #voyager #nasa #space",
      ].join("\n\n");

      await mastodon.post({
        status,
        media_ids: mediaIds,
      });
    } catch (error) {
      console.log(`${botID} error:`, error);
      throw error;
    } finally {
      if (browser) {
        await browser.disconnect();
      }
    }
  })();
};

export default botScript;
