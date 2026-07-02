import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { getLiveStreams } from "./../../modules/youtube.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        // access_token: process.env.MASTODON_TEST_TOKEN,
        access_token: process.env.PENGUINS_AND_PUFFINS_BOT_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      let liveStreams = await getLiveStreams("ExplorePenguinsandPuffins");
      // let liveStreams = await getLiveStreams("ExploreLiveNatureCams");

      // console.log(liveStreams);

      if (liveStreams?.length) {
        const liveStream = randomFromArray(liveStreams);
        const hashtags = `#${liveStream.snippet.title.toLowerCase().includes("puffin") ? "puffins" : "penguins"} #live #LiveStream`;

        if (liveStream) {
          const liveStreamURL = `https://www.youtube.com/watch?v=${liveStream.id.videoId}`;
          const title = liveStream?.snippet?.title.replace(
            " | explore.org",
            "",
          );
          const status = `${title + "\n\n" || ""}${liveStreamURL}\n\n${hashtags}`;

          await mastodon.post({
            status,
          });
        }
      }
    } catch (err) {
      console.log(`${botID} error`, err);
    }
  })();
};

export default botScript;
