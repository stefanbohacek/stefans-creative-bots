const fs = require("fs"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  webcams = require(__dirname + "/../data/webcams-bearcams.js"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js");

const spawn = require("child_process").spawn;
const { exec } = require("child_process");

const mastodon = new mastodonClient({
  access_token: process.env.BEARCAM_ACCESS_TOKEN_SECRET,
  api_url: process.env.BEARCAM_API,
});

const fileName = "bearcam.mp4";

module.exports = {
  active: true,
  name: "@bearcam",
  description: "Watching some bears.",
  thumbnail:
  "https://botwiki.org/wp-content/uploads/2023/07/-bearcam-1689222972.png",
  about_url: "https://botwiki.org/bot/bearcam/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@bearcam",
    },
  ],
  interval: cronSchedules.EVERY_HOUR,
  script: async () => {
    (async () => {
      try {
        const webcam = helpers.randomFromArray(webcams);
        console.log(`downloading preview (${fileName})...`, webcam);
        const statusText = `${webcam.name}: ${webcam.url}\n\n${webcam.tags}`;
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
      } catch (error) {
        console.log(`${fileName.replace(".mp4", "")} error`, error);
      }
    })();
  },
};
