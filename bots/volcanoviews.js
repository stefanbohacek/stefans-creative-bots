const fs = require('fs'),
      express = require('express'),
      cheerio = require('cheerio'),
      puppeteer = require('puppeteer'),
      helpers = require(__dirname + '/../helpers/helpers.js'),
      cronSchedules = require(__dirname + '/../helpers/cron-schedules.js'),
      volcanoes = require(__dirname + '/../data/volcanoes.js'),
      mastodonClient = require(__dirname + '/../helpers/mastodon.js'),
      tumblrClient = require(__dirname + '/../helpers/tumblr.js');

const mastodon = new mastodonClient({
   access_token: process.env.VOLCANOVIEWS_MASTODON_ACCESS_TOKEN,
   api_url: process.env.VOLCANOVIEWS_MASTODON_API
});

// const tumblr = new tumblrClient({
//   tumblr_name: process.env.VOLCANOVIEWS_TUMBLR_BLOG_NAME,  
//   consumer_key: process.env.VOLCANOVIEWS_TUMBLR_CONSUMER_KEY,
//   consumer_secret: process.env.VOLCANOVIEWS_TUMBLR_CONSUMER_SECRET,
//   token: process.env.VOLCANOVIEWS_TUMBLR_CONSUMER_TOKEN,
//   token_secret: process.env.VOLCANOVIEWS_TUMBLR_CONSUMER_TOKEN_SECRET
// });

module.exports = {
  active: true,
  name: '@volcanoviews',
  description: 'Views of volcanoes.',
  // thumbnail: 'https://botwiki.org/wp-content/uploads/2018/08/-volcanoviews.png',
  // about_url: 'https://botwiki.org/bot/volcanoviews/',
  links: [
    {
      title: 'Follow on Mastodon',
      url: 'https://botsin.space/@volcanoviews'
    // },
    // {
    //   title: 'Follow on Tumblr',
    //   url: 'https://volcanoviews.tumblr.com/'
    }
  ],
  interval: cronSchedules.EVERY_SIX_HOURS,
  script: () => {
    const volcano = helpers.randomFromArray(volcanoes);
    console.log(volcano);

    helpers.loadImage(volcano.url, (err, imgData) => {
      const text = `${volcano.name} via ${volcano.page_url}`;

      mastodon.postImage({
        status: `${text} #volcano #nature`,
        image: imgData,
        alt_text: 'Webcam view of a volcano.',
      });

      // tumblr.postImage(text, imgData);
    });
  } 
};
