import fetch from 'node-fetch';
import mastodonClient from "./../../modules/mastodon/index.js";

const botID = "wikipediatopedits";

const botScript = async () => {
 await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.WIKIPEDIATOPEDITS_BOT_ACCESS_TOKEN_SECRET,
        api_url: process.env.BOTSINSPACE_API_URL,
      });


      let dateYesterday = new Date();
      dateYesterday.setDate(dateYesterday.getDate() - 1);
      const date = dateYesterday.toISOString().split("T")[0].replaceAll("-", "");
      const url = `https://tools.stefanbohacek.dev/wikipedia-top-edits/?date=${date}`;
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
