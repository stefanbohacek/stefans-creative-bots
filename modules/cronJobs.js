import wikipediaTopEdits from "./cronJobs/wikipediaTopEdits.js";
import fediverseDataRefresh from "./cronJobs/fediverseDataRefresh.js";
import followerStats from "./cronJobs/followerStats.js";
import mentions from "./cronJobs/mentions.js";

export default (bots) => {
  console.log("setting up cron jobs...");

  wikipediaTopEdits();
  fediverseDataRefresh();
  followerStats();
  mentions(bots);
};
