import webcams from "./../../data/webcams/nyc.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import captureEarthcamLiveStream from "./../../modules/captureEarthcamLiveStream.js";

process.on("unhandledRejection", (reason, p) => {
  console.error("NYCVIEWSBOT unhandledRejection:", reason);
});

const botID = "nycviewsbot";

const botScript = async (params) => {
  const mastodon = new mastodonClient({
    access_token: process.env.NYCVIEWSBOT_MASTODON_ACCESS_TOKEN,
    // access_token: process.env.MASTODON_TEST_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  let webcam;
  // const webcamId = "times_square";
  // const webcamId = "statue_of_liberty_harborcam";
  const webcamId = params?.webcam;

  if (webcamId) {
    const findWebcam = webcams.filter((webcam) => webcam.id === webcamId);
    if (webcams.length > 0) {
      webcam = findWebcam[0];
    }
  }

  if (!webcam) {
    webcam = randomFromArray(webcams);
  }

  const webcamUrl = webcam.windy_id
    ? `📷 https://www.windy.com/-Webcams/webcams/${webcam.windy_id}`
    : `📷 ${webcam.link}`;

  const image = await captureEarthcamLiveStream(webcam, botID);

  if (!image || !image.path) {
    console.log("NYCVIEWSBOT: Failed to capture image");
    return;
  }

  const archiveLabel = image.isArchive ? " (archived footage)" : "";
  const status = `${webcam.title}${archiveLabel}\n\n${webcamUrl}\n\n#NYC #NewYorkCity #webcam`;

  mastodon.postImage({
    status,
    image: image.path,
    alt_text: webcam.description,
  });
};

export default botScript;
