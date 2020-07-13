const helpers = require(__dirname + '/../helpers/helpers.js'),
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

module.exports = function(){
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
  } );  
};