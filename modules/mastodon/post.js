import splitText from "./../splitText.js";

const post = (client, options, cb) => {
  return new Promise((resolve) => {
    console.log("posting...", options);

    let { status } = options;
    let splitStatus = false;
    let statuses;

    if (status.length > 500) {
      splitStatus = true;

      statuses = splitText(status, 490);

      // console.log({ statuses });

      if (statuses.length > 1) {
        options.status = `${statuses.shift()}…`;
      }
    }

    client.post("statuses", options, async (err, data, response) => {
      if (err) {
        console.log("mastodon.post error", err);
      } else {
        console.log("posted", data.url);
      }

      if (splitStatus) {
        options.status = statuses.join("");
        options.in_reply_to_id = data.id;
        await post(client, options, cb);
      } else {
        if (cb) {
          cb(err, data);
        }
      }

      resolve(data);
    });
  });
};

export default post;
