/* Setting things up. */

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
  }
];

let nycviewsbot = require( __dirname + '/bots/nycviewsbot.js' );

let listener = app.listen( process.env.PORT, function(){
  if ( bots && bots.length > 0 ){
    console.log( `🤖 your bot${ bots.length === 1 ? ' is' : 's are' } running on port ${ listener.address().port }` );

    bots.forEach( function( bot ){
      let botInterval;

      for (const schedule in cronSchedules) {
        if ( cronSchedules[schedule] === bot.interval ){
          botInterval = schedule;
        }
      }

      console.log( `🕒 scheduling ${ bot.script }: ${ botInterval }` );
      const script = require( __dirname + bot.script );

      ( new CronJob( bot.interval, function() {
        script();
      } ) ).start();
    } );

  } else {
    console.log( '🚫 no bots to schedule' );
  }
} );
