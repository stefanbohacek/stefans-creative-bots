import capitals from "./../../data/capitals.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import downloadFileAsBase64 from "./../../modules/downloadFileAsBase64.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import db from "./../../modules/db.js";

const { botID } = getBotInfo(import.meta.url);

let savedData = {
  country: "",
  capital: "",
  current_question: "",
  scores: {},
};

const mastodon = new mastodonClient({
  access_token: process.env.WHAT_CAPITAL_BOT_MASTODON_ACCESS_TOKEN_SECRET,
  api_url: process.env.MASTODON_API_URL,
});

const clients = { mastodon };

const [questionRows] = await db.execute(
  /* sql */`SELECT country, capital, current_question FROM what_capital_question WHERE id = 1`
);

if (questionRows.length) {
  savedData.country = questionRows[0].country;
  savedData.capital = questionRows[0].capital;
  savedData.current_question = questionRows[0].current_question;
}

const [scoreRows] = await db.execute(
  /* sql */`SELECT username, score FROM what_capital_scores`
);

for (const row of scoreRows) {
  savedData.scores[row.username] = row.score;
}

console.log(`loading saved data for @${botID}...`, savedData);
// console.log(JSON.parse(savedData));

const updateScores = async (user) => {
  const admins = [
    "stefan",
    "stefan@stefanbohacek.online",
    "botwiki@mastodon.social",
  ];

  if (admins.indexOf(user) === -1) {
    if (savedData.scores.hasOwnProperty(user)) {
      savedData.scores[user] = savedData.scores[user] + 1;
    } else {
      savedData.scores[user] = 1;
    }
    await db.execute(
      /* sql */`INSERT INTO what_capital_scores (username, score) VALUES (?, 1)
       ON DUPLICATE KEY UPDATE score = score + 1`,
      [user]
    );
  } else {
    console.log("what_capital: skipping answer from admin");
  }
};

const pickNewCapital = async () => {
  const capital = randomFromArray(capitals);
  const flagUrl = `https://static.stefanbohacek.com/images/flags/${capital.country.replace(
    / /g,
    "_"
  )}.png`;

  console.log("picking new capital", {
    capital,
    flagUrl,
  });

  savedData.capital = capital.capital;
  savedData.country = capital.country;

  const imgData = await downloadFileAsBase64(flagUrl);

  let altText = capital.flag_description;

  if (capital.flag_description.length > 1000) {
    altText = capital.flag_description.slice(0, 997) + "...";
  }

  await mastodon.postImage(
    {
      status:
        "What is the capital of this country or territory? #quiz #geography #flags #country",
      image: imgData,
      alt_text: `An unspecified country flag: ${altText}`,
    },
    async (error, data) => {
      console.log("question posted", data.id);
      savedData.current_question = data.id;
      await db.execute(
        /* sql */`INSERT INTO what_capital_question (id, country, capital, current_question) VALUES (1, ?, ?, ?)
         ON DUPLICATE KEY UPDATE country = VALUES(country), capital = VALUES(capital), current_question = VALUES(current_question)`,
        [savedData.country, savedData.capital, data.id]
      );
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

  console.log("checking answer...", { answer, correctAnswer });
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
  const botUsername = "what_capital";

  if (from === botUsername) return;

  const status = fullMessage.data.status || fullMessage.data;

  console.log(
    `new ${status.visibility} message from ${from}: ${messageText}`,
    fullMessage
  );

  const mentions = status.mentions?.map(
    (mention) => mention.username
  );

  if (!mentions.includes(botUsername)) return;

  let replyMessage = "";

  if (
    status.visibility === "public" ||
    status.visibility === "unlisted"
  ) {
    const inReplyToId = status.in_reply_to_id;

    if (savedData.current_question !== inReplyToId) {
      replyMessage = `Please make sure to reply directly to the latest question: https://stefanbohacek.online/@what_capital/${savedData.current_question}`;
    } else {
      if (checkAnswer(messageText)) {
        await updateScores(from);
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

  console.log(`reply: ${replyMessage}`);
  mastodon.reply(fullMessage, replyMessage);
};

export { reply, clients };
