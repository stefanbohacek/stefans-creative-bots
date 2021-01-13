const request = require( 'request' ),
      helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require( __dirname + '/../helpers/cron-schedules.js' ),
      TwitterClient = require(__dirname + '/../helpers/twitter.js');

const twitter = new TwitterClient( {
  consumer_key: process.env.RANDOM_FROM_BOTWIKI_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.RANDOM_FROM_BOTWIKI_TWITTER_CONSUMER_SECRET,
  access_token: process.env.RANDOM_FROM_BOTWIKI_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.RANDOM_FROM_BOTWIKI_TWITTER_ACCESS_TOKEN_SECRET
} );

module.exports = {
  active: true,
  name: '@botwikirandom',
  description: 'Explore Botwiki one bot at a time.',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2021/01/botwikirandom.png',
  about_url: 'https://botwiki.org/bot/random-bots-from-botwiki/',
  links: [
    {
      title: 'Follow on Twitter',
      url: 'https://twitter.com/botwikirandom'
    }
  ],
  interval: cronSchedules.EVERY_THREE_HOURS,
  script: function(){
    console.log( 'picking a random bot from Botwiki... ' );

    const botwikiURL = 'https://botwiki.org/wp-json/wp/v2/bot?filter[orderby]=rand&filter[posts_per_page]=1';

    request( botwikiURL, function ( error, response, body ){
      let bodyParsed;

      try{
        bodyParsed = JSON.parse( body );
      } catch( err ){
        console.log( 'ERROR: unable to parse data', err );
        return false;
      }
      
      // console.log( bodyParsed[0] )

      if ( bodyParsed && bodyParsed.length ){
        const bot = {
          name: bodyParsed[0].title.rendered,
          description: bodyParsed[0].excerpt.rendered,
          url: bodyParsed[0].link,
          tags: bodyParsed[0].tags_full,
        };

        console.log( bot );

        let text = `${bot.description}\n\n${bot.url}`;

        if ( bot.tags && bot.tags.indexOf( 'generative' ) != -1 && bot.tags.indexOf( 'images' ) != -1 ){
            text += ' #generativeart';    
        } 
        
        twitter.tweet( text );
        
      }
    } );
  }
};
