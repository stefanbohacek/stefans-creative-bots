if (!process.env.PROJECT_NAME || !process.env.PROJECT_ID) {
  require("dotenv").config();
}

const path = require("path"),
  fs = require("fs"),
  { convert } = require("html-to-text"),
  express = require("express"),
  app = require(__dirname + "/app.js"),
  helpers = require(__dirname + "/helpers/helpers.js"),
  CronJob = require("cron").CronJob,
  cronSchedules = require(__dirname + "/helpers/cron-schedules.js");

/* All bots will be automatically loaded from the "bots" folder. For testing a single bot: */

// const bot = require(__dirname + '/bots/pirateflags.js');
// bot.script();

// const allBots = [
//     'botwikirandom',
//     'emoji__polls',
//     'helloworld__bot',
//     'hypno__bot',
//     'last100bills',
//     'nycdatabot',
//     'nycviewsbot',
//     'pollockdotexe',
//     'raindotgifbot',
//     'snowdotgifbot',
//     'southpoleviews',
//     'volcanoviews'
// ];

// allBots.forEach(bot => {
//     bot = require(__dirname + `/bots/${bot}.js`);
//     bot.script();
// });

// https://github.com/fourtonfish/stefans-creative-bots/commit/d4bacb18d5b8c5521297fdd24eddbf763d8d317b#diff-b335630551682c19a781afebcf4d07bf978fb1f8ac04c6bf87428ed5106870f5
// node node_modules/puppeteer/install.js

const files = fs.readdirSync(__dirname + "/bots");
let bots = [];

files.forEach((file) => {
  const bot = require(__dirname + "/bots/" + file);

  if (bot.active) {
    bot.file = file;

    if (!bot.name) {
      bot.name = bot.file.replace(".js", "");
    }

    if (bot.reply && bot.clients) {
      if (bot.clients.mastodon) {
        bots.push(bot);

        const mastodonStream =
          bot.clients.mastodon.client.stream("streaming/user");

        mastodonStream.on("message", (message) => {
          console.log("received message...", message.event, message.data.type);
          if (
            message.event === "notification" &&
            message.data.type === "mention"
          ) {
            const from = message.data.account.acct;
            const statusID = message.data.status.id;
            const text = convert(message.data.status.content);
            bot.reply(statusID, from, text, message);
          }
        });
      }
    }

    if (bot.interval) {
      let botInterval;

      for (const schedule in cronSchedules) {
        if (cronSchedules[schedule] === bot.interval) {
          botInterval = schedule;
        }
      }

      if (botInterval.length === 0) {
        botInterval = bot.interval;
      } else {
        botInterval = helpers.capitalizeFirstLetter(
          botInterval.replace(/_/g, " ")
        );
      }

      bot.interval_human = botInterval;

      console.log(`⌛ scheduling ${bot.name} (${file}): ${botInterval}`);

      const job = new CronJob(bot.interval, () => {
        bot.script();
      });
      bot.cronjob = job;

      job.start();
      console.log("📅 next run:", job.nextDates().fromNow());
      bots.push(bot);
    }
  }
});

app.set("bots", bots);

let listener = app.listen(process.env.PORT, () => {
  console.log("🤖 bots have been scheduled");
  console.log("🕒 server time: ", new Date().toTimeString());
});
