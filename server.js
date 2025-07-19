import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import loadBots from "./modules/load-bots.js";
import cronJobs from "./modules/cronJobs.js";
import checkBotPool from "./modules/check-bot-pool.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {
  const bots = await loadBots(app);
  app.set("bots", bots);
  const listener = app.listen(process.env.PORT || 3000, async () => {
    checkBotPool(app);
    cronJobs();
    // const bots = await loadBots(app);
    // app.set("bots", bots);
    // console.log('bots', bots.map(bot => bot.about.name));

    console.log(`🖥️ running on port ${listener.address().port}`);
    console.log(`🕒 server time: ${new Date().toTimeString()}`);
  });
})();
