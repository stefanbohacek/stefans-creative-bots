import fetch from "node-fetch";
import mastodonClient from "./../../modules/mastodon/index.js";
import progressbar from "./../../modules/generators/progressbar.js";

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.YEAR_BOT_MASTODON_TOKEN,
        api_url: process.env.BOTSINSPACE_API_URL,
      });

      const progress = 66.66;

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
