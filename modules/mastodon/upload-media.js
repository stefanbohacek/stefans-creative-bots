import fs from "fs";
import getRandomInt from "../getRandomInt.js";
import truncate from "../truncate.js";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadMediaFn = (client, imagePath, altText) => {
  return new Promise((resolve, reject) => {
    client.post(
      "media",
      {
        file: fs.createReadStream(imagePath),
        description: truncate(altText, 1000),
      },
      (err, data) => {
        if (err) {
          reject(new Error(`uploadMedia: failed: ${err.message}`));
        } else {
          resolve(data.id);
        }
      },
    );
  });
};

const uploadMedia = (client, options) => {
  if (fs.existsSync(options.image)) {
    return uploadMediaFn(client, options.image, options.alt_text || "");
  } else {
    return new Promise((resolve, reject) => {
      const imgFilePath = `${__dirname}/../../temp/temp-${Date.now()}-${getRandomInt(1, Number.MAX_SAFE_INTEGER)}.png`;
      fs.writeFile(imgFilePath, options.image, "base64", (err) => {
        if (err) {
          reject(err);
        } else {
          uploadMediaFn(client, imgFilePath, options.alt_text || "")
            .then((id) => {
              fs.unlinkSync(imgFilePath);
              resolve(id);
            })
            .catch((uploadErr) => {
              fs.unlinkSync(imgFilePath);
              reject(uploadErr);
            });
        }
      });
    });
  }
};

export default uploadMedia;
