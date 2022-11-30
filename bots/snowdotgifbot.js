const helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require(__dirname + '/../helpers/cron-schedules.js'),
      generators = {
        snow: require(__dirname + '/../generators/snow.js'),
      },    
      TwitterClient = require(__dirname + '/../helpers/twitter.js'),    
      mastodonClient = require(__dirname + '/../helpers/mastodon.js'), 
      tumblrClient = require(__dirname + '/../helpers/tumblr.js');

const mastodon = new mastodonClient({
  access_token: process.env.SNOWDOTGIFBOT_MASTODON_ACCESS_TOKEN,
  api_url: process.env.SNOWDOTGIFBOT_MASTODON_API
});


module.exports = {
  active: true,
  name: 'snow.gif',
  description: '🌨️',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2022/11/snowdotgif-botsinspace.png',
  about_url: 'https://botwiki.org/bot/snow-gif/',
  links: [
    {
      title: 'Follow on Mastodon',
      url: 'https://botsin.space/@snow'
    }
  ],
  interval: cronSchedules.EVERY_SIX_HOURS,
  script: () => {
    const statusText = helpers.randomFromArray([
            '🌨️ #snow',
            '🌨️🌨️ #snow',
            '🌨️🌨️🌨️ #snow'
          ]),
          options = {
            width: 640,
            height: 480,
          };

    generators.snow(options, (err, imageData) => {
      mastodon.postImage({
        status: statusText,
        image: imageData,
        alt_text: 'Animated GIF of snow.',
      });      
    });
  }
};