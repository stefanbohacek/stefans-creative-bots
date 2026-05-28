import { CronJob } from "cron";
import cronSchedules from "./cronSchedules.js";
import db from "./db.js";

export default () => {
  console.log("setting up cron jobs...");

  const wikipediaTopEditsCronJob = new CronJob(
    cronSchedules.EVERY_HOUR,
    async () => {
      try {
        console.log("fetching data for WikipediaTopEdits bot");

        let dateYesterday = new Date();
        dateYesterday.setDate(dateYesterday.getDate() - 1);
        const date = dateYesterday
          .toISOString()
          .split("T")[0]
          .replaceAll("-", "");
        const url = `https://tools.stefanbohacek.com/wikipedia-top-edits/?date=${date}`;
        console.log(url);

        const response = await fetch(url);
        const data = await response.json();
      } catch (err) {
        console.log("WikipediaTopEdits cron error:", err);
      }
    },
    null,
    true
  );

  const fediverseDataRefreshCronJob = new CronJob(
    cronSchedules.EVERY_HOUR,
    async () => {
      try {
        await db.execute(
          /* sql */`UPDATE fediverse_account_info SET fetching = 0
           WHERE fetching = 1 AND fetched_at < NOW() - INTERVAL 10 MINUTE`
        );

        const [accounts] = await db.execute(
          /* sql */`SELECT username, server FROM fediverse_account_info`
        );

        console.log(`fediverse data refresh: updating ${accounts.length} account(s)...`);

        for (const { username, server } of accounts) {
          try {
            const resp = await fetch(
              `https://${server}/api/v1/accounts/lookup?acct=${username}`
            );

            if (!resp.ok) {
              continue;
            }

            const accountData = await resp.json();

            if (!accountData.id || typeof accountData.followers_count !== "number") {
              continue;
            }

            await db.execute(
              /* sql */`UPDATE fediverse_account_info SET
               display_name = ?, avatar = ?, followers = ?, following_count = ?,
               posts = ?, last_status_at = ?, fetched_at = NOW(), fetching = 0
               WHERE username = ? AND server = ?`,
              [
                accountData.display_name,
                accountData.avatar,
                accountData.followers_count,
                accountData.following_count,
                accountData.statuses_count,
                accountData.last_status_at,
                username,
                server,
              ]
            );
          } catch (err) {
            console.log(`fediverse data refresh error: @${username}@${server}`, err);
          }
        }

        console.log("fediverse data refresh: done");
      } catch (err) {
        console.log("fediverse data refresh cron error:", err);
      }
    },
    null,
    true
  );
};
