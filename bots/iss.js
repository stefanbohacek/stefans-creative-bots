const fs = require("fs"),
  request = require("request"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  puppeteer = require("puppeteer"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js");

const spawn = require("child_process").spawn;
const { exec } = require("child_process");

const mastodon = new mastodonClient({
  access_token: process.env.ISS_ACCESS_TOKEN_SECRET,
  api_url: process.env.ISS_API,
});

const fileName = "iss.mp4";

module.exports = {
  active: true,
  name: "@iss",
  description: "Live from space!",
  // thumbnail:
  // "https://botwiki.org/wp-content/uploads/2023/07/-iss-1689222972.png",
  // about_url: "https://botwiki.org/bot/iss/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@iss",
    },
  ],
  interval: cronSchedules.EVERY_HOUR,
  script: async () => {
    (async () => {
      try {
        const webcam = {
          description:
            "Live video of Earth streaming from an external camera mounted on the International Space Station. The camera is looking toward Earth with an occasional solar panel passing through the view.",
          url: "https://eol.jsc.nasa.gov/ESRS/HDEV",
          youtube_url: "https://www.youtube.com/watch?v=KG6SL6Mf7ak",
          tags: "#iss #space #earth #nasa #esa #jaxa #csa",
        };

        console.log(`downloading preview (${fileName})...`, webcam);
        let statusText = `Live feed: ${webcam.url}`;
        const url = webcam.youtube_url;
        // const cmd = `yt-dlp --downloader ffmpeg --downloader-args "ffmpeg:-t 1" "${url}" -o ${fileName}`;

        const cmd = `yt-dlp`;

        const args = [
          "--downloader",
          "ffmpeg",
          "--downloader-args",
          "ffmpeg:-t 10",
          url,
          "-o",
          fileName,
          "--force-overwrites",
        ];

        const proc = spawn(cmd, args);

        proc.stdout.on("data", function (data) {
          // console.log(data);
        });

        proc.stderr.setEncoding("utf8");

        proc.stderr.on("data", function (data) {
          // console.log(data);
        });

        proc.on("close", async () => {
          console.log(`finished downloading video (${fileName})...`);

          const video = await fs.readFileSync(__dirname + `/../${fileName}`, {
            encoding: "base64",
          });

          const apiURL = "http://api.open-notify.org/iss-now.json";

          request(apiURL, (error, response, body) => {
            let bodyParsed;

            try {
              bodyParsed = JSON.parse(body);
            } catch (err) {
              console.log("ERROR: unable locate ISS", err);
            }

            if (
              bodyParsed &&
              bodyParsed.iss_position &&
              bodyParsed.iss_position.latitude &&
              bodyParsed.iss_position.longitude
            ) {
              statusText += `\nCurrent location: http://www.openstreetmap.org/?mlat=${bodyParsed.iss_position.latitude}&mlon=${bodyParsed.iss_position.longitude}&zoom=2`;
            }

            statusText += `\n\n${webcam.tags}`;            

            mastodon.postImage({
              status: statusText,
              image: video,
              alt_text: webcam.description,
            });

            try {
              fs.unlink(__dirname + `/../${fileName}`);
              fs.unlink(__dirname + `/../${fileName}.webm`);
            } catch (error) {
              /* noop */
            }
          });
        });
      } catch (error) {
        console.log(`${fileName.replace(".mp4", "")} error`, error);
      }
    })();
  },
};
