import webcams from "./../../data/webcams/volcanoes.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import downloadFile from "./../../modules/downloadFile.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getWeather from "./../../modules/getWeather.js";
import getImageLuminosity from "./../../modules/getImageLuminosity.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import sleep from "./../../modules/sleep.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const botScript = async (retries = 0) => {
  if (retries >= 10) {
    console.log(`${botID}: max retries reached`);
    return;
  }
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.VOLCANOVIEWS_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const webcam = randomFromArray(webcams);
  const filePath = getTempDirPath("jpg");
  await downloadFile(webcam.url, filePath);

  const luminosity = await getImageLuminosity(filePath);

  if (luminosity > 20 && luminosity < 200) {
    const status = `${webcam.name} via ${webcam.page_url} #volcano #nature`;

    await mastodon.postImage({
      status,
      image: filePath,
      alt_text: "Webcam view of a volcano.",
    });
    return true;
  } else {
    await sleep(3000);
    return await botScript(retries + 1);
  }
};

export default botScript;
