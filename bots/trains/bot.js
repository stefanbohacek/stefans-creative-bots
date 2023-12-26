import mastodonClient from "./../../modules/mastodon/index.js";

import webcams from "./../../data/webcams/trains.js";
import extractVideoLive from "./../../modules/extract-video-live.js";
import extractVideo from "./../../modules/extract-video.js";
import randomFromArray from "./../../modules/random-from-array.js";

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "trains";

const botScript = async () => {
 await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.TRAINS_ACCESS_TOKEN_SECRET,
        api_url: process.env.BOTSINSPACE_API_URL,
      });

      const webcam = randomFromArray(webcams.filter(webcam => webcam.video_start === undefined));
      const status = `${webcam.name}: ${webcam.youtube_url}\n\n${webcam.tags}`;

      if (webcam.video_start && webcam.video_end){
        await extractVideo(webcam.youtube_url, `${botID}.mp4`, webcam.video_start, webcam.video_end, 10);
      } else {
        await extractVideoLive(webcam.youtube_url, `${botID}.mp4`, 10);
      }

      mastodon.postImage({
        status,
        image: __dirname + `/../../temp/${botID}.mp4`,
        alt_text: webcam.description,
      });
    } catch (error) {
      console.log(`${botID} error`, error);
    }
  })();
}

export default botScript;
