import express from "express";
const router = express.Router();

const CACHE_TTL = 60000;
let statusCache = null;
let statusCacheTime = 0;

router.get("/", (req, res) => {
  const now = Date.now();
  const botsScheduled = req.app.get("bots_scheduled");

  if (botsScheduled && statusCache && now - statusCacheTime < CACHE_TTL) {
    return res.json(statusCache);
  }

  const bots = req.app.get("bots");
  const statuses = {};

  bots.forEach((bot) => {
    if (bot.cronjob && bot.about.fediverse_handle) {
      const status = {};
      try {
        status.next_run = new Date(bot.cronjob.nextDates().ts).toISOString();
      } catch (err) {}
      if (bot.cronjob.lastExecution) {
        status.last_run = new Date(bot.cronjob.lastExecution).toISOString();
      }
      statuses[bot.about.fediverse_handle] = status;
    }
  });

  if (botsScheduled) {
    statusCache = statuses;
    statusCacheTime = now;
  }

  res.json(statuses);
});

export default router;
