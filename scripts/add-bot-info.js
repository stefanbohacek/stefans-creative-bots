/*
  Script to fill in missing fields in each bot's about.json
  by fetching account info from Mastodon.

  Run with: node scripts/add-bot-info.js
            node scripts/add-bot-info.js -- BotName
*/

import "dotenv/config";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { mastodonFetch } from "../modules/mastodon/fetch.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const botsDir = `${__dirname}/../bots`;

const handleFromUrl = (url) => {
  const match = url.match(/https?:\/\/([^/]+)\/@([^/]+)/);
  return match ? `@${match[2]}@${match[1]}` : null;
};

const botNames = process.argv.slice(2).filter((arg) => arg !== "--");
const refreshAll = botNames.length > 0;
const botsToCheck = refreshAll ? botNames : fs.readdirSync(botsDir);

if (refreshAll) {
  console.log(`refreshing all fields for: ${botNames.join(", ")}...`);
}

for (const bot of botsToCheck) {
  const botPath = `${botsDir}/${bot}`;

  if (!fs.existsSync(botPath)) {
    console.log(`${bot}: no such bot directory, skipping...`);
  } else if (fs.lstatSync(botPath).isDirectory()) {
    const aboutPath = `${botPath}/about.json`;

    if (fs.existsSync(aboutPath)) {
      const about = JSON.parse(fs.readFileSync(aboutPath, "utf8"));

      const needsDateCreated = refreshAll || !about.date_created;
      const needsThumbnail = refreshAll || !about.thumbnail;
      const needsAvatar = refreshAll || !about.avatar;
      const needsHeader = refreshAll || !about.header_image;
      const needsHandle = refreshAll || !about.fediverse_handle;

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
            const accountMatch = fediverseLink.url.match(
              /https?:\/\/([^/]+)\/@([^/]+)/,
            );

            if (!accountMatch) {
              console.log(
                `${about.name}: could not parse ${fediverseLink.url}, skipping...`,
              );
            } else {
              const server = accountMatch[1];
              const username = accountMatch[2];
              const account = await mastodonFetch(server, "accounts/lookup", {
                acct: username,
              });

              if (!account || !account.id) {
                console.log(
                  `${about.name}: lookup failed for @${username}@${server}`,
                );
              } else {
                const avatar = account.avatar?.includes("missing.png")
                  ? null
                  : account.avatar;
                const header = account.header?.includes("missing.png")
                  ? null
                  : account.header;

                if (needsDateCreated && account.created_at) {
                  about.date_created = account.created_at;
                  console.log(
                    `${about.name}: setting date_created to ${account.created_at}`,
                  );
                  changed = true;
                }

                if (needsThumbnail && (header || avatar)) {
                  about.thumbnail = header || avatar;
                  console.log(
                    `${about.name}: setting thumbnail to ${about.thumbnail}`,
                  );
                  changed = true;
                }

                if (needsAvatar && avatar) {
                  about.avatar = avatar;
                  console.log(`${about.name}: setting avatar`);
                  changed = true;
                }

                if (needsHeader && header) {
                  about.header_image = header;
                  console.log(`${about.name}: setting header_image`);
                  changed = true;
                }
              }
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
