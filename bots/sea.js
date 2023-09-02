const fs = require("fs"),
  request = require("request"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js"),
  ColorThief = require("colorthief");

const spawn = require("child_process").spawn;
const { exec } = require("child_process");

const mastodon = new mastodonClient({
  access_token: process.env.AT_SEA_ACCESS_TOKEN_SECRET,
  api_url: process.env.AT_SEA_API,
});

const botScript = async () => {
  const stationList = `https://www.ndbc.noaa.gov/buoycams.php`;
  const stationExclude = [46080, 46029, 42003];

  const spawn = require("child_process").spawn;
  const { exec } = require("child_process");

  request(stationList, (error, response, body) => {
    let stations = JSON.parse(body);
    stations = stations.filter(
      (station) => stationExclude.indexOf(station.id) === -1 && station.width
    );
    const station = helpers.randomFromArray(stations);
    const imageWidth = station.width / 6;

    console.log("picking a station at sea...", station);

    const stationURL = `https://www.ndbc.noaa.gov/station_page.php?station=${station.id}`;
    const imageURL = `https://www.ndbc.noaa.gov/buoycam.php?station=${station.id}`;

    const fileName = "buoycam";
    const fileExt = "jpg";
    const filePath = `${__dirname}/../tmp/${fileName}.${fileExt}`;

    helpers.downloadImage(imageURL, filePath, () => {
      const imagemagickCommand = `convert ${filePath} -crop ${imageWidth}x270 ${__dirname}/../tmp/buoycam-cropped.jpg`;

      exec(imagemagickCommand, async (error, stdout, stderr) => {
        if (error) {
          console.log(`@sea error: ${error.message}`);
        }
        if (stderr) {
          console.log(`@sea stderr: ${stderr}`);
        }
        //   console.log(`stdout: ${stdout}`);

        // const croppedFilePath = `${__dirname}/../tmp/${fileName}-cropped-${helpers.getRandomInt(
        //   0,
        //   5
        // )}.${fileExt}`;

        let okayPictures = [];

        const forLoop = async (_) => {
          for (let i = 0; i <= 5; i++) {
            const croppedFilePath = `${__dirname}/../tmp/${fileName}-cropped-${i}.${fileExt}`;
            const color = await ColorThief.getColor(croppedFilePath);
            const hex = helpers.rgbToHex(...color);
            const luminosity = helpers.getLuminosity(hex);

            if (luminosity > 20) {
              okayPictures.push(croppedFilePath);
            }
          }
        };

        await forLoop();

        console.log({ okayPictures });

        if (okayPictures.length) {
          const selectedImagePath = helpers.randomFromArray(okayPictures);

          const image = await fs.readFileSync(selectedImagePath, {
            encoding: "base64",
          });

          const owmApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${station.lat}&lon=${station.lng}&units=imperial&APPID=${process.env.OWM_APP_ID}`;
          let weather = null;

          request(owmApiUrl, (error, response, body) => {
            if (!error) {
              try {
                const responseJSON = JSON.parse(body);
                const temperature = `It's ${Math.round(
                  responseJSON.main.temp
                )} °F.`;

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
                    weather = `There's a tornado?? ${temperature}`;
                    break;
                }

                const statusText = `${station.name}\n\n${weather}\nStation: ${stationURL}\nLocation: http://www.openstreetmap.org/?mlat=${station.lat}&mlon=${station.lng}&zoom=2\n\n#sea #ocean #water #webcam`;

                mastodon.postImage({
                  status: statusText,
                  image: image,
                  alt_text:
                    "This is an image captured by a buoy floating at sea.",
                });
              } catch (err) {
                console.log(err);
              }
            }
          });
        } else {
          botScript();
        }
      });
    });
  });
};

module.exports = {
  active: true,
  name: "@sea",
  description: "Views from the middle of an ocean.",
  // thumbnail:
  // "https://botwiki.org/wp-content/uploads/2023/07/-bearcam-1689222972.png",
  // about_url: "https://botwiki.org/bot/bearcam/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@sea",
    },
  ],
  interval: cronSchedules.EVERY_HOUR_5,
  script: botScript,
};
