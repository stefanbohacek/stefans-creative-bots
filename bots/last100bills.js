/* This bot uses the chart.js library (chartjs.org) via the chartjs-node node package (npmjs.com/package/chartjs-node). */
/* Static version: https://stefans-creative-bots.glitch.me/last100bills.html */

const request = require( 'request' ),
      ChartjsNode = require( 'node-chartjs-v12' ),
      helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require( __dirname + '/../helpers/cron-schedules.js' ),
      TwitterClient = require(__dirname + '/../helpers/twitter.js'),
      mastodonClient = require(__dirname + '/../helpers/mastodon.js');

const twitter = new TwitterClient( {
  consumer_key: process.env.LAST100BILLS_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.LAST100BILLS_TWITTER_CONSUMER_SECRET,
  access_token: process.env.LAST100BILLS_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.LAST100BILLS_TWITTER_ACCESS_TOKEN_SECRET
} );

const mastodon = new mastodonClient( {
  access_token: process.env.LAST100BILLS_MASTODON_ACCESS_TOKEN,
  api_url: process.env.LAST100BILLS_MASTODON_API
} );

module.exports = {
  active: true,
  name: '@last100bills',
  description: 'Breakdown of the last 100 bills introduced in the US government.',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2018/05/last100bills-1.png',
  about_url: 'https://botwiki.org/bot/last100bills/',
  links: [
    {
      title: 'Follow on Twitter',
      url: 'https://twitter.com/last100bills'
    }
  ],
  interval: cronSchedules.EVERY_DAY_MORNING,
  script: function(){
    console.log( 'making a chart...' );

    const datasetUrl = 'https://www.govtrack.us/api/v2/bill?order_by=-current_status_date',
          datasetName = 'Last 100 bills in the US government',
          datasetLabels = ['group', 'value'];

    request( datasetUrl, function ( error, response, body ){
      let bodyParsed;

      try{
        bodyParsed = JSON.parse( body );
      } catch( err ){
        console.log( 'ERROR: unable to parse data', err );
        return false;
      }

      if ( bodyParsed ){

        /* Set up your data.  */

        let introduced_count = 0,
            pass_over_house_count = 0,
            passed_bill_count = 0,
            passed_concurrentres_count = 0,
            passed_simpleres_count = 0,
            reported_count = 0,
            enacted_signed_count = 0;

        bodyParsed.objects.forEach(function(bill){
          if (bill.current_status === 'introduced'){
            introduced_count ++;
          } else if (bill.current_status === 'pass_over_house'){
            pass_over_house_count ++; 
          } else if (bill.current_status === 'passed_bill'){
            passed_bill_count ++; 
          } else if (bill.current_status === 'passed_concurrentres'){
            passed_concurrentres_count ++; 
          } else if (bill.current_status === 'passed_simpleres'){
            passed_simpleres_count ++; 
          } else if (bill.current_status === 'reported'){
            reported_count ++; 
          } else if (bill.current_status === 'enacted_signed'){
            enacted_signed_count ++; 
          }
        });  

       const data = [
            ['Introduced', introduced_count],
            ['Passed House', pass_over_house_count],
            ['Passed House & Senate', passed_bill_count],
            ['Concurrent Resolution', passed_concurrentres_count],
            ['Simple Resolution', passed_simpleres_count],
            ['Ordered Reported', reported_count],
            ['Enacted', enacted_signed_count]
        ];

        /* Set up the chart.js options, see chartjs.org for documentation. */

        const chartJsOptions = {
            plugins: {
              beforeDraw: function ( chart, easing ) {
                var ctx = chart.chart.ctx;
                ctx.save();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect( 0, 0, chart.width, chart.height );
                ctx.restore(  );
              }
            },
          
            type: 'bar',
            data: {
                labels: data.map( function( item ){
                  return item[0];
                } ),
                datasets: [{
                    label: datasetName,
                    data: data.map( function( item ){
                      return item[1];
                    } ),
                    backgroundColor: 'rgb(255, 99, 132)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        };

        let chartNode = new ChartjsNode( 600, 600 );
        
        
        chartNode.makeChart( chartJsOptions )
        .then( res => {
          chartNode.drawChart();

          chartNode.toBuffer().then( function( blob ){
            let buffer = blob;

            Array.isArray( buffer )

            const text = helpers.randomFromArray( [
              'The last 100 bills in the US #government, analyzed!',
              'Looking at the last 100 bills in the US #government.',
              'The last 100 bills in one chart!',
              'Analyzing the last 100 bills in the US #government.',
              'Breaking down the last 100 bills in the US #government.'
            ] ) + ' #dataviz #civictech';

            const image = buffer.toString( 'base64' );
            
            const alt = `${ introduced_count } bills have been introduced, ${ pass_over_house_count } bills passed the House,  ${ passed_bill_count } bills passed the House & the Senate, ${ passed_concurrentres_count + passed_simpleres_count } bills have been agreed to, ${ reported_count } bills are being considered, and ${ enacted_signed_count } bills have been  enacted.`;

            twitter.postImageWithAltText( { text, image, alt } );
            mastodon.postImage( text, image );

          } );
        } );

      }
    } );
  }
};
