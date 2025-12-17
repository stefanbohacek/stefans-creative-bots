import fetch from "node-fetch";
import mastodonClient from "./../../modules/mastodon/index.js";

import webcams from "./../../data/webcams/iss.js";
import extractVideoLive from "./../../modules/extract-video-live.js";
import extractVideo from "./../../modules/extract-video.js";
import randomFromArray from "./../../modules/random-from-array.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "iss";

const getLiveStreams = async () => {
  let videos = [];

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCLA_DiR1FfKNvjuUpBHmylQ&eventType=live&type=video&key=${process.env.YOUTUBE_API_KEY}`;
  const resp = await fetch(url);
  const respJSON = await resp.json();

  if (respJSON?.items) {
    videos = respJSON.items.filter((item) =>
      item?.snippet?.title.includes("from the International Space Station")
    );
  }

  return videos;
};

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.ISS_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      const liveStreams = await getLiveStreams();
      const liveStream = randomFromArray(liveStreams);

      if (liveStream) {
        const liveStreamURL = `https://www.youtube.com/watch?v=${liveStream.id.videoId}`;

        let status = `Live feed: ${liveStreamURL}`;

        const apiURL = "http://api.open-notify.org/iss-now.json";

        const response = await fetch(apiURL);
        const data = await response.json();

        if (
          data &&
          data.iss_position &&
          data.iss_position.latitude &&
          data.iss_position.longitude
        ) {
          status += `\nCurrent location: http://www.openstreetmap.org/?mlat=${data.iss_position.latitude}&mlon=${data.iss_position.longitude}&zoom=2`;
        }

        status += `\n\n#iss #space #earth #live #nasa #esa #jaxa #csa`;

        mastodon.post({
          status,
        });

        // await extractVideoLive(webcam.youtube_url, `${botID}.mp4`, 10);
        // console.log('path check', __dirname + `/../../temp/${botID}.mp4`);

        // mastodon.postImage({
        //   status,
        //   image: __dirname + `/../../temp/${botID}.mp4`,
        //   alt_text: webcam.description,
        // });
      }
    } catch (error) {
      console.log(`${botID} error`, error);
    }
  })();
};

export default botScript;
