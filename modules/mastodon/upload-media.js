import fs from "fs";
import { basename, extname } from "path";
import truncate from "../truncate.js";
import { apiRequest } from "./request.js";

const mimeTypes = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
};

const loadImage = async (image) => {
  let filePath = null;

  if (fs.existsSync(image)) {
    filePath = image;
  } else if (fs.existsSync(`${image}.webm`)) {
    filePath = `${image}.webm`;
  }

  if (filePath) {
    return {
      buffer: await fs.promises.readFile(filePath),
      filename: basename(filePath),
    };
  } else {
    return { buffer: Buffer.from(image, "base64"), filename: "image.png" };
  }
};

const uploadMedia = async (client, options) => {
  const { buffer, filename } = await loadImage(options.image);
  const mimeType = mimeTypes[extname(filename).slice(1).toLowerCase()];

  const formData = new FormData();
  formData.append("file", new Blob([buffer], { type: mimeType }), filename);
  formData.append("description", truncate(options.alt_text || "", 1000));

  try {
    const data = await apiRequest(client, "media", {
      method: "POST",
      formData,
    });
    return data.id;
  } catch (err) {
    throw new Error(`uploadMedia: failed: ${err.message}`);
  }
};

export default uploadMedia;
