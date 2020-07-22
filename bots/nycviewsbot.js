const helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require( __dirname + '/../helpers/cron-schedules.js' ),
      windyAPI = require(__dirname + '/../helpers/windy.js'),
      TwitterClient = require(__dirname + '/../helpers/twitter.js'),    
      mastodonClient = require(__dirname + '/../helpers/mastodon.js'), 
      tumblrClient = require(__dirname + '/../helpers/tumblr.js');

const twitter = new TwitterClient( {
  consumer_key: process.env.NYCVIEWSBOT_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.NYCVIEWSBOT_TWITTER_CONSUMER_SECRET,
  access_token: process.env.NYCVIEWSBOT_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.NYCVIEWSBOT_TWITTER_ACCESS_TOKEN_SECRET
} );

const mastodon = new mastodonClient( {
  access_token: process.env.NYCVIEWSBOT_MASTODON_ACCESS_TOKEN,
  api_url: process.env.NYCVIEWSBOT_MASTODON_API
} );

const tumblr = new tumblrClient( {
  tumblr_name: process.env.NYCVIEWSBOT_TUMBLR_BLOG_NAME,
  consumer_key: process.env.NYCVIEWSBOT_TUMBLR_API_KEY,
  consumer_secret: process.env.NYCVIEWSBOT_TUMBLR_API_SECRET,
  token: process.env.NYCVIEWSBOT_TUMBLR_API_ACCESS_TOKEN,
  token_secret: process.env.NYCVIEWSBOT_TUMBLR_API_ACCESS_SECRET
} );

module.exports = {
  active: true,
  name: 'Views from New York',
  description: 'Views from the great city of NYC 🗽',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2020/03/views-from-new-york-1585658499.png',
  about_url: 'https://botwiki.org/bot/views-from-new-york/',
  links: [
    {
      title: 'Follow on Twitter',
      url: 'https://twitter.com/nycviewsbot'
    },
    // {
    //   title: 'Follow on botsin.space',
    //   url: 'https://botsin.space/@nycviewsbot'
    // },
    // {
    //   title: 'Follow on Tumblr',
    //   url: 'https://nycviewsbot.tumblr.com/'
    // }
  ],
  interval: cronSchedules.EVERY_SIX_HOURS,
  script: function(){
    const location = {
      lat: 40.712776,
      long: -74.005974,
      radius: 15
    };
    console.log( location );
    
    windyAPI.getWebcamPicture( process.env.NYCVIEWSBOT_WINDY_API_KEY, location, function( err, data ){

      if ( data && data.title && data.location){
        console.log( data )
        const webcamTitle = data.title;
        const windyWebcamUrl = `📷 https://www.windy.com/-Webcams/United-States/Minnesota/Delhi/New-York/webcams/${data.id}`;
        const googleMapsUrl = `🗺️ https://www.google.com/maps/search/${data.location.latitude},${data.location.longitude}`;

        let text = `${webcamTitle}\n${windyWebcamUrl}\n${googleMapsUrl}`;

        helpers.loadImage( data.image.current.preview, function( err, imgData ){
          if ( err ){
            console.log( err );     
          }
          else{
            twitter.postImage( text, imgData );
            mastodon.postImage( text, imgData );
            tumblr.postImage( text, imgData );
          }
        } ); 
      }
    } );  
  }
};