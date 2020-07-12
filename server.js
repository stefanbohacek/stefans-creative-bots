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
    script: '/bots/nycviewsbot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: '@southpoleviews',
    description: 'Views from the South Pole.',
    thumbnail: 'https://botwiki.org/wp-content/uploads/2018/08/-southpoleviews.png',
    about_url: 'https://botwiki.org/bot/southpoleviews/',
    script: '/bots/southpoleviews.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: 'rain.gif',
    description: '',
    thumbnail: '',
    // about_url: '',
    script: '/bots/raindotgifbot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: '',
    description: '',
    thumbnail: '',
    about_url: '',
    script: '/bots/helloworld__bot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    name: '',
    description: '',
    thumbnail: '',
    about_url: '',
    script: '/bots/pollockdotexe.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  // {
  // name: '',
  // description: '',
  // thumbnail: '',
  // preview: [
  //   '',
  //   ''
  // ],
  // about_url: '',
  // script: '/bots/hypno__bot.js',
  //   interval: cronSchedules.EVERY_SIX_HOURS
  // },
  {
    name: '',
    description: '',
    thumbnail: '',
    about_url: '',
    script: '/bots/last100bills.js',
    interval: cronSchedules.EVERY_DAY_MORNING
  },
  {
    name: '',
    description: '',
    thumbnail: '',
    about_url: '',
    script: '/bots/wyrf_bot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  }  
];

bots.forEach( function( bot ){
  if ( !bot.name ){
    bot.name = bot.script.replace( '/bots/', '' ).replace( '.js', '' );
  }
} );

app.set( 'bots', bots );

/** For testing. **/
// const bot = require( __dirname + '/bots/southpoleviews.js' );
// bot();

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
        const script = require( __dirname + bot.script );

        ( new CronJob( bot.interval, function() {
          script();
        } ) ).start();        
      }
    } );

    console.log( `🤖 your bot${ bots.length === 1 ? ' has' : 's have' } been scheduled` );
  } else {
    console.log( '🚫 no bots to schedule' );
  }
} );
