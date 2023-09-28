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

  const apiURL = "http://api.open-notify.org/iss-now.json";

  const response = await fetch(botwikiURL);
  const data = await response.json();

  if (data && data.length) {
    const bot = {
      name: he.decode(data[0].title.rendered),
      description: he.decode(data[0].excerpt.rendered),
      url: data[0].link,
      tags: data[0].tags_full,
    };

    console.log(bot);

    let status = `${bot.description}\n\n${bot.url}`;

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
