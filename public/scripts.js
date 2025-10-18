import ready from "./modules/ready.js";
import showFollowersCount from "./modules/showFollowersCount.js";
// import relativeTime from "./libs/day.js/1.11.18/plugins/relativeTime.min.js";

ready(() => {
  dayjs.extend(dayjs_plugin_relativeTime);
  showFollowersCount();
});
