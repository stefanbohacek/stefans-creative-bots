const reply = async (client, message, response, cb) => {
  console.log("replying...");
  // console.dir(message, { depth: null });

  client.post(
    "statuses",
    {
      in_reply_to_id: message.data.id,
      spoiler_text: message.data.spoiler_text,
      visibility: message.data.visibility,
      status: `@${message.data.account.acct} ${response}`,
    },
    (err, data, response) => {
      if (cb) {
        cb(err, data);
      }
    }
  );
};

export default reply;
