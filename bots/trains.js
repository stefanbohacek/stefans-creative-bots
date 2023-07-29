const fs = require("fs"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  webcams = require(__dirname + "/../data/webcams-trains.js"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js");

const spawn = require("child_process").spawn;
const { exec } = require("child_process");

const mastodon = new mastodonClient({
  access_token: process.env.TRAINS_ACCESS_TOKEN_SECRET,
  api_url: process.env.TRAINS_API,
});

const fileName = "trains.mp4";
let filePath = `${__dirname}/../.data/${fileName}.webm`;

module.exports = {
  active: true,
  name: "@trains",
  description: "Riding trains.",
  // thumbnail:
  // "https://botwiki.org/wp-content/uploads/2023/07/-bearcam-1689222972.png",
  // about_url: "https://botwiki.org/bot/trains/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@trains",
    },
  ],
  interval: cronSchedules.EVERY_HOUR,
  script: async () => {
    (async () => {
      try {
        const webcam = helpers.randomFromArray(webcams);
        console.log(`downloading preview (${fileName})...`, webcam);
        const statusText = `${webcam.name}\n${webcam.youtube_url}\n\n${webcam.tags}`;
        const url = webcam.youtube_url;
        // const cmd = `yt-dlp --downloader ffmpeg --downloader-args "ffmpeg:-t 1" "${url}" -o ${fileName}`;

        let startTime = '';

        if (webcam.video_start && webcam.video_end){
            // const seconds = helpers.getRandomInt(webcam.video_start, webcam.video_end);
            const seconds = helpers.getRandomInt(webcam.video_start, webcam.video_start + 180);
            const randomTimestamp = new Date(seconds * 1000).toISOString().slice(11, 19);
            console.log(randomTimestamp);
            startTime = `-ss ${randomTimestamp} `;
        }

        const cmd = `yt-dlp`;

        const args = [
          "--downloader",
          "ffmpeg",
          "--downloader-args",
          `ffmpeg:${startTime}-t 10`,
          url,
          "-o",
          filePath,
          "--force-overwrites",
        ];

        console.log({args: args.join(' ')});
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


          if (!fs.existsSync(filePath)){
            filePath += '.webm';
          }

          const video = await fs.readFileSync(filePath, {
            encoding: "base64",
          });

          mastodon.postImage({
            status: statusText,
            image: video,
            alt_text: webcam.description,
          });

          try {
            // fs.unlink(filePath);
          } catch (error) {
            /* noop */
          }
        });
      } catch (error) {
        console.log(`${fileName.replace(".mp4", "")} error`, error);
      }
    })();
  }
};
