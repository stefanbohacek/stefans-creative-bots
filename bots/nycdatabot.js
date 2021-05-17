const request = require( 'request' ),
      util = require( 'util' ),
      usZips = require( 'us-zips' ),
      ChartjsNode = require( 'node-chartjs-v12' ),
      helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require( __dirname + '/../helpers/cron-schedules.js' ),
      TwitterClient = require(__dirname + '/../helpers/twitter.js'),
      mastodonClient = require(__dirname + '/../helpers/mastodon.js');

const twitter = new TwitterClient( {
  consumer_key: process.env.NYCDATABOT_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.NYCDATABOT_TWITTER_CONSUMER_SECRET,
  access_token: process.env.NYCDATABOT_TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.NYCDATABOT_TWITTER_ACCESS_TOKEN_SECRET
} );

const mastodon = new mastodonClient( {
 access_token: process.env.NYCDATABOT_MASTODON_ACCESS_TOKEN_SECRET,
 api_url: process.env.NYCDATABOT_MASTODON_API
} );

function getLongLat( datapoint ){
  let dp = false;

  if ( datapoint.longitude && datapoint.latitude && ( parseFloat( datapoint.longitude ) !== 0 && parseFloat( datapoint.latitude ) !== 0 ) ){
    dp = {
      longitude: datapoint.longitude,
      latitude: datapoint.latitude
    };
  } else if ( datapoint.lon && datapoint.lat && ( parseFloat( datapoint.lon ) !== 0 && parseFloat( datapoint.lat ) !== 0 ) ){
    dp = {
      longitude: datapoint.lon,
      latitude: datapoint.lat
    };
  } else if ( datapoint.location && datapoint.location.longitude && datapoint.location.latitude && ( parseFloat( datapoint.location.longitude ) !== 0 && parseFloat( datapoint.location.latitude ) !== 0 ) ){
    dp = {
      longitude: datapoint.location.longitude,
      latitude: datapoint.location.latitude
    };
  }

  return dp;
}

function makeMap( datasetName, datasetPermalink, data, cb ){
  /*
    https://docs.mapbox.com/help/glossary/static-images-api/
    https://docs.mapbox.com/playground/static/
    https://docs.mapbox.com/api/maps/static-images/#example-request-retrieve-a-static-map-with-a-marker-overlay

    https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+555555(-73.915888033,40.84586773),pin-s+555555(-74.077149232,40.627060894)/auto/1200x500?access_token=pk.eyJ1IjoiZm91cnRvbmZpc2giLCJhIjoiY2tlMjN2ZjljMDVsOTJ6cDgxNGgweTJ5ZiJ9.mJ0-aoLZIVU2bqjH3j9kKQ

  */

  console.log( 'making a map...' );  
  let markers = [];

  data = helpers.randomFromArrayUnique( data, 100 );

  data.forEach( function( datapoint ){
    const location = getLongLat( datapoint );

    if ( location ){
      markers.push( `pin-s+555555(${ location.longitude },${ location.latitude })` )
    }
  } );

  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/${ markers.join( ',' ) }/auto/900x600?access_token=${ process.env.MAPBOX_ACCESS_TOKEN }`;

  console.log( 'mapUrl', mapUrl );

  request( {
    url: mapUrl,
    encoding: 'binary'
  }, function onImageResponse( error, imageResponse, imageBody ){
      const imageType = imageResponse.headers['content-type'];
      const base64 = new Buffer( imageBody, 'binary').toString( 'base64' );
      const dataURI = 'data:' + imageType + ';base64,' + base64;
    
      const statusText = `${ datasetName }\nSource: ${datasetPermalink}\n#nyc #dataviz`;

      twitter.postImageWithAltText( {
        text: statusText,
        image: base64,
        alt: datasetName
      } );
    
      mastodon.postImage( statusText, base64 );
    }
  );
}

function makeChart( datasetName, datasetLabels, datasetPermalink, data ){
  console.log( 'making a chart...' );
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

      console.log( text, alt );

      // twitter.postImageWithAltText( { text, image, alt } );

    } );
  } );
}

