import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";
import openings from "./../../data/openings.js";
import nlp from "compromise";

const botScript = async () => {
  await (async () => {
    const botID = "@linkedin_openings";

    try {
      const mastodon = new mastodonClient({
        access_token: process.env.LINKEDIN_OPENINGS_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      let opening = randomFromArray(openings);
      const doc = nlp(opening);
      const verbs = doc.verbs();

      console.log("opening", opening);
      console.log("verbs", verbs);
      const verbsJson = verbs.json();

      let hasPastTense = false;
      verbsJson.forEach((verb) => {
        if (
          verb.terms &&
          verb.terms.some(
            (term) => term.tags && term.tags.includes("PastTense")
          )
        ) {
          hasPastTense = true;
        }
      });

      // console.log("hasPastTense", hasPastTense);
      // console.log("verbsJson", JSON.stringify(verbsJson, null, 4));
      // const tense = verbs.tense();
      // console.log("tense", tense);

      opening = `${opening.trim()} This ${
        hasPastTense ? "opened up" : "opens up"
      } a business opportunity.`;
      console.log(opening);

      mastodon.post({
        status: opening,
      });
    } catch (error) {
      console.log(`${botID} error`, error);
    }
  })();
};

export default botScript;
