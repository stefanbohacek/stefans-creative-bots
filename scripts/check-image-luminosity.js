import { file as downloadFile } from "../modules/fetch.js";
import getImageLuminosity from "../modules/getImageLuminosity.js";
import sleep from "../modules/sleep.js";

const URLS = [
  {
    url: "https://sbonline.nyc3.digitaloceanspaces.com/media_attachments/files/116/644/551/593/625/765/original/ce3b011abbdb242f.jpg",
    note: "blank",
  },
  {
    url: "https://sbonline.nyc3.digitaloceanspaces.com/media_attachments/files/116/645/510/950/250/810/original/5a7d2da3db696ac4.jpg",
    note: "dark but okay",
  },
  {
    url: "https://sbonline.nyc3.digitaloceanspaces.com/media_attachments/files/116/647/390/480/629/726/original/ebf2bf4b88501908.jpg",
    note: "okay",
  },
  {
    url: "https://sbonline.nyc3.digitaloceanspaces.com/media_attachments/files/116/649/287/323/952/426/original/bc8d2d819beb0cce.jpg",
    note: "okay",
  },
  {
    url: "https://sbonline.nyc3.digitaloceanspaces.com/media_attachments/files/116/654/922/979/699/550/original/b7dbc8e13c4e25cc.jpg",
    note: "okay",
  },
  {
    url: "https://sbonline.nyc3.digitaloceanspaces.com/media_attachments/files/116/685/122/884/233/589/original/ccd4008db1a4b44f.jpg",
    note: "okay",
  },
  {
    url: "https://sbonline.nyc3.digitaloceanspaces.com/media_attachments/files/115/990/550/124/581/568/original/08cc59177dbcf965.jpg",
    note: "okay",
  },
];

for (const [i, { url, note }] of URLS.entries()) {
  const path = `./temp/luminosity-check-${i}.jpg`;
  await sleep(300);
  await downloadFile(url, path);
  const luminosity = await getImageLuminosity(path);
  console.log(`${url.split("/").pop()} (${note}): ${luminosity.toFixed(2)}`);
}
