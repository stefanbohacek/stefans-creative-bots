import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/randomFromArray.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const botScript = async () => {
  try {
    await (async () => {
      const mastodon = new mastodonClient({
        access_token: process.env.MANUALS_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      const resp = await fetch(
        "https://archive.org/advancedsearch.php?q=collection:manualsplus&rows=20000&page=1&output=json",
      );

      const respJSON = await resp.json();

      if (respJSON?.response?.docs) {
        const item = randomFromArray(respJSON?.response?.docs);
        // console.log(item);
        const url = `https://archive.org/details/${item.identifier}`;
        // let status = `Go play ${item.title.split("(")[0].trim()}`;
        
        let status = `${item.title}`;
        
        if (item.year) {
          status += ` (${item.year})`;
        }
        
        status += `\n\n${url}`;
        
        if (item.description) {
          status += `\n\n${item.description}`;
        }
        
        // if (item.creator) {
        //   status += ` by ${item.creator.split("(")[0].trim()}`;
        // }

        status += `\n\n#manuals #InternetArchive`;
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
