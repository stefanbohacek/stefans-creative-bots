import { CronJob } from "cron";
import cronSchedules from "../cronSchedules.js";
import db from "../db.js";
import lookupAccount from "../mastodon/lookupAccount.js";
import { notifyAdmin } from "../email.js";

export default () => {
  const fediverseDataRefreshCronJob = new CronJob(
    cronSchedules.EVERY_HOUR,
    async () => {
      try {
        await db.execute(/* sql */ `UPDATE fediverse_account_info SET fetching = 0
           WHERE fetching = 1 AND fetched_at < NOW() - INTERVAL 10 MINUTE`);

        const [accounts] = await db.execute(
          /* sql */ `SELECT username, server FROM fediverse_account_info`,
        );

        console.log(
          `fediverse data refresh: updating ${accounts.length} account(s)...`,
        );

        for (const { username, server } of accounts) {
          try {
            const accountData = await lookupAccount(username, server);

            if (!accountData) {
              continue;
            }

            await db.execute(
              /* sql */ `UPDATE fediverse_account_info SET
               display_name = ?, avatar = ?, followers = ?, following_count = ?,
               posts = ?, last_status_at = ?, fetched_at = NOW(), fetching = 0
               WHERE username = ? AND server = ?`,
              [
                accountData.displayName,
                accountData.avatar,
                accountData.followers,
                accountData.following,
                accountData.posts,
                accountData.last_status_at,
                username,
                server,
              ],
            );
          } catch (err) {
            console.log(
              `fediverse data refresh error: @${username}@${server}`,
              err,
            );
          }
        }

        console.log("fediverse data refresh: done");
      } catch (err) {
        console.log("fediverse data refresh cron error:", err);
        await notifyAdmin(
          "Fediverse data refresh cron error",
          `<pre>${err?.stack || err}</pre>`,
        );
      }
    },
    null,
    true,
  );

  return fediverseDataRefreshCronJob;
};
