import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  const { token, name, ...params } = req.query;

  if (token && token === process.env.TRIGGER_TOKEN && name) {
    try {
      const botModule = await import(`../bots/${name}/bot.js`);
      const bot = botModule.default;
      await bot(params);
      res.status(200).json({ message: "Bot executed successfully" });
    } catch (error) {
      console.error("Error loading or executing bot:", error);
      res.status(500).json({ error: "Failed to execute bot" });
    }
  } else {
    res.status(400).json({ error: "Invalid token or missing name parameter" });
  }
});

export default router;