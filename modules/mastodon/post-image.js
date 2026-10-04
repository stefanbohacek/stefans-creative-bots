import uploadMedia from "./upload-media.js";
import { apiRequest } from "./request.js";

const postImage = async (client, options) => {
  console.log("posting image...");

  const mediaId = await uploadMedia(client, options);

  const statusObj = {
    status: options.status,
    media_ids: [mediaId],
  };

  if (options.in_reply_to_id) {
    statusObj.in_reply_to_id = options.in_reply_to_id;
  }

  if (options.spoiler_text) {
    statusObj.spoiler_text = options.spoiler_text;
  }

  if (options.language) {
    statusObj.language = options.language;
  }

  try {
    const data = await apiRequest(client, "statuses", {
      method: "POST",
      json: statusObj,
    });
    console.log("posted", data.url);
    return data;
  } catch (err) {
    throw new Error(
      `postImage: status posting failed for "${options.status}": ${err.message}`,
    );
  }
};

export default postImage;
