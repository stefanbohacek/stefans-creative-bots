import fs from "fs";
import getUserAgent from "./getSCBUserAgent.js";

export default async (url, path) => {
  console.log("downloading...", { url, path });

  const response = await fetch(url, {
    headers: {
      "User-Agent": getUserAgent()
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(path, buffer);
  return { path };
};
