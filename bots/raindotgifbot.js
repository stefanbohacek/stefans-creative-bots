const helpers = require(__dirname + '/../helpers/helpers.js'),
      generators = {
        rain: require(__dirname + '/../generators/rain.js'),
      },    
      TwitterClient = require(__dirname + '/../helpers/twitter.js'),    
      mastodonClient = require(__dirname + '/../helpers/mastodon.js'), 
      tumblrClient = require(__dirname + '/../helpers/tumblr.js');

const twitter = new TwitterClient( {
  consumer_key: process.env.RAINDOTGIFBOT_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.RAINDOTGIFBOT_TWITTER_CONSUMER_SECRET,
  access_token: process.env.RAINDOTGIFBOT_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.RAINDOTGIFBOT_TWITTER_ACCESS_TOKEN_SECRET
} );

const mastodon = new mastodonClient( {
  access_token: process.env.RAINDOTGIFBOT_MASTODON_ACCESS_TOKEN,
  api_url: process.env.RAINDOTGIFBOT_MASTODON_API
} );

const tumblr = new tumblrClient( {
  tumblr_name: process.env.RAINDOTGIFBOT_TUMBLR_BLOG_NAME,  
  consumer_key: process.env.RAINDOTGIFBOT_TUMBLR_CONSUMER_KEY,
  consumer_secret: process.env.RAINDOTGIFBOT_TUMBLR_CONSUMER_SECRET,
  token: process.env.RAINDOTGIFBOT_TUMBLR_CONSUMER_TOKEN,
  token_secret: process.env.RAINDOTGIFBOT_TUMBLR_CONSUMER_TOKEN_SECRET
} );

module.exports = function(){
  const statusText = helpers.randomFromArray([
          '🌧️',
          '🌧️🌧️',
          '🌧️🌧️🌧️'
        ]),
        options = {
          width: 640,
          height: 480,
        };

  generators.rain( options, function( err, imageData ){
    twitter.postImage( statusText, imageData );
    mastodon.postImage( statusText, imageData );      
    tumblr.postImage( statusText, imageData );        
  } );
};