import fetch from 'node-fetch';
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

  const response = await fetch(`${client.config.api_url}/statuses`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + client.config.access_token,
    },
    body: JSON.stringify(optionsObj),
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.log("postPoll error:", responseData);
    return responseData;
  }

  console.log("poll posted", responseData.url);

  return responseData;
};

export default postPoll;
