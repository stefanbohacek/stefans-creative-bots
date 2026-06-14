import db from "./db.js";
import { notifyAdmin } from "./email.js";

const poolCheckInterval = 60000;
// const poolCheckInterval = 5000;

const checkBotPoolFn = async (app) => {
  let pool = app.get("pool");

  if (pool && pool.length) {
    const botName = pool.shift();
    const bots = app.get("bots");
    try {
      const bot = bots.filter((bot) => bot.about.name === botName)[0];

      // console.log({
      //     pool,
      //     'bot.about': bot.about,
      //     bots: bots.map(bot => bot.about.name)
      // });

      await bot.script.default();
    } catch (err) {
      console.log(`${botName} error:`, err);
      const errText =
        err?.stack ||
        err?.error?.stack ||
        err?.message ||
        JSON.stringify(err, null, 2);
      const timestamp = new Date().toISOString();
      await notifyAdmin(`${botName} error`, `<pre>[${timestamp}]\n\n${errText}</pre>`);
    }

    pool = [...new Set(pool)];
    app.set("pool", pool);

    try {
      await db.execute(/* sql */ `DELETE FROM bot_pool`);

      for (const name of pool) {
        await db.execute(
          /* sql */ `INSERT IGNORE INTO bot_pool (bot_name) VALUES (?)`,
          [name],
        );
      }
    } catch (err) {
      console.log(
        "checkBotPool: DB unavailable, skipping pool persistence:",
        err.message,
      );
    }

    setImmediate(() => checkBotPoolFn(app));
  } else {
    console.log(`current pool (${pool.length}):`, pool);
    setTimeout(() => checkBotPoolFn(app), poolCheckInterval);
  }
};

export default async (app) => {
  let pool = [];

  try {
    const [rows] = await db.execute(
      /* sql */ `SELECT bot_name FROM bot_pool ORDER BY id`,
    );
    pool = [...new Set(rows.map((row) => row.bot_name))];
  } catch (err) {
    console.log("checkBotPool: DB connection not available", err.message);
  }

  app.set("pool", pool);
  checkBotPoolFn(app);
};
