import splitText from "./../splitText.js";
import { apiRequest } from "./request.js";

const post = async (client, options) => {
  console.log("posting...", options);

  const statusOptions = { ...options };
  let remainingText = null;

  if (options.status.length > 500) {
    const statuses = splitText(options.status, 490);

    if (statuses.length > 1) {
      statusOptions.status = `${statuses.shift()}…`;
      remainingText = statuses.join(" ");
    }
  }

  let data;
  try {
    data = await apiRequest(client, "statuses", {
      method: "POST",
      json: statusOptions,
    });
  } catch (err) {
    throw new Error(
      `post: status posting failed for "${statusOptions.status}": ${err.message}`,
    );
  }

  console.log("posted", data.url);

  if (remainingText) {
    const { media_ids, ...replyOptions } = statusOptions;
    await post(client, {
      ...replyOptions,
      status: remainingText,
      in_reply_to_id: data.id,
    });
  }

  return data;
};

export default post;
