import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ready from "./modules/ready.js";
import showFollowersCount from "./modules/showFollowersCount.js";
import backToTop from "./modules/backToTop.js";
import fediverseServer from "./modules/fediverseServer.js";
import birthdayBadge from "./modules/birthdayBadge.js";
import sectionScroll from "./modules/sectionScroll.js";

ready(() => {
  dayjs.extend(relativeTime);
  showFollowersCount();
  backToTop();
  fediverseServer();
  birthdayBadge();
  sectionScroll();
});
