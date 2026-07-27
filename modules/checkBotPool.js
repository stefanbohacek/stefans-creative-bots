import db from "./db.js";
import { notifyAdmin } from "./email.js";

const poolCheckInterval = 60000;
// const poolCheckInterval = 5000;

const checkBotPoolFn = async (app) => {
  let pool = app.get("pool");

  try {
    if (pool && pool.length) {
      const botName = pool.shift();
      pool = [...new Set(pool)];
      app.set("pool", pool);
      console.log(`processing ${botName}:`, pool);

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
          err?.stack || err?.error?.stack || err?.message || String(err);
        const timestamp = new Date().toISOString();
        try {
          await notifyAdmin(
            `${botName} error`,
            `<pre>[${timestamp}]\n\n${errText}</pre>`,
          );
        } catch (notifyErr) {
          console.log(
            "checkBotPool notfication error:",
            notifyErr.message,
          );
        }
      }

      try {
        await db.execute(/* sql */ `DELETE FROM bot_pool WHERE bot_name = ?`, [
          botName,
        ]);
      } catch (err) {
        console.log(
          "checkBotPool DB error:",
          err.message,
        );
      }
    } else {
      console.log(`current pool (${pool ? pool.length : 0}):`, pool);
    }
  } catch (err) {
    console.log("checkBotPool error:", err);
  } finally {
    const currentPool = app.get("pool");
    if (currentPool && currentPool.length) {
      setImmediate(() => checkBotPoolFn(app));
    } else {
      setTimeout(() => checkBotPoolFn(app), poolCheckInterval);
    }
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
    console.log("checkBotPool DB error", err.message);
  }

  app.set("pool", pool);
  checkBotPoolFn(app);
};
