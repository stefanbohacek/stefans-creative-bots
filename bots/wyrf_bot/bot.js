import pluralize from "pluralize";
import animals from "./../../data/animals.js";
import randomFromArray from "./../../modules/random-from-array.js";
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.WYRF_BOT_ACCESS_TOKEN_SECRET,
    api_url: process.env.MASTODON_API_URL,
  });

  const options = [];
  const twoAnimals = randomFromArray(animals, 2);
  const [animal1, animal2]  = twoAnimals;

  options.push(`100 ${pluralize(animal2)}`);
  options.push(`1 ${animal1}`);

  const status = `Would you rather fight 100 ${animal1}-sized ${pluralize(
    animal2
  )} or 1 ${animal2}-sized ${animal1}?\n\n#poll`;

  console.log({ status, options });
  mastodon.postPoll(status, options);
};

export default botScript;
