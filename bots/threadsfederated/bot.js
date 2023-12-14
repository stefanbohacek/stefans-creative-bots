import fetch from "node-fetch";
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  await (async () => {
    try {
      let resp;
      let respJson;

      // const threadsPostUrl = "https://mastodon.social/@Gargron/1";
      const threadsPostUrl = "https://www.threads.net/@zuck/post/C0zXcQmxO77";

      const fetchOptions = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.THREADS_FEDERATED_SEARCH_TOKEN}`,
        },
      };

      resp = await fetch(
        `https://stefanbohacek.online/api/v2/search?resolve=true&q=${threadsPostUrl}`,
        fetchOptions
      );

      respJson = await resp.json();
      let areThreadsFederatedYet = false;

      if (respJson && respJson.statuses && respJson.statuses.length) {
        areThreadsFederatedYet = true;

        resp = await fetch(
          `https://botsin.space/api/v1/accounts/111574591896780570/statuses?limit=10&exclude_reblogs=true`,
          fetchOptions
        );

        respJson = await resp.json();

        if (respJson && respJson.length === 0) {
          // Check if bot already posted.

          const mastodon = new mastodonClient({
            access_token:
              process.env.THREADS_FEDERATED_BOT_MASTODON_ACCESS_TOKEN,
            api_url: process.env.BOTSINSPACE_API_URL,
          });

          mastodon.post({
            status: `Posts from Threads can now be seen in the fediverse. ${threadsPostUrl}\n\n#fediverse #threads #activitypub`,
          });
        }
      }

      console.log(
        "checking if Threads are federated yet...",
        areThreadsFederatedYet
      );
    } catch (error) {
      console.log("@threadsfederated error", error);
    }
  })();
};

export default botScript;
