import "dotenv/config";
import app from "./app.js";
import { loadBotInfo, scheduleBots, loadFediverseAccountData } from "./modules/loadBots.js";
import cronJobs from "./modules/cronJobs.js";
import checkBotPool from "./modules/checkBotPool.js";
import { notifyAdmin } from "./modules/email.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

process.on("unhandledRejection", async (reason) => {
  console.error("unhandledRejection:", reason);
  await notifyAdmin("Unhandled rejection", `<pre>${reason?.stack || reason}</pre>`);
});

process.on("uncaughtException", async (err) => {
  console.error("uncaughtException:", err);
  await notifyAdmin("Uncaught exception", `<pre>${err?.stack || err}</pre>`);
});

(async () => {
  const bots = loadBotInfo(app);
  app.set("bots", bots);
  const listener = app.listen(process.env.PORT || 3000, async () => {
    cronJobs();

    console.log(`🖥️ running on port ${listener.address().port}`);
    console.log(`🕒 server time: ${new Date().toTimeString()}`);

    try {
      await loadFediverseAccountData(bots);
    } catch (err) {
      console.log("failed to load fediverse account data:", err.message);
    }
    await scheduleBots(bots, app);
    await checkBotPool(app);
  });
})();
