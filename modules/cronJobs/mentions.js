import { CronJob } from "cron";
import { convert } from "html-to-text";
import cronSchedules from "../cronSchedules.js";
import db from "../db.js";
import getMastodonClient from "../getMastodonClient.js";

export default (bots) => {
  const mentionsCronJob = new CronJob(
    cronSchedules.EVERY_TEN_MINUTES,
    async () => {
      console.log("mentions: starting...");

      for (const bot of bots) {
        const client = bot.about.fediverse_handle
          ? getMastodonClient(bot)
          : null;

        if (client) {
          try {
            const notifications = await client.getNotifications({
              "types[]": "mention",
              limit: 40,
            });

            for (const notification of notifications) {
              const status = notification.status;

              await db.execute(
                /* sql */ `INSERT IGNORE INTO mentions
                  (bot_handle, notification_id, status_id, from_acct, from_display_name, content, spoiler_text, visibility, status_url, mentioned_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  bot.about.fediverse_handle,
                  notification.id,
                  status.id,
                  notification.account.acct,
                  notification.account.display_name,
                  convert(status.content, { wordwrap: false }),
                  status.spoiler_text,
                  status.visibility,
                  status.url,
                  new Date(notification.created_at),
                ],
              );
            }
          } catch (err) {
            console.log(
              `mentions error: ${bot.about.fediverse_handle}: ${err.message}`,
            );
          }
        }
      }

      try {
        const [result] = await db.execute(
          /* sql */ `DELETE FROM mentions WHERE cleared = 1 AND mentioned_at < NOW() - INTERVAL 90 DAY`,
        );
        console.log(`mentions: pruned ${result.affectedRows} cleared mention(s)`);
      } catch (err) {
        console.log(`mentions prune error: ${err.message}`);
      }

      console.log("mentions: done");
    },
    null,
    true,
  );

  return mentionsCronJob;
};
