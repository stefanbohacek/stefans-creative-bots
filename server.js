/* Setting things up. */

const path = require( 'path' ),
      express = require( 'express' ),
      app = require(__dirname + '/app.js'),
      CronJob = require( 'cron' ).CronJob,
      cronSchedules = require( __dirname + '/helpers/cron-schedules.js' );

const bots = [
  {
    name: '@nycviewsbot',
    function: require( __dirname + '/bots/nycviewsbot.js' ),
    interval: cronSchedules.EVERY_SIX_HOURS
  },
 {
    name: '@southpoleviews',
    function: require( __dirname + '/bots/southpoleviews.js' ),
    interval: cronSchedules.EVERY_SIX_HOURS
  }
  
];

let nycviewsbot = require( __dirname + '/bots/nycviewsbot.js' );

let listener = app.listen( process.env.PORT, function(){
  console.log( `your bots are running on port ${ listener.address().port }` );

  bots.forEach( function( bot ){
    console.log( `scheduling ${ bot.name } (${ bot.interval })...` );
    ( new CronJob( bot.interval, function() {
      bot.function();
    } ) ).start();
  } );  
  
} );
