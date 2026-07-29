import { CronJob } from "cron";
import cronSchedules from "../cronSchedules.js";
import { notifyAdmin } from "../email.js";
import getUserAgent from "../getSCBUserAgent.js";

export default () => {
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
          throw new Error(
            `failed to parse response from ${url} (HTTP ${response.status}): ${responseText.slice(0, 200)}`,
          );
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

  return wikipediaTopEditsCronJob;
};
