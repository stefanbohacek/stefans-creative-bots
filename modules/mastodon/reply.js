import { apiRequest } from "./request.js";

const reply = async (client, message, response) => {
  console.log("replying...");
  // console.dir(message, { depth: null });

  try {
    await apiRequest(client, "statuses", {
      method: "POST",
      json: {
        in_reply_to_id: message.data.id,
        spoiler_text: message.data.spoiler_text,
        visibility: message.data.visibility,
        status: `@${message.data.account.acct} ${response}`,
      },
    });
  } catch (err) {
    console.log(
      `mastodon.reply error: reply to ${message.data.id} failed: ${err.message}`,
    );
  }
};

export default reply;
