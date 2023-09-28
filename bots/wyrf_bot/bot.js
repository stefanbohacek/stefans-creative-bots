import pluralize from "pluralize";
import animals from "./../../data/animals.js";
import randomFromArray from "./../../modules/random-from-array.js";

const botScript = async () => {
  const options = [],
    twoAnimals = randomFromArray(animals, 2),
    animal1 = twoAnimals[0],
    animal2 = twoAnimals[1];

  options.push(`100 ${pluralize(animal2)}`);
  options.push(`1 ${animal1}`);

  const tweetText = `Would you rather fight 100 ${animal1}-sized ${pluralize(
    animal2
  )} or 1 ${animal2}-sized ${animal1}?`;

  console.log({ tweetText, options });

  //  twitter.pollLegacy(
  //    tweetText,
  //    options
  // ).then((tweet) => {
  //    console.log(`https://twitter.com/${ tweet.user.screen_name }/status/${ tweet.id_str }`);
  //  });
};

export default botScript;
