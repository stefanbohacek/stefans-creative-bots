import ffmpeg from "fluent-ffmpeg";
import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";

export default (imagePath, audioPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffprobe(audioPath, { path: ffprobeStatic.path }, (err, info) => {
      if (err) return reject(err);

      const audioStream = info.streams.find((s) => s.codec_type === "audio");
      const duration = parseFloat(audioStream.duration);

      if (!duration || isNaN(duration)) {
        return reject(new Error("Could not determine audio duration."));
      }

      ffmpeg()
        .input(imagePath)
        .inputOptions(["-loop 1"])
        .input(audioPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .size("1280x720")
        .fps(1)
        .duration(duration)
        .outputOptions(["-pix_fmt yuv420p", "-movflags +faststart"])
        .output(outputPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
  });
};
