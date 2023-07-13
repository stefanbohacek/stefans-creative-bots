const fs = require("fs"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  puppeteer = require("puppeteer"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  webcams = require(__dirname + "/../data/bearcams.js"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js");

const spawn = require('child_process').spawn;  
const { exec } = require("child_process");

const mastodon = new mastodonClient({
  access_token: process.env.BEARCAM_ACCESS_TOKEN_SECRET,
  api_url: process.env.BEARCAM_API,
});

module.exports = {
  active: true,
  name: "@bearcam",
  description: "Watching some bears.",
  // thumbnail:
  // "https://botwiki.org/wp-content/uploads/2023/07/-exoplanets-1688591006.png",
  // about_url: "https://botwiki.org/bot/exoplanets/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@bearcam",
    },
  ],
  interval: cronSchedules.EVERY_HOUR,
  script: async () => {
    (async () => {
      const webcam = helpers.randomFromArray(webcams);
      console.log('downloading preview...', webcam);
      const description = `Live view from ${webcam.name}. ${webcam.url}`;

      const url = webcam.youtube_embed_url;

      // const cmd = `yt-dlp --downloader ffmpeg --downloader-args "ffmpeg:-t 1" "${url}" -o bearcam.mp4`;
      const cmd = `yt-dlp`;

      const args = [
        '--downloader', 'ffmpeg',
        '--downloader-args', 'ffmpeg:-t 10',
        url,
        '-o', 'bearcam.mp4',
        '--force-overwrites'
      ];
    
      const proc = spawn(cmd, args);

      proc.stdout.on('data', function(data) {
          // console.log(data);
      });
      
      proc.stderr.setEncoding("utf8")

      proc.stderr.on('data', function(data) {
          // console.log(data);
      });
      
      proc.on('close', async () => {
          console.log('finished downloading video...');

          const video = await fs.readFileSync(__dirname + "/../bearcam.mp4", {
            encoding: "base64",
          });

          mastodon.postImage({
            status: `${description} #bears #bearcam`,
            image: video,
            alt_text: ``,
          });

          try{
            fs.unlink(__dirname + "/../bearcam.mp4");
            fs.unlink(__dirname + "/../bearcam.mp4.webm");
          } catch { /* noop */ }
      });
    })();
  },
};
