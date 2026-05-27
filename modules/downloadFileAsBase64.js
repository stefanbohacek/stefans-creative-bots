import getUserAgent from "./getSCBUserAgent.js";

export default async (url) => {
  const response = await fetch(url, {
    headers: {
      "User-Agent": getUserAgent(),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
};
