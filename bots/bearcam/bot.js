import fs from "fs";
import mastodonClient from "./../../modules/mastodon/index.js";
import webcams from "./../../data/webcams/bearcams.js";
import extractVideoLive from "./../../modules/extractVideoLive.js";
import downloadFile from "./../../modules/downloadFile.js";
import getRandomInt from "./../../modules/getRandomInt.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import { getLiveStreams } from "./../../modules/youtube.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.BEARCAM_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      const liveStreams = await getLiveStreams("ExploreLiveNatureCams");

      console.log("liveStreams", liveStreams);
      //TODO: Finish when the bear season starts. 

      

      // const webcam = randomFromArray(webcams);
      // const webcam = randomFromArray(
      //   webcams.filter((webcam) => webcam.video_start === undefined)
      // );

      // console.log(webcam);
      // const status = `${webcam.name}: ${webcam.youtube_url}\n\n${webcam.tags}`;

      // mastodon.post({
      //   status
      // });      

      // if ("video_start" in webcam && "video_end" in webcam) {
      //   const url = `https://tools.stefanbohacek.com/video-dl/?platform=youtube&id=${
      //     webcam.youtube_id
      //   }&start=${getRandomInt(
      //     webcam.video_start,
      //     webcam.video_end - 10
      //   )}&length=10&token=${process.env.STEFANS_TOOLS_ACCESS_TOKEN}`;
      //   console.log(url);
      //   await downloadFile(url, __dirname + `/../../temp/${botID}.mp4`);
      //   try {
      //     fs.renameSync(
      //       __dirname + `/../../temp/${botID}.mp4.mkv`,
      //       __dirname + `/../../temp/${botID}.mp4`
      //     );
      //   } catch (err) {
      //     /* noop */
      //   }
      // } else {
      //   await extractVideoLive(webcam.youtube_url, `${botID}.mp4`, 10);
      // }

      // mastodon.postImage({
      //   status,
      //   image: __dirname + `/../../temp/${botID}.mp4`,
      //   alt_text: webcam.description,
      // });
    } catch (error) {
      console.log(`${botID} error`, error);
    }
  })();
};

export default botScript;
