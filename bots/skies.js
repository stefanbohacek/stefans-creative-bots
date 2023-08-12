const request = require("request"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  webcams = require(__dirname + "/../data/webcams-skies.js"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js");

const mastodon = new mastodonClient({
  access_token: process.env.SKIES_ACCESS_TOKEN_SECRET,
  api_url: process.env.SKIES_API,
});

module.exports = {
  active: true,
  name: "@skies",
  description: "Views of skies.",
  thumbnail:
    "https://botwiki.org/wp-content/uploads/2023/08/-skies-1691854577.png",
  about_url: "https://botwiki.org/bot/skies/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@skies",
    }
  ],
  interval: cronSchedules.EVERY_HOUR,
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
              weather = `It's a clear day. ${temperature}`;
              break;

            case "Clouds":
              weather = `It's a cloudy day. ${temperature}`;
              break;

            case "Rain":
              weather = `It's a rainy day. ${temperature}`;
              break;

            case "Thunderstorm":
              weather = `It's a stormy day. ${temperature}`;
              break;

            case "Drizzle":
              weather = `It's drizzling. ${temperature}`;
              break;

            case "Snow":
              weather = `It's a snowy day. ${temperature}`;
              break;

            case "Mist":
              weather = `It's a misty day. ${temperature}`;
              break;

            case "Smoke":
              weather = `It's a smoky day. ${temperature}`;
              break;

            case "Haze":
              weather = `It's a hazey day. ${temperature}`;
              break;

            case "Dust":
              weather = `It's a dusty day. ${temperature}`;
              break;

            case "Fog":
              weather = `It's a foggy day. ${temperature}`;
              break;

            case "Sand":
              weather = `It's a sandy day. ${temperature}`;
              break;

            case "Dust":
              weather = `It's a dusty day. ${temperature}`;
              break;

            case "Ash":
              weather = `It's an ashy day. ${temperature}`;
              break;

            case "Tornado":
              weather = `There's a tornado in New York?? ${temperature}`;
              break;
          }

          helpers.loadImage(webcam.url, (err, imgData) => {
            if (err) {
              console.log(err);
            } else {
              const text = `${webcam.title}\n${webcamUrl}\n${googleMapsUrl} #sky #skies #view #webcam`;
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
