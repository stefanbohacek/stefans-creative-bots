import fetch from "node-fetch";
import fs from "fs";

export default async (url, path) => {
  console.log("downloading...", { url, path });
  const response = await fetch(url);
  const blob = await response.blob();
  const bos = Buffer.from(await blob.arrayBuffer());
  // const bos = blob.stream();
  fs.writeFileSync(path, bos);
  return { path };
};
