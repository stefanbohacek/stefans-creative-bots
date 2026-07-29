import fs from "fs";
import mastodonClient from "./../../modules/mastodon/index.js";
import videos from "./../../data/webcams/vhs.js";
import extractVideoLive from "./../../modules/extractVideoLive.js";
import { file as downloadFile } from "./../../modules/fetch.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        // access_token: process.env.MASTODON_TEST_TOKEN,
        access_token: process.env.VHS_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      const availableVideos = videos.filter(
        (video) => video.direct_urls || video.direct_url,
      );

      const video = randomFromArray(availableVideos);
      const status = `${video.youtube_url}\n\n${video.tags}`;

      let url;

      if (video.direct_urls) {
        const directUrl = randomFromArray(video.direct_urls);
        url = `https://tools.stefanbohacek.com/video-dl/?platform=direct&url=${directUrl}&random=true&length=10&token=${process.env.STEFANS_TOOLS_ACCESS_TOKEN}`;
      } else if (video.direct_url) {
        url = `https://tools.stefanbohacek.com/video-dl/?platform=direct&url=${video.direct_url}&random=true&length=10&token=${process.env.STEFANS_TOOLS_ACCESS_TOKEN}`;
      }

      if (url) {
        console.log(url);
        await downloadFile(url, getTempDirPath("mp4"));
        try {
          fs.renameSync(getTempDirPath("mp4.mkv"), getTempDirPath("mp4"));
        } catch (err) {
          /* noop */
        }
      } else {
        await extractVideoLive(video.youtube_url, `${botID}.mp4`, 10);
      }

      console.log({ status, alt_text: video.description });

      await mastodon.postImage({
        status,
        spoiler_text: "May contain flashing images.",
        image: getTempDirPath("mp4"),
        alt_text: video.description,
      });
    } catch (error) {
      console.log(`${botID} error`, error);
      throw error;
    }
  })();
};

export default botScript;
