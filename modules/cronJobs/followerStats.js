import { CronJob } from "cron";
import cronSchedules from "../cronSchedules.js";
import db from "../db.js";
import { mastodonFetch } from "../mastodon/fetch.js";
import { notifyAdmin } from "../email.js";

export default () => {
  const followerStatsCronJob = new CronJob(
    cronSchedules.EVERY_DAY_MORNING,
    async () => {
      try {
        console.log("follower stats: starting...");

        const myAccounts = [
          "stefan@stefanbohacek.online",
          "stefanbohacek@calckey.social",
          "stefan@misskey.id",
        ];

        const [accounts] = await db.execute(
          /* sql */ `SELECT username, server FROM fediverse_account_info`,
        );

        const uniqueFollowers = new Set();
        const uniqueServers = new Set();

        for (const { username, server } of accounts) {
          try {
            console.log(
              `follower stats: fetching followers for @${username}@${server}...`,
            );

            const userData = await mastodonFetch(server, "accounts/lookup", {
              acct: username,
            });

            if (!userData?.id) {
              continue;
            }

            const followers = await mastodonFetch(
              server,
              `accounts/${userData.id}/followers`,
            );

            for (const follower of followers) {
              if (myAccounts.includes(follower.acct)) {
                continue;
              }

              uniqueFollowers.add(follower.acct);

              const followerServer = follower.acct.split("@")[1];
              if (followerServer) {
                uniqueServers.add(followerServer);
              }
            }

            console.log(
              `follower stats: @${username}@${server} - ${followers.length} followers`,
            );
          } catch (err) {
            console.log(`follower stats error: @${username}@${server}`, err);
          }
        }

        await db.execute(
          /* sql */ `INSERT INTO follower_stats (id, unique_followers, unique_servers, calculated_at)
           VALUES (1, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE
             unique_followers = VALUES(unique_followers),
             unique_servers = VALUES(unique_servers),
             calculated_at = NOW()`,
          [uniqueFollowers.size, uniqueServers.size],
        );

        console.log(
          `follower stats: done: ${uniqueFollowers.size.toLocaleString()} unique followers across ${uniqueServers.size.toLocaleString()} servers`,
        );
      } catch (err) {
        console.log("follower stats cron error:", err);
        await notifyAdmin(
          "Follower stats cron error",
          `<pre>${err?.stack || err}</pre>`,
        );
      }
    },
    null,
    true,
  );

  return followerStatsCronJob;
};
