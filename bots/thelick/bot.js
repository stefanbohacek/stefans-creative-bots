import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";
import { URL } from "url";
import { exec } from "node:child_process";
import getMP3Duration from "get-mp3-duration";
import a from "indefinite";
import mastodonClient from "./../../modules/mastodon/index.js";
import getRandomInt from "./../../modules/get-random-int.js";
import getRandomRange from "./../../modules/get-random-range.js";
import randomFromArray from "./../../modules/random-from-array.js";
import util from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const botID = "thelick";

const getInstruments = () => {
  let instruments = [];

  readdirSync("/app/data/notes", { withFileTypes: true }).forEach((dirent) => {
    if (dirent.isDirectory()) {
      // console.log(`reading ${dirent.name}...`);
      const pathOriginal = path.join("/app/data/notes", dirent.name);

      const instrument = {
        name: dirent.name,
        notes: {
          Ab: [],
          Bb: [],
          Cb: [],
          Db: [],
          Eb: [],
          Fb: [],
          Gb: [],
          A: [],
          B: [],
          C: [],
          D: [],
          E: [],
          F: [],
          G: [],
        },
      };

      const noteNames = Object.keys(instrument.notes);

      readdirSync(pathOriginal, {
        withFileTypes: true,
      }).forEach((file) => {
        // console.log(file.name);

        for (let note of noteNames) {
          if (file.name.replace(".mp3", "").slice(0, -1) === note) {
            instrument.notes[note].push(file.name);
          }
        }
      });

      instruments.push(instrument);
    }
  });

  return instruments;
};

const botScript = async () => {
  (async () => {
    const instruments = getInstruments();
    // console.log(util.inspect(instruments, false, null, true));
    // const theLick = ["B", "C#", "D", "E", "C#", "A", "B"]
    const theLick = ["B", "Db", "D", "E", "Db", "A", "B"];

    const instrument = randomFromArray(instruments);
    // const instrument = instruments.filter(
    //   (i) => (i.name === "marimba with dead strokes")
    // )[0];

    let theLickNotes = [];

    theLick.forEach((note) => {
      if (instrument.notes[note]) {
        theLickNotes.push(instrument.notes[note][0]);
        // theLickNotes.push(randomFromArray(instrument.notes[note]));
      }
    });

    let delay = getRandomRange(0.05, 0.9);
    const execPromise = util.promisify(exec);
    let cmdArgs = [];
    let cmdFilter = [`[0][1]acrossfade=d=${delay}:c1=tri:c2=tri[a01];`];

    theLickNotes.forEach((note, index) => {
      delay = getRandomRange(0.05, 0.9)
      cmdArgs.push("-i");
      cmdArgs.push(`"${path.join("/app/data/notes", instrument.name, note)}"`);

      console.log({
        note,
        delay
      });

      if (index === theLickNotes.length - 3) {
        cmdFilter.push(
          `[a0${index + 1}][${index + 2}]acrossfade=d=${delay}:c1=tri:c2=tri"`
        );
      } else if (index < theLickNotes.length - 3) {
        cmdFilter.push(
          `[a0${index + 1}][${
            index + 2
          }]acrossfade=d=${delay}:c1=tri:c2=tri[a0${index + 2}];`
        );
      }
    });

    // console.log({ cmdArgs, cmdFilter });

    try {
      const cmd = `ffmpeg`;
      let response;
      let args = [
        "-y",
        ...cmdArgs,
        "-filter_complex",
        `"${cmdFilter.join(" ")}`,
        // `${__dirname}/../temp/${filename}`,
        `${__dirname}/../../temp/the-lick.mp3`,
        // "--force-overwrites",
      ];

      response = await execPromise(`${cmd} ${args.join(" ")}`);

      const buffer = fs.readFileSync(`${__dirname}/../../temp/the-lick.mp3`);
      const duration = getMP3Duration(buffer);
      const durationArgs = [];
      const durationMax = Math.floor(duration / 10000) || 1;

      for (let i = 0; i <= durationMax; i++) {
        durationArgs.push("atempo=2");
      }

      // console.log(`${duration}ms`, durationArgs.length);
      // ffmpeg -y -i /mnt/c/Users/fourt/Downloads/the-lick/the-lick.mp3 -filter:a "atempo=2,atempo=2,atempo=2,atempo=2" -vn /mnt/c/Users/fourt/Downloads/the-lick/the-lick2.mp3

      args = [
        "-y",
        "-i",
        `${__dirname}/../../temp/the-lick.mp3`,
        `-filter:a "${durationArgs.join(", ")}"`,
        // "-filter:a", "\"atempo=2,atempo=1.5\""
        `${__dirname}/../../temp/the-lick-2.mp3`,
        // "--force-overwrites",
      ];
      response = await execPromise(`${cmd} ${args.join(" ")}`);
      // console.log(response.stdout, response.stderr);

      const mastodon = new mastodonClient({
        access_token: process.env.THE_LICK_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.THE_LICK_BOT_MASTODON_API,
      });

      const status = `The Lick played on ${a(instrument.name)}.\n\n#TheLick #music`;

      mastodon.postImage({
        status,
        image: `${__dirname}/../../temp/the-lick-2.mp3`,
        alt_text: "A short audio clip with a jazzy tune.",
      });
    } catch (error) {
      console.log(error);
    }
  })();
};

export default botScript;
