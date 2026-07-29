import wikipediaTopEdits from "./cronJobs/wikipediaTopEdits.js";
import fediverseDataRefresh from "./cronJobs/fediverseDataRefresh.js";
import followerStats from "./cronJobs/followerStats.js";

export default () => {
  console.log("setting up cron jobs...");

  wikipediaTopEdits();
  fediverseDataRefresh();
  followerStats();
};
