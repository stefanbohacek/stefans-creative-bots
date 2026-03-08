import { dirname } from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import mastodonClient from "./../../modules/mastodon/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botScript = async () => {
  const botID = "hello_world";
  let status = "";
  const screenshotPath = __dirname + `/../../temp/${botID}.jpg`;

  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.HELLOWORLDBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: process.env.BROWSERLESS_URL,
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(30000);

    process.on("unhandledRejection", (reason, p) => {
      console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
      browser.close();
    });

    page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",
    );

    // await page.setViewport({ width: 800, height: 800 });
    await page.setViewport({ width: 400, height: 400, deviceScaleFactor: 2 });

    const url = "https://weirdweboctober.stefanbohacek.com/2025/21/";
    console.log(`visiting ${url} ...`);
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    await page.evaluate(() => {
      document.querySelector("h1")?.remove();
      document.querySelector("#hellosalut-attribution")?.remove();
      document.body.style.marginTop = "-40px";
    });

    const altText = await page.evaluate(() => {
      const hello = document.querySelector("#hello")?.innerText;
      const language = document.querySelector("#language")?.innerText;
      const emoji = document.querySelector(".emoji:not(.d-none)")?.innerText;
      return `${hello} ${language} ${emoji}`.trim();
    });

    await page.waitForTimeout(3000);

    try {
      await page.screenshot({ path: screenshotPath });

      status += "\n\n#HelloWorld #hello #languages";

      mastodon.postImage({
        status,
        image: screenshotPath,
        alt_text: altText,
      });
    } catch (err) {
      console.log(
        `@HelloWorld screenshot error on line ${err.lineNumber}: ${err.message}`,
      );
    }

    await browser.close();
  } catch (err) {
    console.log(`@HelloWorld error on line ${err.lineNumber}: ${err.message}`);
  }
};

export default botScript;
