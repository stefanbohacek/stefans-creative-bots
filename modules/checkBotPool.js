import db from "./db.js";

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

      bot.script.default();

      pool = [...new Set(pool)];
      app.set("pool", pool);

      await db.execute(/* sql */`DELETE FROM bot_pool`);
      for (const name of pool) {
        await db.execute(/* sql */`INSERT IGNORE INTO bot_pool (bot_name) VALUES (?)`, [name]);
      }
    } catch (err) {
      /* noop */
    }
  }
  console.log(`current pool (${pool.length}):`, pool);
};

export default async (app) => {
  const [rows] = await db.execute(
    /* sql */`SELECT bot_name FROM bot_pool ORDER BY id`
  );

  let pool = rows.map((row) => row.bot_name);
  pool = [...new Set(pool)];
  app.set("pool", pool);

  setInterval(() => {
    checkBotPoolFn(app);
  }, poolCheckInterval);
};
