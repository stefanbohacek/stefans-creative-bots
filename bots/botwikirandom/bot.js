import fetch from 'node-fetch';
import he from "he";
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.RANDOM_FROM_BOTWIKI_MASTODON_ACCESS_TOKEN,
    api_url: process.env.RANDOM_FROM_BOTWIKI_MASTODON_API,
  });

  console.log("picking a random bot from Botwiki... ");

  const botwikiURL =
    "https://botwiki.org/wp-json/wp/v2/bot?filter[orderby]=rand&filter[posts_per_page]=1";

  const response = await fetch(botwikiURL);
  const data = await response.json();

  const botUrlsMeta = data[0].meta.bot_url.split("\r\n");
  let botUrls;

  if (botUrlsMeta.length === 0){
    botUrls = "";
  } else if (botUrlsMeta.length === 1){
    botUrls = `\n\nFollow: ${botUrlsMeta[0]}`;
  } else {
    botUrls = `\n\nFollow:\n${botUrlsMeta.map(botUrl => `- ${botUrl}`).join("\n")}`;
  }

  if (data && data.length) {
    const bot = {
      name: he.decode(data[0].title.rendered),
      description: he.decode(data[0].excerpt.rendered),
      url: data[0].link,
      tags: data[0].tags_full,
    };

    console.log(bot);

    let status = `${bot.description}\n\n${bot.url}${botUrls}\n\n`;

    if (
      bot.tags &&
      bot.tags.indexOf("generative") != -1 &&
      bot.tags.indexOf("images") != -1
    ) {
      status += " #GenerativeArt";
    }

    status += " #bots #CreativeBots #CreativeCoding";

    mastodon.post({ status });
  }
};

export default botScript;
