import fetch from "node-fetch";
import fs from "fs";

export default async (url, path) => {
  console.log("downloading...", { url, path });

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "StefansCreativeBots/1.0 (https://bots.stefanbohacek.com/; stefan@stefanbohacek.com) node/lts",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const buffer = await response.buffer();
  fs.writeFileSync(path, buffer);
  return { path };
};
