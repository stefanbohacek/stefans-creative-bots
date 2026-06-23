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
        access_token: process.env.BEARCAM_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      let liveStreams = await getLiveStreams("explorebears");
      // let liveStreams = await getLiveStreams("ExploreLiveNatureCams");

      if (liveStreams?.length) {
        liveStreams = liveStreams.filter((item) => {
          const title = item?.snippet?.title.toLowerCase();
          return title.includes("live") && title.includes("bear cam");
        });
      }

      const liveStream = randomFromArray(liveStreams);

      if (liveStream) {
        const liveStreamURL = `https://www.youtube.com/watch?v=${liveStream.id.videoId}`;
        const title = liveStream?.snippet?.title;
        const status = `${title + "\n\n" || ""}${liveStreamURL}\n\n#bearcam #bears #live #LiveStream`;

        await mastodon.post({
          status,
        });
      }
    } catch (err) {
      console.log(`${botID} error`, err);
    }
  })();
};

export default botScript;
