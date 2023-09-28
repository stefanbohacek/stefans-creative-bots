/*
  This bot uses RiveScript to handle responses, see the rivescript/bartleby folder and learn more at rivescript.com.
*/

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import RiveScript from "rivescript";
import mastodonClient from "./../../modules/mastodon/index.js";

const bartleby = new RiveScript({ debug: false, _debug: false });

bartleby.debug = false;
bartleby.say = () => {};

bartleby
  .loadDirectory(__dirname + "/../../rivescript/bartleby")
  .then(loadingDone)
  .catch(loadingError);

function loadingDone(batchNum) {
  bartleby.sortReplies();
}

function loadingError(batchNum, error) {
  console.log("Error when loading files: ", batchNum, error);
}

const mastodon = new mastodonClient({
  access_token: process.env.BARTLEBY_MASTODON_ACCESS_TOKEN_SECRET,
  api_url: process.env.BARTLEBY_MASTODON_API,
});

const clients = { mastodon };

const reply = async (postID, from, messageText, fullMessage) => {
  console.log(
    `new ${fullMessage.data.status.visibility} message from ${from}: ${messageText}`
  );
  const messageTextLowercase = messageText.toLowerCase();
  const reply = await bartleby.reply("local-user", messageTextLowercase);
  console.log(`reply: ${reply}`);
  mastodon.reply(fullMessage, reply);
}

export {reply, clients};