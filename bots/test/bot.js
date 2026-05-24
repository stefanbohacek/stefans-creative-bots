import { exec } from "node:child_process";
import util from "node:util";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execPromise = util.promisify(exec);

const STREAM_URL = "https://www.youtube.com/watch?v=FuuC4dpSQ1M";

const botScript = async () => {
  console.log("testing yt-dlp...");

  let streamUrl;

  try {
    const { stdout, stderr } = await execPromise(
      `yt-dlp --get-url -f best "${STREAM_URL}"`,
    );
    streamUrl = stdout.trim();
    console.log("yt-dlp succeeded, stream URL:", streamUrl);
  } catch (err) {
    console.log("yt-dlp failed:", err.message);
    return;
  }

  const framePath = `${__dirname}/../../temp/test-iss-frame.jpg`;

  try {
    const { stdout, stderr } = await execPromise(
      `ffmpeg -i "${streamUrl}" -frames:v 1 -y "${framePath}"`,
    );
    console.log("ffmpeg succeeded, frame saved to:", framePath);
  } catch (err) {
    console.log("ffmpeg failed:", err.message);
  }
};

export default botScript;
