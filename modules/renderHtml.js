import puppeteer from "puppeteer";

export default async ({
  html,
  cssUrls = [],
  cssInline = "",
  selector = "body",
}) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.BROWSERLESS_URL,
  });
  const page = await browser.newPage();

  const styleLinks = cssUrls
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join("\n");

  await page.setContent(
    `<!DOCTYPE html>
    <html>
      <head>
        ${styleLinks}
        <style>
          body { margin: 8px; background: white; display: inline-block; }
          ${cssInline}
        </style>
      </head>
      <body>${html}</body>
    </html>`,
    { waitUntil: "networkidle0" },
  );

  const element = (await page.$(selector)) ?? (await page.$("body"));
  const imageBuffer = await element.screenshot({ type: "png" });

  await browser.close();
  return imageBuffer;
};
