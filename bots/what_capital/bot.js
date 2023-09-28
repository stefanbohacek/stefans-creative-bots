import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from "fs";
import capitals from "./../../data/capitals.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import downloadFile from "./../../modules/download-file.js";

const botID = "whatcapital";
const savedDataPath = __dirname + "/../../data/what_capital.json";

let savedData = {
  country: "",
  capital: "",
  scores: {},
};

const mastodon = new mastodonClient({
  access_token: process.env.WHAT_CAPITAL_MASTODON_ACCESS_TOKEN_SECRET,
  api_url: process.env.WHAT_CAPITAL_MASTODON_API,
});

// const mastodon = new mastodonClient({
//   access_token: process.env.MASTODON_TEST_TOKEN,
//   api_url: process.env.MASTODON_TEST_TOKEN_API,
// });

const clients = { mastodon };

if (fs.existsSync(savedDataPath)) {
  savedData = JSON.parse(fs.readFileSync(savedDataPath, "utf8"));
}

console.log(`loading saved data for @${botID}...`, savedData);
// console.log(JSON.parse(savedData));

const saveData = () => {
  fs.writeFileSync(savedDataPath, JSON.stringify(savedData, null, 2), "utf8");
};

const updateScores = (user) => {
  const admins = ["stefan@stefanbohacek.online", "botwiki@mastodon.social"];

  if (admins.indexOf(user) === -1) {
    if (savedData.scores.hasOwnProperty(user)) {
      savedData.scores[user] = savedData.scores[user] + 1;
    } else {
      savedData.scores[user] = 1;
    }
    saveData();
  } else {
    console.log("what_capital: skipping answer from admin");
  }
};

const pickNewCapital = async () => {
  const capital = randomFromArray(capitals);
  const flagUrl = `https://static.stefanbohacek.dev/images/flags/${capital.country.replace(
    / /g,
    "_"
  )}.png`;

  console.log("picking new capital", {
    capital,
    flagUrl,
  });

  savedData.capital = capital.capital;
  savedData.country = capital.country;

  const filePath = `${__dirname}/../../temp/${botID}.jpg`;
  await downloadFile(flagUrl, filePath);

  let altText = capital.flag_description;

  if (capital.flag_description.length > 1000) {
    altText = capital.flag_description.slice(0, 2) + "...";
  }

  mastodon.postImage(
    {
      status:
        "What is the capital of this country or territory? #quiz #geography #flags #country",
      image: filePath,
      alt_text: `An unspecified country flag: ${altText}`,
    },
    (error, data) => {
      console.log("question posted", data.id);
      savedData.current_question = data.id;
      saveData();
    }
  );
};

const checkAnswer = (answer) => {
  answer = answer
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  const correctAnswer = savedData.capital
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  return answer.includes(correctAnswer);
};

const getLeaderboard = () => {
  let topScores = {};

  for (let account in savedData.scores) {
    const scoreStr = savedData.scores[account].toString();

    if (scoreStr in topScores) {
      topScores[scoreStr].push(account);
    } else {
      topScores[scoreStr] = [account];
    }
  }

  console.log(topScores);

  let leaderboard = [];

  for (let score in topScores) {
    const s = {};

    s.score = score;
    s.accounts = topScores[score];

    leaderboard.push(s);
  }

  leaderboard = leaderboard.sort((a, b) => b.score - a.score);
  const medals = ["🥇", "🥈", "🥉"];
  const topThree = leaderboard.slice(0, 3);

  return `\n\n${topThree
    .map(
      (top, index) =>
        `${medals[index]} ${top.accounts.map((a) => `${a}`).join(", ")}: ${
          top.score
        } pt(s)`
    )
    .join("\n")}`;
};

if (!savedData.capital) {
  await pickNewCapital();
}

const reply = async (postID, from, messageText, fullMessage) => {
  console.log(
    `new ${fullMessage.data.status.visibility} message from ${from}: ${messageText}`
  );

  let replyMessage = "";

  if (
    fullMessage.data.status.visibility === "public" ||
    fullMessage.data.status.visibility === "unlisted"
  ) {
    const inReplyToId = fullMessage.data.status.in_reply_to_id;

    if (savedData.current_question !== inReplyToId) {
      replyMessage = `Please make sure to reply directly to the latest question: https://botsin.space/@what_capital/${savedData.current_question}`;
    } else {
      if (checkAnswer(messageText)) {
        updateScores(from);
        replyMessage = `Yes, ${savedData.capital} is the capital of ${
          savedData.country
        }, correct! ${getLeaderboard()}`;
        await pickNewCapital();
      } else {
        replyMessage = "That doesn't seem correct, sorry!";
      }
    }
  } else {
    replyMessage = "Sorry, do you mind responding publicly?";
  }

  console.log(
    `new ${fullMessage.data.status.visibility} message from ${from}: ${messageText}`
  );

  console.log(`reply: ${replyMessage}`);
  mastodon.reply(fullMessage, replyMessage);
};

export { reply, clients };
