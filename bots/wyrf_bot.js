const pluralize = require( 'pluralize' ),
      helpers = require( __dirname + '/../helpers/helpers.js' ),
      animals = require( __dirname + '/../data/animals.js' ),
      TwitterClient = require( __dirname + '/../helpers/twitter.js' );

const twitter = new TwitterClient( {
  consumer_key: process.env.WYRF_BOT_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.WYRF_BOT_TWITTER_CONSUMER_SECRET,
  access_token: process.env.WYRF_BOT_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.WYRF_BOT_TWITTER_ACCESS_TOKEN_SECRET
}, true );

module.exports = function(){
  const options = [],
        twoAnimals = helpers.randomFromArrayUnique( animals, 2 ),
        animal1 = twoAnimals[0],
        animal2 = twoAnimals[1];

  options.push( `100 ${ pluralize( animal2 ) }` );
  options.push( `1 ${ animal1 }` );

  var tweetText = `Would you rather fight 100 ${ animal1 }-sized ${ pluralize( animal2 ) } or 1 ${ animal2}-sized ${ animal1 }?`;

  console.log( { tweetText, options } );

  twitter.pollLegacy(
    tweetText,
    options
  ).then( function( tweet ){
    console.log( `https://twitter.com/${ tweet.user.screen_name }/status/${ tweet.id_str }` );
  } );
};
