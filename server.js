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
    script: '/bots/nycviewsbot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    script: '/bots/southpoleviews.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    script: '/bots/raindotgifbot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    script: '/bots/helloworld__bot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  {
    script: '/bots/pollockdotexe.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  },
  // {
  //   script: '/bots/hypno__bot.js',
  //   interval: cronSchedules.EVERY_SIX_HOURS
  // },
  {
    script: '/bots/last100bills.js',
    interval: cronSchedules.EVERY_DAY_MORNING
  },
  {
    script: '/bots/wyrf_bot.js',
    interval: cronSchedules.EVERY_SIX_HOURS
  }  
];

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
