const helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require( __dirname + '/../helpers/cron-schedules.js' ),
      emoji = require( __dirname + '/../data/emoji.js' ),
      TwitterClient = require(__dirname + '/../helpers/twitter.js'),    
      mastodonClient = require(__dirname + '/../helpers/mastodon.js');

const twitter = new TwitterClient( {
  consumer_key: process.env.EMOJI__POLLS_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.EMOJI__POLLS_TWITTER_CONSUMER_SECRET,
  access_token: process.env.EMOJI__POLLS_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.EMOJI__POLLS_TWITTER_ACCESS_TOKEN_SECRET
}, true );

const mastodon = new mastodonClient( {
   access_token: process.env.EMOJI__POLLS_MASTODON_ACCESS_TOKEN,
   api_url: process.env.EMOJI__POLLS_MASTODON_API
} );

module.exports = {
  active: true,
  name: '@emoji__polls',
  description: 'Choose your favorite emoji!',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2018/02/emoji__polls-v3.png',
  about_url: 'https://botwiki.org/bot/emoji__polls/',
  links: [
    {
      title: 'Follow on Twitter',
      url: 'https://twitter.com/emoji__polls'
    },
    // {
    //   title: 'Follow on botsin.space',
    //   url: 'https://botsin.space/@emoji__polls'
    // }
  ],
  interval: cronSchedules.EVERY_SIX_HOURS,
  script: function(){
    let options = [];

    for (let i = 0; i < 4; i++){
      emoji.sort(function(){return Math.round(Math.random());});
      options.push(emoji.pop());
    }
    
    const text = options.join(' ');
    console.log( { text, options } );
    
    twitter.pollLegacy( text, options );
    mastodon.poll( text, options );

    // const optionsObj = {
    //   status: helpers.randomFromArray( [
    //     'Vote!',
    //     'Vote now!',
    //     'What do you think?'
    //   ] ),
    //   poll: {
    //     options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], // a list of options
    //     expires_in: 3600, // duration in seconds
    //     // multiple: false, // allow multiple answers
    //     // hide_totals: false // hide vote counts until the poll ends
    //   }, 
    //   // spoiler_text: 'Spoiler!'
    // };
    // mastodon.poll( optionsObj );
  }
};




