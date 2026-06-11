import fs from "fs";
import pluralize from "pluralize";
import animals from "./../../data/animals.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import { file as downloadFile } from "./../../modules/fetch.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import runCommand from "./../../modules/runCommand.js";
import { getWikipediaPage, getMainImage } from "./../../modules/wikipedia.js";
import sleep from "./../../modules/sleep.js";
import getWordArticle from "./../../modules/getWordArticle.js";

const { botID, getTempDirPath } = getBotInfo(import.meta.url);

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.WYRF_BOT_ACCESS_TOKEN_SECRET,
    api_url: process.env.MASTODON_API_URL,
  });

  const animal1File = getTempDirPath("wyrf_animal_1.jpg");
  const animal2File = getTempDirPath("wyrf_animal_2.jpg");
  const fileOut = getTempDirPath("jpg");
  const maxAttempts = 10;

  let animal1, animal2;
  let imagePost = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      await sleep(1000);
    }

    const twoAnimals = randomFromArray(animals, 2);
    [animal1, animal2] = twoAnimals;

    console.log(`@${botID} attempt ${attempt + 1}:`, { animal1, animal2 });

    try {
      const url1 = await getWikipediaPage(animal1);
      await sleep(1000);
      const url2 = await getWikipediaPage(animal2);

      if (!url1 || !url2) {
        console.log(`@${botID}: missing Wikipedia page(s), trying again`);
        continue;
      }

      const imgUrl1 = await getMainImage(url1);
      await sleep(1000);
      const imgUrl2 = await getMainImage(url2);

      if (!imgUrl1 || !imgUrl2) {
        console.log(`@${botID}: missing image(s), trying again`);
        continue;
      }

      await downloadFile(imgUrl1, animal1File);
      await downloadFile(imgUrl2, animal2File);
      await runCommand("convert", [
        animal2File,
        animal1File,
        "+append",
        fileOut,
      ]);

      const imageStatus = `Would you rather fight 100 ${animal1}-sized ${pluralize(animal2)} or 1 ${animal2}-sized ${animal1}?\n\n#WouldYouRatherFight`;

      imagePost = await mastodon.postImage({
        status: imageStatus,
        image: fileOut,
        alt_text: `${getWordArticle(animal2).charAt(0).toUpperCase() + getWordArticle(animal2).slice(1)} ${animal2} on the left and ${getWordArticle(animal1)} ${animal1} on the right.`,
      });

      break;
    } catch (err) {
      console.log(`@${botID}: error fetching images:`, err);
    } finally {
      for (const file of [animal1File, animal2File, fileOut]) {
        fs.rmSync(file, { force: true });
      }
    }
  }

  const pollOptions = [`100 ${pluralize(animal2)}`, `1 ${animal1}`];
  const pollStatus = `Would you rather fight 100 ${animal1}-sized ${pluralize(animal2)} or 1 ${animal2}-sized ${animal1}?\n\n#poll`;

  if (imagePost) {
    await mastodon.postPoll("#WouldYouRatherFight #poll", pollOptions, {
      in_reply_to_id: imagePost.id,
    });
  } else {
    await mastodon.postPoll(pollStatus, pollOptions);
  }
};

export default botScript;
