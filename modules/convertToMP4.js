import ffmpeg from "fluent-ffmpeg";

export default (inputPath, outputPath, maxSeconds = 5) =>
  new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .inputOptions(["-t", String(maxSeconds)])
      .videoCodec("copy")
      .noAudio()
      .output(outputPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
