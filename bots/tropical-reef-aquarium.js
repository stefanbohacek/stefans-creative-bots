const fs = require("fs"),
  helpers = require(__dirname + "/../helpers/helpers.js"),
  puppeteer = require("puppeteer"),
  cronSchedules = require(__dirname + "/../helpers/cron-schedules.js"),
  mastodonClient = require(__dirname + "/../helpers/mastodon.js");

const spawn = require('child_process').spawn;  
const { exec } = require("child_process");

const mastodon = new mastodonClient({
  access_token: process.env.TROPICAL_REEF_AQUARIUM_ACCESS_TOKEN_SECRET,
  api_url: process.env.TROPICAL_REEF_AQUARIUM_API,
});

module.exports = {
  active: true,
  name: "Tropical reef aquarium",
  description: "Watching some fish.",
  thumbnail:
  "https://botwiki.org/wp-content/uploads/2023/07/tropical-reef-aquarium-1689247814.png",
  about_url: "https://botwiki.org/bot/tropical-reef-aquarium/",
  links: [
    {
      title: "Follow on Mastodon",
      url: "https://botsin.space/@tropicalreefaquarium",
    },
  ],
  interval: cronSchedules.EVERY_HOUR_25,
  script: async () => {
    (async () => {
      try {

        const webcam = {
          name: "Tropical reef aquarium in Long Beach, California",
          description: "A short clip from a webcam inside of a tropical reef aquarium. Typically you can see a lot of colorful fish of various sizes swimming around a coral reef.",
          url: "https://explore.org/livecams/aquarium-of-the-pacific/pacific-aquarium-tropical-reef-camera",
          youtube_url: "https://www.youtube.com/watch?v=DHUnz4dyb54",
          tags: '#fish #corals #aquarium'
        };
  
        console.log('downloading preview...', webcam);
        const statusText = `${webcam.url} ${webcam.tags}`;
        const url = webcam.youtube_url;
        // const cmd = `yt-dlp --downloader ffmpeg --downloader-args "ffmpeg:-t 1" "${url}" -o tropicalreefaquarium.mp4`;
  
        const cmd = `yt-dlp`;
  
        const args = [
          '--downloader', 'ffmpeg',
          '--downloader-args', 'ffmpeg:-t 10',
          url,
          '-o', 'tropicalreefaquarium.mp4',
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
  
            const video = await fs.readFileSync(__dirname + "/../tropicalreefaquarium.mp4", {
              encoding: "base64",
            });
  
            mastodon.postImage({
              status: statusText,
              image: video,
              alt_text: webcam.description,
            });
  
            try{
              fs.unlink(__dirname + "/../tropicalreefaquarium.mp4");
              fs.unlink(__dirname + "/../tropicalreefaquarium.mp4.webm");
            } catch (error) { /* noop */ }
        });        
      } catch (error) {
        console.log('@tropicalreefaquarium error', error);
      }
    })();
  },
};
