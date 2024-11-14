import fetch from "node-fetch";
import splitText from "./../split-text.js";
import sleep from "./../sleep.js";

const postFn = async (domain, token, options) => {
  const response = await fetch(`https://${domain}/api/v1/statuses`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(options),
  });

  const responseData = await response.json();
  return responseData;
};

const post = async (domain, token, options) => {
  console.log("posting...", options);

  let { status } = options;
  let splitStatus = false;
  let statuses;
  let responses = [];

  if (status.length > 500) {
    splitStatus = true;

    statuses = splitText(status, 490);

    if (statuses.length > 1) {
      options.status = `${statuses.shift()}…`;
    }
  }

  const responseData = await postFn(domain, token, options);

  responses.push(responseData);

  if (splitStatus) {
    options.status = statuses.join("");
    options.in_reply_to_id = responseData.id;
    await sleep(1000);
    await post(domain, token, options);
  } else {
    return responses;
  }
};

export default post;
