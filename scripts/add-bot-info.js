/*
  Script to fill in missing fields in each bot's about.json
  by fetching account info from Mastodon.

  Run with: node scripts/add-bot-info.js
*/

import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import sleep from "../modules/sleep.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const botsDir = `${__dirname}/../bots`;

for (const bot of fs.readdirSync(botsDir)) {
  const botPath = `${botsDir}/${bot}`;

  if (fs.lstatSync(botPath).isDirectory()) {
    const aboutPath = `${botPath}/about.json`;

    if (fs.existsSync(aboutPath)) {
      const about = JSON.parse(fs.readFileSync(aboutPath, "utf8"));

      const needsDateCreated = !about.date_created;
      const needsThumbnail = !about.thumbnail;

      if (!needsDateCreated && !needsThumbnail) {
        console.log(`${about.name}: already up to date`);
      } else {
        const mastodonLink = about.links?.find(
          (link) =>
            link.title === "Follow on Mastodon" ||
            link.url?.includes("stefanbohacek.online"),
        );

        if (mastodonLink) {
          const jsonUrl = `${mastodonLink.url}.json`;

          try {
            const response = await fetch(jsonUrl);

            if (response.ok) {
              const data = await response.json();

              if (needsDateCreated) {
                if (data.published) {
                  about.date_created = data.published;
                  console.log(`${about.name}: setting date_created to ${data.published}`);
                } else {
                  console.log(`${about.name}: "published" field missing`);
                }
              }

              if (needsThumbnail) {
                const thumbnail = data.image?.url || data.icon?.url;
                if (thumbnail) {
                  about.thumbnail = thumbnail;
                  console.log(`${about.name}: setting thumbnail to ${thumbnail}`);
                } else {
                  console.log(`${about.name}: no thumbnail found`);
                }
              }

              fs.writeFileSync(aboutPath, JSON.stringify(about, null, 2) + "\n");
              await sleep(300);
            } else {
              console.log(`${about.name}: HTTP ${response.status} from ${jsonUrl}`);
            }
          } catch (err) {
            console.log(`${about.name}: error fetching ${jsonUrl}: ${err.message}`);
          }
        } else {
          console.log(`${about.name}: no Mastodon link found, skipping...`);
        }
      }
    }
  }
}
