import { apiRequest } from "./request.js";

const postPoll = async (client, status, options, params) => {
  console.log("posting a poll...");

  let optionsObj = {
    status,
    poll: {
      options: options,
      expires_in: 86400,
    },
  };

  if (params?.in_reply_to_id) {
    optionsObj.in_reply_to_id = params.in_reply_to_id;
  }

  if (params?.media_ids) {
    optionsObj.media_ids = params.media_ids;
  }

  try {
    const data = await apiRequest(client, "statuses", {
      method: "POST",
      json: optionsObj,
    });
    console.log("poll posted", data.url);
    return data;
  } catch (err) {
    throw new Error(`postPoll: status posting failed: ${err.message}`);
  }
};

export default postPoll;
