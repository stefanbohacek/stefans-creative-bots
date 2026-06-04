import fs from "fs";
import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import scheduleBot from "./scheduleBot.js";
import getFediverseAccountInfo from "./getFediverseAccountInfo.js";
import capitalizeFirstLetter from "./capitalizeFirstLetter.js";
import sleep from "./sleep.js";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const loadBotInfo = (app) => {
  const botDirs = fs.readdirSync("bots");
  const bots = [];

  for (const bot of botDirs) {
    if (fs.lstatSync(`bots/${bot}`).isDirectory()) {
      const aboutJSON = `${__dirname}/../bots/${bot}/about.json`;
      if (fs.existsSync(aboutJSON)) {
        const about = JSON.parse(readFileSync(aboutJSON));
        const scriptPath = `${__dirname}/../bots/${bot}/bot.js`;

        if (about.links) {
          const newLinks = [];
          about.links.forEach((link, index) => {
            newLinks.push(link);

            if (link.title === "Follow on Mastodon") {
              newLinks.push({
                title: "RSS feed",
                url: link.url + ".rss",
              });
            }
          });
          about.links = newLinks;
        }

        if (about.tags) {
          about.tags.sort();
        }

        const botInfo = {
          about,
          script_path: scriptPath,
          script: false,
        };

        if (!botInfo.about.source_url && botInfo.about.source_url !== null) {
          botInfo.about.source_url = `https://github.com/stefanbohacek/stefans-creative-bots/tree/master/bots/${bot}/bot.js`;
        }

        if (about.interval) {
          about.interval_human = capitalizeFirstLetter(
            about.interval.replace(/_/g, " ")
          );
        }

        if (!about.hide) {
          bots.push(botInfo);
        }
      }
    }
  }

  return bots;
};

export const loadFediverseAccountData = async (bots) => {
  const accounts = bots
    .filter((botInfo) => botInfo.about.fediverse_handle)
    .map((botInfo) => {
      const parts = botInfo.about.fediverse_handle.split("@").filter(Boolean);
      return { username: parts[0], server: parts[1] };
    })
    .filter(({ server }) => server);

  if (!accounts.length) {
    return;
  }

  const placeholders = accounts.map(() => "(?, ?)").join(", ");
  const values = accounts.flatMap(({ username, server }) => [username, server]);

  try {
    await db.execute(
      /* sql */`INSERT IGNORE INTO fediverse_account_info (username, server) VALUES ${placeholders}`,
      values
    );
    console.log(`💾 loaded ${accounts.length} fediverse account(s)`);
  } catch (err) {
    console.log("failed to load fediverse account data:", err.message);
  }
};

export const scheduleBots = async (bots, app) => {
  let botCount = 0;
  let replyBotIndex = 0;

  const botsWithDelay = bots.map((botInfo) => {
    const replyDelay = botInfo.about.reply ? replyBotIndex++ * 1000 : 0;
    return { botInfo, replyDelay };
  });

  await Promise.all(
    botsWithDelay.map(async ({ botInfo, replyDelay }) => {
      const { about, script_path: scriptPath } = botInfo;
      if (fs.existsSync(scriptPath)) {
        const botScript = await import(scriptPath);
        botInfo.script = botScript;

        if (about.active && botScript) {
          if (replyDelay) {
            await sleep(replyDelay);
          }
          const job = await scheduleBot(botInfo, app);
          botInfo.cronjob = job;
          botCount++;
        }
      }
    })
  );

  app.set("bots_scheduled", true);
  console.log(`🤖 scheduled ${botCount.toLocaleString()} bot(s)`);
};
