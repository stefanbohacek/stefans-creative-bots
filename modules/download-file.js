import fetch from "node-fetch";
import fs from "fs";

export default async (url, path) => {
  console.log("downloading...", { url, path });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const buffer = await response.buffer();
  fs.writeFileSync(path, buffer);
  return { path };
};
