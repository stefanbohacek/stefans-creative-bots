const helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require(__dirname + '/../helpers/cron-schedules.js'),
      webcams = require(__dirname + '/../data/webcams-nyc.js'),
      mastodonClient = require(__dirname + '/../helpers/mastodon.js'), 
      tumblrClient = require(__dirname + '/../helpers/tumblr.js');

const mastodon = new mastodonClient({
  access_token: process.env.NYCVIEWSBOT_MASTODON_ACCESS_TOKEN,
  api_url: process.env.NYCVIEWSBOT_MASTODON_API
});

const tumblr = new tumblrClient({
  tumblr_name: process.env.NYCVIEWSBOT_TUMBLR_BLOG_NAME,
  consumer_key: process.env.NYCVIEWSBOT_TUMBLR_API_KEY,
  consumer_secret: process.env.NYCVIEWSBOT_TUMBLR_API_SECRET,
  token: process.env.NYCVIEWSBOT_TUMBLR_API_ACCESS_TOKEN,
  token_secret: process.env.NYCVIEWSBOT_TUMBLR_API_ACCESS_SECRET
});

module.exports = {
  active: true,
  name: 'Views from New York',
  description: 'Views from the great city of NYC 🗽',
  thumbnail: 'https://botwiki.org/wp-content/uploads/2020/03/views-from-new-york-1585658499.png',
  about_url: 'https://botwiki.org/bot/views-from-new-york/',
  links: [
    {
      title: 'Follow on Mastodon',
      url: 'https://botsin.space/@nycviewsbot'
    },
    {
      title: 'Follow on Tumblr',
      url: 'https://nycviewsbot.tumblr.com/'
    },
    {
      title: 'Twitter archive',
      url: 'https://twitter.com/nycviewsbot'
    }    
  ],
  interval: cronSchedules.EVERY_FOUR_HOURS,
  script: () => {
    const webcam = helpers.randomFromArray(webcams);
    console.log(webcam);
    
    const webcamUrl = `📷 https://www.windy.com/-Webcams/webcams/${webcam.id}`;
    const googleMapsUrl = `🗺️ https://www.google.com/maps/search/${webcam.latitude},${webcam.longitude}`;
    let text = `${webcam.title}\n${webcamUrl}\n${googleMapsUrl} #nyc #webcam #city`;

    helpers.loadImage(webcam.url, (err, imgData) => {
      if (err){
        console.log(err);     
      }
      else{
        mastodon.postImage({
          status: text,
          image: imgData,
          alt_text: `Webcam view from ${webcam.title}`,
        });
        
        // tumblr.postImage(text, imgData);
      }
    });  
  }
};