function getZipCode( datapoint ){
  return datapoint.postcode || datapoint.zipcode|| datapoint.zip_code || datapoint.zip_code_2 || false;
}

function findDataset(){
  // https://socratadiscovery.docs.apiary.io/#reference/0/find-by-domain/search-by-domain  
  let datasets = [];

  const dataSource = 'data.cityofnewyork.us';
  const dataType = helpers.randomFromArray( [
    'datasets',
    'map'
  ] );

  const dataLimit = '1000';
  const discoveryUrl = `http://api.us.socrata.com/api/catalog/v1?domains=${ dataSource }&search_context=${ dataSource }&only=${ dataType }&limit=${ dataLimit }`;

  console.log( `finding a dataset in the ${ dataSource } domain (${ dataType })` );

  request( discoveryUrl, function ( error, response, body ){
    let bodyParsed;

    try{
      bodyParsed = JSON.parse( body );
    } catch( err ){
      console.log( 'ERROR: unable to parse data', err );
      return false;
    }

    // console.log( util.inspect( bodyParsed, { showHidden: false, depth: null } ) );

    datasets = bodyParsed.results.filter( function( dataset ){
      return dataset.resource.columns_name && dataset.resource.columns_name.length;
    } );

    // console.log( 'filtering data...', datasets.map( function( dataset ){
    //   return {
    //     name: dataset.resource.name,
    //     size: dataset.resource.columns_name.length,
    //     url: `https://data.cityofnewyork.us/resource/${ dataset.resource.id }.json`,
    //   }
    // } ) );

    const dataset = helpers.randomFromArray( datasets );

    const datasetUrl = `https://data.cityofnewyork.us/resource/${ dataset.resource.id }.json`,
          datasetName = dataset.resource.name,
          datasetLabels = dataset.resource.columns_name,
          datasetPermalink = dataset.permalink;

    console.log( 'loading data...', { datasetName, dataType, datasetUrl, datasetPermalink } );

    request( datasetUrl, function ( error, response, body ){
      let bodyParsed;

      try{
        bodyParsed = JSON.parse( body );
      } catch( err ){
        console.log( 'ERROR: unable to parse data', err );
        findDataset();
        return false;
      }

      // console.log( bodyParsed );

      if ( bodyParsed ){
        switch ( dataType ){
          case 'map':
            makeMap( datasetName, datasetPermalink, bodyParsed );
            break;
          case 'datasets':
            console.log( {
              datasetLabels,
              'data sample': bodyParsed.slice(0, 5)
            } );

            if ( bodyParsed[0].latitude && bodyParsed[0].longitude  ){
              makeMap( datasetName, datasetPermalink, bodyParsed );
            } else if( getZipCode( bodyParsed[0] ) ){
              console.log( 'found dataset with zip codes...' );
              bodyParsed.forEach( function( datapoint ){
                const zipCode = getZipCode( datapoint );
                if ( zipCode ){
                  const location = usZips[ zipCode ];

                  if ( location && location.latitude && location.longitude ){
                    datapoint.latitude = location.latitude;
                    datapoint.longitude = location.longitude;
                  }
                }
              } );
              makeMap( datasetName, datasetPermalink, bodyParsed );
            } else {
              findDataset();
              // makeChart( datasetName, datasetLabels, datasetPermalink, bodyParsed );
            }
            break;
        }
      }
    } );
  } );
}

module.exports = {
  active: true,
  name: '@nycdatabot',
  description: 'Explore NYC with data.',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2021/05/data-of-new-york-1620941593.png',
  about_url: 'https://botwiki.org/bot/data-of-new-york/',
  links: [
    {
      title: 'Follow on Twitter',
      url: 'https://twitter.com/nycdatabot'
    },
    {
      title: 'Follow on botsin.space',
      url: 'https://botsin.space/@nycdatabot'
    }    
  ],
  interval: cronSchedules.EVERY_THREE_HOURS,
  script: function(){
    findDataset();
  }
};
