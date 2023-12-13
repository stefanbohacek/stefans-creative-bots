import fetch from "node-fetch";
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  await (async () => {
    try {
      // const threadsPostUrl = "https://mastodon.social/@Gargron/1";
      const threadsPostUrl = "https://www.threads.net/@zuck/post/C0zXcQmxO77";

      const fetchOptions = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.THREADS_FEDERATED_SEARCH_TOKEN}`,
        },
      };

      const resp = await fetch(
        `https://stefanbohacek.online/api/v2/search?resolve=true&q=${threadsPostUrl}`,
        fetchOptions
      );

      const respJson = await resp.json();
      let areThreadsFederatedYet = false;

      if (respJson && respJson.statuses && respJson.statuses.length) {
        areThreadsFederatedYet = true;

        const mastodon = new mastodonClient({
          access_token: process.env.THREADS_FEDERATED_BOT_MASTODON_ACCESS_TOKEN,
          api_url: process.env.BOTSINSPACE_API_URL,
        });

        mastodon.post({
          status: `Threads are now federated! ${threadsPostUrl}\n\n#fediverse #threads #activitypub`,
        });
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
