const helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require( __dirname + '/../helpers/cron-schedules.js' ),
      generators = {
        spiral: require(__dirname + '/../generators/spiral.js')
      },    
      TwitterClient = require(__dirname + '/../helpers/twitter.js'),    
      mastodonClient = require(__dirname + '/../helpers/mastodon.js'), 
      tumblrClient = require(__dirname + '/../helpers/tumblr.js');

const twitter = new TwitterClient( {
  consumer_key: process.env.HYPNOBOT_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.HYPNOBOT_TWITTER_CONSUMER_SECRET,
  access_token: process.env.HYPNOBOT_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.HYPNOBOT_TWITTER_ACCESS_TOKEN_SECRET
} );

const mastodon = new mastodonClient( {
    access_token: process.env.HYPNOBOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.HYPNOBOT_MASTODON_API
  } );

module.exports = {
  active: true,
  name: '@hypno__bot',
  description: 'Your eyelids are getting heavy...',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2018/04/hypno__bot.png',
  about_url: 'https://botwiki.org/bot/hypno__bot/',
  links: [
    {
      title: 'Follow on Twitter',
      url: 'https://twitter.com/hypno__bot'
    }
  ],
  interval: cronSchedules.EVERY_SIX_HOURS,
  script: function(){
    const color = helpers.getRandomHex();

    const statusText = '',
          options = {
            color: color,
            background: helpers.shadeColor(helpers.invertColor( color ), 0.5),
            width: 640,
            height: 480,
          };

    generators.spiral( options, function( err, imageData ){
      twitter.postImage( statusText, imageData );
      mastodon.postImage( statusText, imageData );
    } );  
  }
};