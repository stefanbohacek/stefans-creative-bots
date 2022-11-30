const pluralize = require('pluralize'),
      helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require(__dirname + '/../helpers/cron-schedules.js'),
      animals = require(__dirname + '/../data/animals.js'),
      TwitterClient = require(__dirname + '/../helpers/twitter.js');

const twitter = new TwitterClient({
  consumer_key: process.env.WYRF_BOT_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.WYRF_BOT_TWITTER_CONSUMER_SECRET,
  access_token: process.env.WYRF_BOT_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.WYRF_BOT_TWITTER_ACCESS_TOKEN_SECRET
}, true);

module.exports = {
  active: true,
  name: 'Would you rather fight?',
  description: 'If you *had* to choose.',
  thumbnail: '',
  // about_url: 'https://twitter.com/wyrf_bot',
  links: [
    {
      title: 'Follow on Twitter',
      url: 'https://twitter.com/wyrf_bot'
    }
  ],
  interval: cronSchedules.EVERY_SIX_HOURS,
  script: () => {
    const options = [],
          twoAnimals = helpers.randomFromArrayUnique(animals, 2),
          animal1 = twoAnimals[0],
          animal2 = twoAnimals[1];

    options.push(`100 ${ pluralize(animal2) }`);
    options.push(`1 ${ animal1 }`);

    var tweetText = `Would you rather fight 100 ${ animal1 }-sized ${ pluralize(animal2) } or 1 ${ animal2}-sized ${ animal1 }?`;

    console.log({ tweetText, options });

    twitter.pollLegacy(
      tweetText,
      options
   ).then((tweet) => {
      console.log(`https://twitter.com/${ tweet.user.screen_name }/status/${ tweet.id_str }`);
    });    
  }
};
