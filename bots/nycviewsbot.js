const request = require("request"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  webcams = require(__dirname + "/../data/webcams-nyc.js"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js"),
  tumblrClient = require(__dirname + "/../helpers/tumblr.js");

const mastodon = new mastodonClient({
  access_token: process.env.NYCVIEWSBOT_MASTODON_ACCESS_TOKEN,
  api_url: process.env.NYCVIEWSBOT_MASTODON_API,
});

const tumblr = new tumblrClient({
  tumblr_name: process.env.NYCVIEWSBOT_TUMBLR_BLOG_NAME,
  consumer_key: process.env.NYCVIEWSBOT_TUMBLR_API_KEY,
  consumer_secret: process.env.NYCVIEWSBOT_TUMBLR_API_SECRET,
  token: process.env.NYCVIEWSBOT_TUMBLR_API_ACCESS_TOKEN,
  token_secret: process.env.NYCVIEWSBOT_TUMBLR_API_ACCESS_SECRET,
});

module.exports = {
  active: true,
  name: "Views from New York",
  description: "Views from the great city of NYC 🗽",
  thumbnail:
    "https://botwiki.org/wp-content/uploads/2020/03/views-from-new-york-1585658499.png",
  about_url: "https://botwiki.org/bot/views-from-new-york/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@nycviewsbot",
    },
    {
      title: "Follow on Tumblr",
      url: "https://nycviewsbot.tumblr.com/",
    },
    {
      title: "Twitter archive",
      url: "https://twitter.com/nycviewsbot",
    },
  ],
  interval: cronSchedules.EVERY_THREE_HOURS_15,
  script: () => {
    const webcam = helpers.randomFromArray(webcams);
    console.log(webcam);

    let webcamUrl;

    if (webcam.windy_id){
      webcamUrl = `📷 https://www.windy.com/-Webcams/webcams/${webcam.windy_id}`;
    } else {
      webcamUrl = `📷 ${webcam.link}`;
    }

    const googleMapsUrl = `🗺️ https://www.google.com/maps/search/${webcam.latitude},${webcam.longitude}`;

    const owmApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${webcam.latitude}&lon=${webcam.longitude}&units=imperial&APPID=${process.env.OWM_APP_ID}`;
    let weather = null;

    request(owmApiUrl, (error, response, body) => {
      if (!error) {
        try {
          const responseJSON = JSON.parse(body);
          const temperature = `It's ${Math.round(responseJSON.main.temp)} °F.`;

          switch (responseJSON.weather[0].main) {
            case "Clear":
              weather = `It's a clear day in New York. ${temperature}`;
              break;

            case "Clouds":
              weather = `It's a cloudy day in New York. ${temperature}`;
              break;

            case "Rain":
              weather = `It's a rainy day in New York. ${temperature}`;
              break;

            case "Thunderstorm":
              weather = `It's a stormy day in New York. ${temperature}`;
              break;

            case "Drizzle":
              weather = `It's drizzling in New York. ${temperature}`;
              break;

            case "Snow":
              weather = `It's a snowy day in New York. ${temperature}`;
              break;

            case "Mist":
              weather = `It's a misty day in New York. ${temperature}`;
              break;

            case "Smoke":
              weather = `It's a smoky day in New York. ${temperature}`;
              break;

            case "Haze":
              weather = `It's a hazey day in New York. ${temperature}`;
              break;

            case "Dust":
              weather = `It's a dusty day in New York. ${temperature}`;
              break;

            case "Fog":
              weather = `It's a foggy day in New York. ${temperature}`;
              break;

            case "Sand":
              weather = `It's a sandy day in New York. ${temperature}`;
              break;

            case "Dust":
              weather = `It's a dusty day in New York. ${temperature}`;
              break;

            case "Ash":
              weather = `It's an ashy day in New York. ${temperature}`;
              break;

            case "Tornado":
              weather = `There's a tornado in New York?? ${temperature}`;
              break;
          }

          helpers.loadImage(webcam.url, (err, imgData) => {
            if (err) {
              console.log(err);
            } else {
              const text = `${webcam.title}\n${webcamUrl}\n${googleMapsUrl} #nyc #webcam #city`;
              let description = webcam.description;

              if (weather) {
                description = `${description} ${weather}`;
              }

              mastodon.postImage({
                status: text,
                image: imgData,
                alt_text: description,
              });

              // tumblr.postImage(text, imgData);
            }
          });
        } catch (err) {
          console.log(err);
        }
      }
    });
  },
};
