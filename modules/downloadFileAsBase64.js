import getUserAgent from "./getSCBUserAgent.js";
import sleep from "./sleep.js";

const downloadFileAsBase64 = async (url, retries = 3) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": getUserAgent(),
    },
  });

  if (response.status === 429 && retries > 0) {
    await sleep(5000);
    return downloadFileAsBase64(url, retries - 1);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
};

export default downloadFileAsBase64;
