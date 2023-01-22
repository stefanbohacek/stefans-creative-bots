const helpers = require(__dirname + '/../helpers/helpers.js'),
cronSchedules = require(__dirname + '/../helpers/cron-schedules.js'),
request = require( 'request' ),
TwitterClient = require(__dirname + '/../helpers/twitter.js'),    
mastodonClient = require(__dirname + '/../helpers/mastodon.js'), 
tumblrClient = require(__dirname + '/../helpers/tumblr.js');

const twitter = new TwitterClient({
  consumer_key: process.env.INTROSPECTORBOT_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.INTROSPECTORBOT_TWITTER_CONSUMER_SECRET,
  access_token: process.env.INTROSPECTORBOT_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.INTROSPECTORBOT_TWITTER_ACCESS_TOKEN_SECRET
});

// const mastodon = new mastodonClient({
//   access_token: process.env.INTROSPECTORBOT_MASTODON_ACCESS_TOKEN,
//   api_url: process.env.INTROSPECTORBOT_MASTODON_API
// });

// const tumblr = new tumblrClient({
//   tumblr_name: process.env.INTROSPECTORBOT_TUMBLR_BLOG_NAME,  
//   consumer_key: process.env.INTROSPECTORBOT_TUMBLR_CONSUMER_KEY,
//   consumer_secret: process.env.INTROSPECTORBOT_TUMBLR_CONSUMER_SECRET,
//   token: process.env.INTROSPECTORBOT_TUMBLR_CONSUMER_TOKEN,
//   token_secret: process.env.INTROSPECTORBOT_TUMBLR_CONSUMER_TOKEN_SECRET
// });

module.exports = {
  active: true,
  name: '@introspectorbot',
  description: 'A bot that looks at itself',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2018/02/Introspectorbot.png',
  about_url: 'https://botwiki.org/bot/introspectorbot/',
  links: [
    // {
    //   title: 'Follow on Mastodon',
    //   url: 'TODO'
    // },
    // {
    //   title: 'Follow on Tumblr',
    //   url: 'TODO'
    // },
    {
      title: 'Follow on Twitter',
      url: 'https://twitter.com/INTROSPECTORBOT'
    }
  ],
  interval: cronSchedules.EVERY_DAY_MORNING,
  script: () => {
    const url = `https://api.screenshotmachine.com?key=${ process.env.SCREENSHOTMACHINE_API_KEY }&url=https%3A%2F%2Ftwitter.com%2Fintrospectorbot&dimension=1024x768&cacheLimit=0&delay=3000`
    
    request( { url: url, encoding: null }, function ( err, res, body ) {
      if ( !err && res.statusCode == 200 ) {
        // let b64content = 'data:' + res.headers['content-type'] + ';base64,';
        const imageData = body.toString( 'base64' );
        
        const statusText = '';

        twitter.postImage({
          status: statusText,
          image: imageData,
          alt_text: 'Animated GIF of rain.',
        });
        
        // mastodon.postImage({
        //   status: statusText,
        //   image: imageData,
        //   alt_text: 'Animdated GIF of rain.',
        // });
        
        // tumblr.postImage(statusText, imageData);        
        
      } else {
        console.log( 'ERROR:', err );
      }
    } );       
  }
};