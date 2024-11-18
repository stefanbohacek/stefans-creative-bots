import mastodonClient from "./../../modules/mastodon/index.js";
import fetch from 'node-fetch';

const queryWikipedia = async (query) => {
  console.log(`looking up "${query}...`);
  const wikipediaURL = `https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=info&inprop=url&format=json`;
  const resp = await fetch(wikipediaURL);
  const respJSON = await resp.json();
  let urls = [];

  if (respJSON && respJSON.query && respJSON.query.pages) {
    for (let pageId in respJSON.query.pages) {
      urls.push(respJSON.query.pages[pageId].canonicalurl);
    }
  }
  return urls;
};

const regex = /(?<=\[\[).+?(?=\]\])/gi;

const mastodon = new mastodonClient({
  access_token: process.env.MASTODON_TEST_TOKEN,
  api_url: process.env.MASTODON_API_URL,
});

const clients = { mastodon };

const reply = async (postID, from, messageText, fullMessage) => {
  console.log(
    `new ${fullMessage.data.status.visibility} message from ${from}: ${messageText}`
  );

  const statusVisibility = fullMessage.data.status.visibility;
  const inReplyToId = fullMessage.data.status.in_reply_to_id;
  let replyMessage = "";

  const matches = messageText.match(regex);
  
  if (matches && matches.length) {
    let urls = [];
    matches.forEach(async (query) => {
      const pages = await queryWikipedia(query);
      urls = [...urls, ...pages];
  
      console.log("all urls", urls);
  
      if (urls.length) {
        replyMessage = `Here's what I found:\n${urls.map(url => `\n- ${url}`)}`;
        console.log(`reply: ${replyMessage}`);
        mastodon.reply(fullMessage, replyMessage);
      }
    });
  }
};

export { reply, clients };
