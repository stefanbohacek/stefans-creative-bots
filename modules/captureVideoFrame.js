import puppeteer from "puppeteer";

export default async (webcamUrl, webcamSelector, outputPath) => {
  console.log("1");

  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.BROWSERLESS_URL,
  });

  console.log("2");

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "permissions", {
        value: {
          query: () => Promise.resolve({ state: "granted" }),
        },
      });
    });

    console.log("3");


    await page.goto(webcamUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await page.waitForSelector(webcamSelector, { timeout: 15000 });

    const selectorsToRemove = [".archiveSelector", ".ecLogo"];

    console.log("4");
    for (const selector of selectorsToRemove) {
      try {
        const el = await page.waitForSelector(selector, { timeout: 5000 });
        if (el) {
          await el.evaluate((el) => el.remove());
          console.log(`removed element: ${selector}`);
        }
      } catch (error) {
        // noop
      }
    }

    const videoElement = await page.$(webcamSelector);
    if (!videoElement) {
      throw new Error("Video element not found");
    }

    await videoElement.click();
    console.log("clicked video element");

    await page.evaluate((selector) => {
      const video = document.querySelector(selector);
      if (video) {
        console.log("video readyState:", video.readyState);
        console.log("video paused:", video.paused);
        console.log("video src:", video.src);
        console.log("video poster:", video.poster);

        if (video.paused) {
          video.play().catch((e) => console.log("play failed:", e));
        }

        video.removeAttribute("poster");
      }
    }, webcamSelector);

    console.log("waiting for video stream to load...");
    await page.waitForTimeout(15000);

    const videoStatus = await page.evaluate((selector) => {
      const video = document.querySelector(selector);
      if (!video) return { found: false };

      return {
        found: true,
        readyState: video.readyState,
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration,
        src: video.src,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      };
    }, webcamSelector);

    console.log("video status:", videoStatus);

    if (videoStatus.readyState < 2 || videoStatus.videoWidth === 0) {
      console.log("video not fully loaded, waiting more...");
      await page.waitForTimeout(10000);
    }

    console.log("5");

    await videoElement.screenshot({
      path: outputPath,
      type: "jpeg",
      quality: 90,
    });

    console.log(`Video frame captured: ${outputPath}`);
  } catch (err) {
    console.log("nYC VIEWS BOT ERROR:", err);
  } finally {
    await browser.close();
  }
};
