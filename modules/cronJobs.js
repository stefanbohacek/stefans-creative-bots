import { CronJob } from "cron";
import cronSchedules from "./cron-schedules.js";

export default () => {
  console.log("setting up cron jobs...");

  const wikipediaTopEditsCronJob = new CronJob(
    cronSchedules.EVERY_HOUR,
    async () => {
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
    },
    null,
    true
  );
};
