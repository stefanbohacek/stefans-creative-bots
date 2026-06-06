import { CronJob } from "cron";
import { convert } from "html-to-text";
import moment from "moment";
import cronSchedules from "./cronSchedules.js";
import capitalizeFirstLetter from "./capitalizeFirstLetter.js";
import { notifyAdmin } from "./email.js";

export default async (bot, app) => {
  try {
    if (bot.about.reply) {
      console.log("setting up replies for ", bot.about.name);
      const { reply, clients } = await import(bot.script_path);

      if (clients.mastodon) {
        const mastodonStream = clients.mastodon.client.stream("streaming/user");

        mastodonStream.on("message", async (message) => {
          try {
            // console.log("received message...", {
            //   event: message.event,
            //   id: message.data.id,
            //   created_at: message.data.created_at,
            //   in_reply_to_id: message.data?.status?.in_reply_to_id,
            //   in_reply_to_account_id: message.data?.status?.in_reply_to_account_id,
            //   visibility: message.data?.status?.visibility,
            //   content: message.data?.status?.content || message.data?.content || "",
            //   mentions: message.data?.status?.mentions,
            //   account_id: message.data.account?.id,
            //   account_username: message.data.account?.username,
            //   account_display_name: message.data.account?.display_name,
            // });
            if (
              (message.event === "notification" && message.data.type === "mention") ||
              message.event === "update"
            ) {
              // console.log("message.data", message.data);
              const from = message.data.account.acct;
              const statusID = message.data.id;
              const text = convert(message.data?.status?.content || message.data?.content || "");
              await reply(statusID, from, text, message);
            }
          } catch (err) {
            console.log(`${bot.about.name} message error:`, err);
          }
        });
      }
    }

    if (process.env.ENVIRONMENT !== "local" && bot.about.interval) {
      if (bot.about.interval === "EVERY_SECOND") {
        console.log(bot);

        const botScript = await import(bot.script_path);
        console.log(botScript);

        setInterval(async () => {
          try {
            await bot.script.default();
          } catch (err) {
            console.log(`${bot.about.name} error:`, err);
            await notifyAdmin(`${bot.about.name} error`, `<pre>${err?.stack || err}</pre>`);
          }
        }, 1000);
      } else {
        for (const schedule in cronSchedules) {
          if (schedule === bot.about.interval) {
            bot.about.interval_cron = cronSchedules[schedule];
          }
        }

        bot.about.interval_human = capitalizeFirstLetter(
          bot.about.interval.replace(/_/g, " ")
        );

        console.log(`⌛ scheduling ${bot.about.name}: ${bot.about.interval}`);

        const job = new CronJob(bot.about.interval_cron, async () => {
          console.log(`adding ${bot.about.name} to the pool...`);
          let pool = app.get("pool");
          if (pool) {
            pool.push(bot.about.name);
            pool = [...new Set(pool)];
            app.set("pool", pool);
          }
        });

        job.start();
        const nextRun = moment(job.nextDates().ts).fromNow();
        // console.log(bot.about);
        console.log("📅 next run:", nextRun);
        return job;
      }
    }
  } catch (error) {
    console.log(`${bot.about.name} error:`, error);
    await notifyAdmin(`${bot.about.name} setup error`, `<pre>${error?.stack || error}</pre>`);
  }
};
