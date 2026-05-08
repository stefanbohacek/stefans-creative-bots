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

function handleFromUrl(url) {
  const match = url.match(/https?:\/\/([^/]+)\/@([^/]+)/);
  return match ? `@${match[2]}@${match[1]}` : null;
}

for (const bot of fs.readdirSync(botsDir)) {
  const botPath = `${botsDir}/${bot}`;

  if (fs.lstatSync(botPath).isDirectory()) {
    const aboutPath = `${botPath}/about.json`;

    if (fs.existsSync(aboutPath)) {
      const about = JSON.parse(fs.readFileSync(aboutPath, "utf8"));

      const needsDateCreated = !about.date_created;
      const needsThumbnail = !about.thumbnail;
      const needsAvatar = !about.avatar;
      const needsHeader = !about.header_image;
      const needsHandle = !about.fediverse_handle;

      let needsUpdate = false;

      if (
        needsDateCreated ||
        needsThumbnail ||
        needsAvatar ||
        needsHeader ||
        needsHandle
      ) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        const fediverseLink = about.links?.find(
          (link) =>
            link.title === "Follow on Mastodon" ||
            link.url?.includes("stefanbohacek.online"),
        );

        if (fediverseLink) {
          let changed = false;

          if (needsHandle) {
            const handle = handleFromUrl(fediverseLink.url);
            if (handle) {
              about.fediverse_handle = handle;
              console.log(
                `${about.name}: setting fediverse_handle to ${handle}`,
              );
              changed = true;
            }
          }

          if (
            needsDateCreated ||
            needsThumbnail ||
            needsAvatar ||
            needsHeader
          ) {
            const jsonUrl = `${fediverseLink.url}.json`;

            try {
              const response = await fetch(jsonUrl);

              if (response.ok) {
                const data = await response.json();

                if (needsDateCreated && data.published) {
                  about.date_created = data.published;
                  console.log(
                    `${about.name}: setting date_created to ${data.published}`,
                  );
                  changed = true;
                }

                if (needsThumbnail) {
                  const thumbnail = data.image?.url || data.icon?.url;
                  if (thumbnail) {
                    about.thumbnail = thumbnail;
                    console.log(
                      `${about.name}: setting thumbnail to ${thumbnail}`,
                    );
                    changed = true;
                  }
                }

                if (needsAvatar && data.icon?.url) {
                  about.avatar = data.icon.url;
                  console.log(`${about.name}: setting avatar`);
                  changed = true;
                }

                if (needsHeader && data.image?.url) {
                  about.header_image = data.image.url;
                  console.log(`${about.name}: setting header_image`);
                  changed = true;
                }

                await sleep(300);
              } else {
                console.log(
                  `${about.name}: HTTP ${response.status} from ${jsonUrl}`,
                );
              }
            } catch (err) {
              console.log(
                `${about.name}: error fetching ${jsonUrl}: ${err.message}`,
              );
            }
          }

          if (changed) {
            fs.writeFileSync(aboutPath, JSON.stringify(about, null, 2) + "\n");
          }
        } else {
          console.log(`${about.name}: no Mastodon link found, skipping...`);
        }
      } else {
        console.log(`${about.name}: already up to date`);
      }
    }
  }
}
