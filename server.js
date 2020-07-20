if ( !process.env.PROJECT_NAME || !process.env.PROJECT_ID ){
  require( 'dotenv' ).config();
}

const path = require( 'path' ),
      express = require( 'express' ),
      app = require(__dirname + '/app.js'),
      CronJob = require( 'cron' ).CronJob,
      cronSchedules = require( __dirname + '/helpers/cron-schedules.js' );

const bots = [
  {
    name: 'Views from New York',
    description: 'Views from the great city of NYC 🗽',
    thumbnail: 'https://botwiki.org/wp-content/uploads/2020/03/views-from-new-york-1585658499.png',
    about_url: 'https://botwiki.org/bot/views-from-new-york/',
    script: 'bots/nycviewsbot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: '@southpoleviews',
    description: 'Views from the South Pole.',
    thumbnail: 'https://botwiki.org/wp-content/uploads/2018/08/-southpoleviews.png',
    about_url: 'https://botwiki.org/bot/southpoleviews/',
    script: 'bots/southpoleviews.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: 'rain.gif',
    description: '🌧🌧🌧',
    thumbnail: 'https://botwiki.org/wp-content/uploads/2018/07/rain.gif.png',
    about_url: 'https://botwiki.org/bot/rain-gif/',
    script: 'bots/raindotgifbot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: 'Hello, world!',
    description: 'Hello from around the world',
    thumbnail: 'https://botwiki.org/wp-content/uploads/2019/02/hello--world-.png',
    about_url: 'https://botwiki.org/bot/hello-world/',
    script: 'bots/helloworld__bot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: 'pollock.exe',
    description: 'A robot painter, very Pollock-like.',
    thumbnail: 'https://botwiki.org/wp-content/uploads/2018/06/pollock.exe.png',
    about_url: 'https://botwiki.org/bot/pollock-exe/',
    script: 'bots/pollockdotexe.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: '@hypno__bot',
    description: 'Your eyelids are getting heavy...',
    thumbnail: 'https://botwiki.org/wp-content/uploads/2018/04/hypno__bot.png',
    about_url: 'https://botwiki.org/bot/hypno__bot/',
    script: 'bots/hypno__bot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: '@last100bills',
    description: 'Breakdown of the last 100 bills introduced in the US government.',
    thumbnail: 'https://botwiki.org/wp-content/uploads/2018/05/last100bills-1.png',
    about_url: 'https://botwiki.org/bot/last100bills/',
    script: 'bots/last100bills.js',
    interval: cronSchedules.EVERY_DAY_MORNING
  },
  {
    name: 'Would you rather fight?',
    description: 'If you *had* to choose.',
    thumbnail: '',
    about_url: 'https://twitter.com/wyrf_bot',
    script: 'bots/wyrf_bot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: '@emoji__polls?',
    description: 'Choose your favorite emoji!',
    thumbnail: 'https://botwiki.org/wp-content/uploads/2018/02/emoji__polls-v3.png',
    about_url: 'https://botwiki.org/bot/emoji__polls/',
    script: 'bots/emoji__polls.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  }    
];

bots.forEach( function( bot ){
  if ( !bot.name ){
    bot.name = bot.script.replace( 'bots/', '' ).replace( '.js', '' );
  }
} );

app.set( 'bots', bots );

/** For testing. **/
// const bot = require( __dirname + '/bots/emoji__polls.js' );
 //bot();

console.log( '🕒 server time: ', ( new Date() ).toTimeString() );

let listener = app.listen( process.env.PORT, function(){
  if ( bots && bots.length > 0 ){
    bots.forEach( function( bot ){
      if ( bot.interval ){
        let botInterval;

        for (const schedule in cronSchedules) {
          if ( cronSchedules[schedule] === bot.interval ){
            botInterval = schedule;
          }
        }
        
        if ( botInterval.length === 0 ){
          botInterval = bot.interval;
        }

        console.log( `⌛ scheduling ${ bot.script }: ${ botInterval }` );
        const script = require( __dirname + '/' + bot.script );

        const job = new CronJob( bot.interval, function() { script() } );
        job.start();
        console.log( '📅 next run:', job.nextDates().fromNow() );
      }
    } );

    console.log( `🤖 your bot${ bots.length === 1 ? ' has' : 's have' } been scheduled` );
  } else {
    console.log( '🚫 no bots to schedule' );
  }
} );
