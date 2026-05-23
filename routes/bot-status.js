import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
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

  res.json(statuses);
});

export default router;
