import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";

const botID = "arcade";

const botScript = async () => {
  try {
    await (async () => {
      const mastodon = new mastodonClient({
        access_token: process.env.ARCADE_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      const resp = await fetch(
        "https://archive.org/advancedsearch.php?q=collection:internetarcade&rows=10000&page=1&output=json",
      );

      const respJSON = await resp.json();

      if (respJSON?.response?.docs) {
        const item = randomFromArray(respJSON?.response?.docs);
        // const item = respJSON?.response?.docs.filter(i => i.title.includes("Tsurikko Penta"))[0];
        // console.log(item);
        const url = `https://archive.org/details/${item.identifier}`;
        let status = `Go play ${item.title.split("(")[0].trim()}`;
        if (item.year) {
          status += ` (${item.year})`;
        }
        if (item.creator) {
          status += ` by ${item.creator.split("(")[0].trim()}`;
        }
        status += `!\n\n${url}\n\n#arcade #videogames #InternetArchive`;
        console.log(status);

        mastodon.post({
          status,
        });
      }

      return true;
    })();
  } catch (error) {
    console.log(`@${botID} error:`, error);
  }
};

export default botScript;
