import puppeteer from "puppeteer";
import downloadFile from "./download-file.js";

export default async (botID, webcam) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.BROWSERLESS_URL,
    ignoreHTTPSErrors: true,
    timeout: 30000,
  });

  try {
    console.log("getWebcamImage", { botID, webcam });

    let imageURL;

    if (webcam.image_url) {
      imageURL = webcam.image_url;
    } else if (webcam.element) {
      try {
        process.on("unhandledRejection", (reason, p) => {
          console.error(
            "Unhandled Rejection at: Promise",
            p,
            "reason:",
            reason
          );
          browser.close();
        });

        const page = await browser.newPage();
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
        );

        await page.setDefaultNavigationTimeout(120000);
        await page.goto(webcam.url, {
          waitUntil: "domcontentloaded",
          timeout: 120000,
        });

        await page.waitForSelector(webcam.element, { timeout: 120000 });
        const imageElement = await page.$(webcam.element);

        const image = await page.evaluate(
          (imageElement) => imageElement.getAttribute("src"),
          imageElement
        );

        if (image) {
          if (image.indexOf("http") === -1) {
            imageURL = `${webcam.page_url}${image}`;
          } else {
            imageURL = image;
          }
        } else {
          console.log(`@${botID} error: image element not found`, webcam);
        }
      } finally {
        await browser.close();
      }
    } else {
      return false;
    }

    if (imageURL) {
      console.log(`@${botID}: downloading image from ${imageURL}`);
      const filePath = `./temp/${botID}.jpg`;
      await downloadFile(imageURL, filePath);
      return filePath;
    } else {
      console.log(`@${botID}: image not found`);
      return false;
    }
  } catch (error) {
    console.log(`@${botID} error:`, error);
    return false;
  }
};
