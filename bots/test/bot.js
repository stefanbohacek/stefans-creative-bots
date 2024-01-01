import fetch from "node-fetch";
import mastodonClient from "./../../modules/mastodon/index.js";
import progressbar from "./../../modules/generators/progressbar.js";
import dayOfYear from "./../../modules/day-of-year.js";
import isLeapYear from "./../../modules/is-leap-year.js";

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.YEAR_BOT_MASTODON_TOKEN,
        api_url: process.env.BOTSINSPACE_API_URL,
      });

      const days = isLeapYear() ? 366 : 365;
      const progress = 100 * (dayOfYear()-1/days);
      const status = `Testing.`;
      console.log(status, progress);

      progressbar(
        {
          progress,
          // color: "red",
          // background: "blue"
        },
        (err, image) => {
          mastodon.postImage({
            status,
            image,
            alt_text: `Progress bar that's ${progress}% full.`,
          });
        }
      );
    } catch (error) {
      console.log("@year error:", error);
    }
  })();
};

export default botScript;
