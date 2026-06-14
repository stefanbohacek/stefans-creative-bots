import { CronJob } from "cron";
import cronSchedules from "./cronSchedules.js";
import db from "./db.js";
import { mastodonFetch } from "./mastodon/fetch.js";
import lookupAccount from "./mastodon/lookupAccount.js";
import { notifyAdmin } from "./email.js";
import getUserAgent from "./getSCBUserAgent.js";

export default () => {
  console.log("setting up cron jobs...");

  const wikipediaTopEditsCronJob = new CronJob(
    cronSchedules.EVERY_HOUR,
    async () => {
      try {
        console.log("fetching data for WikipediaTopEdits bot");

        let dateYesterday = new Date();
        dateYesterday.setDate(dateYesterday.getDate() - 1);
        const year = dateYesterday.getFullYear();
        const month = String(dateYesterday.getMonth() + 1).padStart(2, "0");
        const day = String(dateYesterday.getDate()).padStart(2, "0");
        const date = `${year}${month}${day}`;
        const url = `https://tools.stefanbohacek.com/wikipedia-top-edits/?date=${date}`;
        console.log(url);

        const response = await fetch(url, {
          headers: { "User-Agent": getUserAgent() },
        });

        if (response.status === 504) {
          console.log("WikipediaTopEdits cron error: 504 (processing data?)");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} from ${url}`);
        }

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (err) {
          throw new Error(`failed to parse response from ${url} (HTTP ${response.status}): ${responseText.slice(0, 200)}`);
        }
      } catch (err) {
        console.log("WikipediaTopEdits cron error:", err);
        await notifyAdmin(
          "WikipediaTopEdits cron error",
          `<pre>${err?.stack || err}</pre>`,
        );
      }
    },
    null,
    true,
  );

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
              `follower stats: @${username}@${server} — ${followers.length} followers`,
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
          `follower stats: done — ${uniqueFollowers.size.toLocaleString()} unique followers across ${uniqueServers.size.toLocaleString()} servers`,
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
};
