import "dotenv/config";
import app from "./app.js";
import { loadBotInfo, scheduleBots, loadFediverseAccountData } from "./modules/loadBots.js";
import cronJobs from "./modules/cronJobs.js";
import checkBotPool from "./modules/checkBotPool.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

(async () => {
  const bots = loadBotInfo(app);
  app.set("bots", bots);
  const listener = app.listen(process.env.PORT || 3000, async () => {
    await checkBotPool(app);
    cronJobs();

    console.log(`🖥️ running on port ${listener.address().port}`);
    console.log(`🕒 server time: ${new Date().toTimeString()}`);

    loadFediverseAccountData(bots);
    scheduleBots(bots, app);
  });
})();
