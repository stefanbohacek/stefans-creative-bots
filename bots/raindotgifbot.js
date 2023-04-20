const helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require(__dirname + '/../helpers/cron-schedules.js'),
      generators = {
        rain: require(__dirname + '/../generators/rain.js'),
      },    
      TwitterClient = require(__dirname + '/../helpers/twitter.js'),    
      mastodonClient = require(__dirname + '/../helpers/mastodon.js'), 
      tumblrClient = require(__dirname + '/../helpers/tumblr.js');

const twitter = new TwitterClient({
  consumer_key: process.env.RAINDOTGIFBOT_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.RAINDOTGIFBOT_TWITTER_CONSUMER_SECRET,
  access_token: process.env.RAINDOTGIFBOT_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.RAINDOTGIFBOT_TWITTER_ACCESS_TOKEN_SECRET
});

const mastodon = new mastodonClient({
  access_token: process.env.RAINDOTGIFBOT_MASTODON_ACCESS_TOKEN,
  api_url: process.env.RAINDOTGIFBOT_MASTODON_API
});

const tumblr = new tumblrClient({
  tumblr_name: process.env.RAINDOTGIFBOT_TUMBLR_BLOG_NAME,  
  consumer_key: process.env.RAINDOTGIFBOT_TUMBLR_CONSUMER_KEY,
  consumer_secret: process.env.RAINDOTGIFBOT_TUMBLR_CONSUMER_SECRET,
  token: process.env.RAINDOTGIFBOT_TUMBLR_CONSUMER_TOKEN,
  token_secret: process.env.RAINDOTGIFBOT_TUMBLR_CONSUMER_TOKEN_SECRET
});

module.exports = {
  active: true,
  name: 'rain.gif',
  description: '🌧🌧🌧',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2018/07/rain.gif.png',
  about_url: 'https://botwiki.org/bot/rain-gif/',
  links: [
    {
      title: 'Follow on Mastodon',
      url: 'https://botsin.space/@rain'
    },
    {
      title: 'Follow on Tumblr',
      url: 'https://raindotgif.tumblr.com/'
    },
    {
      title: 'Twitter archive',
      url: 'https://twitter.com/raindotgifbot'
    }    
  ],
  interval: cronSchedules.EVERY_SIX_HOURS,
  script: () => {
    const statusText = helpers.randomFromArray([
            '🌧️ #rain #weather #gif',
            '🌧️🌧️ #rain #weather #gif',
            '🌧️🌧️🌧️ #rain #weather #gif'
          ]),
          options = {
            width: 640,
            height: 480,
          };

    generators.rain(options, (err, imageData) => {
//       twitter.postImage({
//         status: statusText,
//         image: imageData,
//         alt_text: 'Animated GIF of rain.',
//       });
      
      mastodon.postImage({
        status: statusText,
        image: imageData,
        alt_text: 'Animdated GIF of rain.',
      });

      // tumblr.postImage(statusText, imageData);        
    });
  }
};