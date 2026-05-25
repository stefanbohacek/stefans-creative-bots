import fs from "fs";
import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import scheduleBot from "./scheduleBot.js";
import getFediverseAccountInfo from "./getFediverseAccountInfo.js";

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

        if (!about.hide) {
          bots.push(botInfo);
        }
      }
    }
  }

  return bots;
};

export const scheduleBots = async (bots, app) => {
  let botCount = 0;

  for (const botInfo of bots) {
    const { about, script_path: scriptPath } = botInfo;
    if (fs.existsSync(scriptPath)) {
      const botScript = await import(scriptPath);
      botInfo.script = botScript;

      if (about.active && botScript) {
        botCount++;
        const job = await scheduleBot(botInfo, app);
        botInfo.cronjob = job;
      }
    }
  }

  console.log(`🤖 scheduled ${botCount.toLocaleString()} bot(s)`);
};
