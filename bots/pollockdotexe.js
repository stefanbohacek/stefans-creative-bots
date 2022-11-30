const helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require( __dirname + '/../helpers/cron-schedules.js' ),
      generators = {
        pollock: require(__dirname + '/../generators/pollock.js')
      },    
      TwitterClient = require(__dirname + '/../helpers/twitter.js'),    
      mastodonClient = require(__dirname + '/../helpers/mastodon.js'), 
      tumblrClient = require(__dirname + '/../helpers/tumblr.js');

const twitter = new TwitterClient( {
  consumer_key: process.env.POLLOCKDOTEXE_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.POLLOCKDOTEXE_TWITTER_CONSUMER_SECRET,
  access_token: process.env.POLLOCKDOTEXE_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.POLLOCKDOTEXE_TWITTER_ACCESS_TOKEN_SECRET
} );

const mastodon = new mastodonClient( {
   access_token: process.env.POLLOCKDOTEXE_MASTODON_ACCESS_TOKEN,
   api_url: process.env.POLLOCKDOTEXE_MASTODON_API
} );

module.exports = {
  active: true,
  name: 'pollock.exe',
  description: 'A robot painter, very Pollock-like.',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2018/06/pollock.exe.png',
  about_url: 'https://botwiki.org/bot/pollock-exe/',
  links: [
    {
      title: 'Follow on Twitter',
      url: 'https://twitter.com/pollockdotexe'
    },
    {
      title: 'Follow on Mastodon',
      url: 'https://botsin.space/@pollockdotexe'
    }
  ],
  interval: cronSchedules.EVERY_SIX_HOURS,
  script: function(){
    const statusText = '🎨🤖 #generativeart',
          options = {
            width: 1184,
            height: 506,
          };

    generators.pollock( options, function( err, imageDataGIF, imageDataStatic ){
      twitter.postImage({
        status: statusText,
        image: imageDataStatic,
        alt_text: 'Animated generative art in the style of Jackson Pollock.',
      }, function( err, data, response ){
        if ( data && data.id_str ){
          twitter.postImage({
            status: statusText,
            image: imageDataGIF,
            alt_text: 'Generative art in the style of Jackson Pollock',
            in_reply_to_status_id: data.id_str
          });    
        }
      });

      mastodon.postImage({
        status: statusText,
        image: imageDataStatic,
        alt_text: 'Animated generative art in the style of Jackson Pollock.',
      }, function( err, data, response ){
        if ( data && data.id ){
          mastodon.postImage({
            status: statusText,
            image: imageDataGIF,
            alt_text: 'Generative art in the style of Jackson Pollock',
            in_reply_to_id: data.id
          });
        }
      });  
    } ); 


  } 
};