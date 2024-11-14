import fs from "fs";
import Blob from "node-blob";
import fetch from "node-fetch";

const uploadImage = async (domain, token, file, description) => {
  const stats = fs.statSync(file);
  const fileSizeInBytes = stats.size;

  console.log("uploading...", file, description);

  const response = await fetch(`https://${domain}/api/v2/media`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      // file: new Blob([fs.readFileSync(file)]),
      file: fs.createReadStream(file),
      description,
    }),
  });

  const responseData = await response.json();
  return responseData;
};

export default uploadImage;
