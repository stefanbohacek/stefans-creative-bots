import fetch from 'node-fetch';
import mastodonClient from "./../../modules/mastodon/index.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const botScript = async () => {
 await (async () => {
    try {
      const mastodon = new mastodonClient({
        // access_token: process.env.MASTODON_TEST_TOKEN,
        access_token: process.env.WIKIPEDIATOPEDITS_BOT_ACCESS_TOKEN_SECRET,
        api_url: process.env.MASTODON_API_URL,
      });

      let dateYesterday = new Date();
      dateYesterday.setDate(dateYesterday.getDate() - 1);
      const year = dateYesterday.getFullYear();
      const month = String(dateYesterday.getMonth() + 1).padStart(2, "0");
      const day = String(dateYesterday.getDate()).padStart(2, "0");
      const date = `${year}${month}${day}`;
      const url = `https://tools.stefanbohacek.com/wikipedia-top-edits/?date=${date}`;
      console.log(url);

      const response = await fetch(url);
      const data = await response.json();

      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      let dateYesterdayFormatted = dateYesterday.toLocaleDateString('en-us', options);

      const status = `${dateYesterdayFormatted}\n\n` + data.map(item => `- ${item.title}: ${item.revisions} revisions ${item.url}`).join('\n') + '\n\n#wikipedia #stats';
      
      mastodon.post({
        status,
      });
    } catch (error) {
      console.log(`${botID} error`, error);
    }
  })();
}

export default botScript;
