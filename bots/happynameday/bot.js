import mastodonClient from "./../../modules/mastodon/index.js";
import fetch from "node-fetch";
import pluralize from "pluralize";
import oxfordComma from "./../../modules/oxford-comma.js";

// Made with Nameday API
// https://nameday.abalin.net/

const botScript = async () => {
  await (async () => {
    try {
      const mastodon = new mastodonClient({
        access_token: process.env.HAPPY_NAME_DAY_BOT_MASTODON_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      const resp = await fetch(
        "https://nameday.abalin.net/api/V2/today/New_York"
      );
      const respJSON = await resp.json();

      console.log(respJSON);

      if (respJSON.data) {
        const excluded = ["n/a", "2. svátek vánoční"];
        let nameDays = [];

        for (let country in respJSON.data) {
          if (country !== "ru") {
            nameDays.push(
              ...respJSON.data[country]
                .split(",")
                .filter((name) => !excluded.some((str) => name.includes(str)))
            );
          }
        }

        // nameDays = [...new Set(nameDays)].map(name => pluralize(name.trim()));
        // nameDays = [...new Set(nameDays.map((name) => pluralize(name.trim())))].sort();

        nameDays = [
          ...new Set(nameDays.map((name) => pluralize(name.trim()))),
        ].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));

        const status = `Happy name day to all the ${oxfordComma(
          nameDays
        )}!\n\n#nameDay #HappyNameDay`;
        // console.log(status);

        mastodon.post({
          status,
        });
      }
    } catch (error) {
      console.log(`Happy Name Day bot: error`, error);
    }
  })();
};

export default botScript;
