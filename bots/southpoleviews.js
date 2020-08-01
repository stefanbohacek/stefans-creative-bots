const fs = require( 'fs' ),
      express = require( 'express' ),
      cheerio = require( 'cheerio' ),
      puppeteer = require( 'puppeteer' ),
      helpers = require( __dirname + '/../helpers/helpers.js' ),
      cronSchedules = require( __dirname + '/../helpers/cron-schedules.js' ),
      stations = require( __dirname + '/../data/south-pole-stations.js' ),
      TwitterClient = require( __dirname + '/../helpers/twitter.js' ),    
      mastodonClient = require( __dirname + '/../helpers/mastodon.js' );

const twitter = new TwitterClient( {
  consumer_key: process.env.SOUTHPOLEVIEWSBOT_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.SOUTHPOLEVIEWSBOT_TWITTER_CONSUMER_SECRET,
  access_token: process.env.SOUTHPOLEVIEWSBOT_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.SOUTHPOLEVIEWSBOT_TWITTER_ACCESS_TOKEN_SECRET
}  );

const mastodon = new mastodonClient( {
   access_token: process.env.SOUTHPOLEVIEWSBOT_MASTODON_ACCESS_TOKEN,
   api_url: process.env.SOUTHPOLEVIEWSBOT_MASTODON_API
}  );

module.exports = {
  active: true,
  name: '@southpoleviews',
  description: 'Views from the South Pole.',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2018/08/-southpoleviews.png',
  about_url: 'https://botwiki.org/bot/southpoleviews/',
  links: [
    {
      title: 'Follow on Twitter',
      url: 'https://twitter.com/southpoleviews'
    },
    {
      title: 'Follow on botsin.space',
      url: 'https://botsin.space/@southpoleviews'
    }
  ],
  interval: cronSchedules.EVERY_SIX_HOURS,
  script: function(){
    const station = helpers.randomFromArray( stations );
    console.log( station );
    
    ( async() => {
      // const browser = await puppeteer.launch();
      const browser = await puppeteer.launch( {args: ['--no-sandbox']} );

      const page = await browser.newPage();

      process.on( 'unhandledRejection', ( reason, p ) => {
        console.error( 'Unhandled Rejection at: Promise', p, 'reason:', reason );
        browser.close();
      } );

      page.setUserAgent( 'Mozilla/5.0 ( Windows NT 10.0; Win64; x64 ) AppleWebKit/537.36 ( KHTML, like Gecko ) Chrome/61.0.3163.100 Safari/537.36' );

      page.on( 'load', async response => {

        let html = await page.evaluate( () => document.body.innerHTML );

        let $ = cheerio.load( html, {
          normalizeWhitespace: true
        } );
        
        const imgSrc = $( `${station.element}` ).attr( 'src' );
        let imgURL;

        if ( imgSrc ){
          if ( imgSrc.indexOf( 'http' ) === -1 ){
              imgURL = `${station.page_url}${imgSrc}`;        
          }
          else{
            imgURL= imgSrc;
          }

          helpers.loadImage( imgURL, function( err, imgData ){
            const text = `${station.name} via ${station.url}`;
            twitter.postImage( text, imgData  );
            mastodon.postImage( text, imgData  );
          } );

        } else {
          console.log( 'image element not found', station );
        }
        
      } );
      try{
        await page.goto( station.url, {waitUntil: 'networkidle0'} );
      }
      catch ( error ) {
        console.log( error );
        browser.close();
      }

      await browser.close();
    } )(); 
  } 
};