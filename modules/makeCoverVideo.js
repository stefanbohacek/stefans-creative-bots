import ffmpeg from "fluent-ffmpeg";
import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";

export default (imagePath, audioPath, outputPath, maxLengthSeconds) => {
  return new Promise((resolve, reject) => {
    ffprobe(audioPath, { path: ffprobeStatic.path }, (err, info) => {
      if (err) return reject(err);

      const audioStream = info.streams.find((s) => s.codec_type === "audio");
      let duration = parseFloat(audioStream.duration);

      if (!duration || isNaN(duration)) {
        return reject(new Error("Could not determine audio duration."));
      }

      if (maxLengthSeconds) {
        duration = Math.min(duration, maxLengthSeconds);
      }

      ffmpeg()
        .input(imagePath)
        .inputOptions(["-loop 1"])
        .input(audioPath)
        .videoCodec("libx264")
        .audioCodec("aac")
        .videoFilters([
          "scale=1280:720:force_original_aspect_ratio=decrease",
          "pad=1280:720:(ow-iw)/2:(oh-ih)/2:black",
        ])
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
