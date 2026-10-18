import { convert } from "html-to-text";
import db from "../db.js";
import getMastodonClient from "../getMastodonClient.js";
import sleep from "../sleep.js";
import mentionsStatus from "../mentionsStatus.js";

const DELAY_BETWEEN_BOTS_MS = 1000;
const DELAY_BETWEEN_CYCLES_MS = 5000;

const syncMentions = async (bots) => {
  console.log("mentions: starting...");

  const oldestAllowed = Date.now() - 90 * 24 * 60 * 60 * 1000;

  for (const bot of bots) {
    const client = bot.about.fediverse_handle ? getMastodonClient(bot) : null;

    if (client) {
      try {
        const notifications = await client.getNotifications([
          ["types[]", "mention"],
          ["types[]", "quote"],
          ["limit", 40],
        ]);

        for (const notification of notifications) {
          const status = notification.status;

          if (
            status &&
            new Date(notification.created_at).getTime() > oldestAllowed
          ) {
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
        }

        if (notifications.length) {
          await client.markNotificationsRead(notifications[0].id);
        }
      } catch (err) {
        console.log(
          `mentions error: ${bot.about.fediverse_handle}: ${err.message}`,
        );
      }

      await sleep(DELAY_BETWEEN_BOTS_MS);
    }
  }

  try {
    const [result] = await db.execute(
      /* sql */ `DELETE FROM mentions WHERE cleared = 1 AND mentioned_at < NOW() - INTERVAL 90 DAY`,
    );

    if (result.affectedRows) {
      console.log(`mentions: pruned ${result.affectedRows} cleared mention(s)`);
    }
  } catch (err) {
    console.log(`mentions prune error: ${err.message}`);
  }

  mentionsStatus.lastCheckedAt = Date.now();

  console.log("mentions: done");
};

export default (bots) => {
  (async () => {
    while (true) {
      try {
        await syncMentions(bots);
      } catch (err) {
        console.log(`mentions cycle error: ${err.message}`);
      }

      await sleep(DELAY_BETWEEN_CYCLES_MS);
    }
  })();
};
