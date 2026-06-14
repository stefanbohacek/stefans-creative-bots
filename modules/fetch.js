import fs from "fs";
import getSCBUserAgent from "./getSCBUserAgent.js";
import sleep from "./sleep.js";

const fetchWithContext = async (url, options) => {
  try {
    return await fetch(url, options);
  } catch (err) {
    throw new Error(`fetch failed for ${url}: ${err.cause?.message || err.message}`);
  }
};

export const json = async (url, options) => {
  options = options || {};
  options.headers = options.headers || {};
  options.headers["User-Agent"] = getSCBUserAgent();

  const response = await fetchWithContext(url, options);
  const responseText = await response.text();
  try {
    return JSON.parse(responseText);
  } catch (err) {
    throw new Error(
      `Failed to parse response from ${url} (HTTP ${response.status}): ${err.message}\n\n${responseText.slice(0, 500)}`,
    );
  }
};

export const file = async (url, path) => {
  console.log("downloading...", { url, path });

  const response = await fetchWithContext(url, {
    headers: {
      "User-Agent": getSCBUserAgent(),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} (${url})`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(path, buffer);
  return { path };
};

export const base64 = async (url, retries = 3) => {
  const response = await fetchWithContext(url, {
    headers: {
      "User-Agent": getSCBUserAgent(),
    },
  });

  if (response.status === 429 && retries > 0) {
    await sleep(5000);
    return base64(url, retries - 1);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} (${url})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
};
