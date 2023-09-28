import mastodonClient from "./../../modules/mastodon/index.js";

import extractVideo from "./../../modules/extract-video.js";

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "TropicalReefAquarium";

const botScript = async () => {
 await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.TROPICAL_REEF_AQUARIUM_ACCESS_TOKEN_SECRET,
        api_url: process.env.TROPICAL_REEF_AQUARIUM_API,
      });

      const webcam = {
        "name": "Tropical reef aquarium in Long Beach, California",
        description:
          "A short clip from a webcam inside of a tropical reef aquarium. Typically you can see a lot of colorful fish of various sizes swimming around a coral reef.",
        "url": "https://explore.org/livecams/aquarium-of-the-pacific/pacific-aquarium-tropical-reef-camera",
        youtube_url: "https://www.youtube.com/watch?v=DHUnz4dyb54",
        tags: "#fish #corals #aquarium",
      };

      const status = `${webcam.name}: ${webcam.url}\n\n${webcam.tags}`;
      await extractVideo(webcam.youtube_url, `${botID}.mp4`, 10);

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
