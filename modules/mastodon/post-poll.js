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

  const pollUrl = `${client.config.api_url}/statuses`;
  let response;
  try {
    response = await fetch(pollUrl, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + client.config.access_token,
      },
      body: JSON.stringify(optionsObj),
    });
  } catch (err) {
    throw new Error(`postPoll: fetch failed for ${pollUrl}: ${err.cause?.message || err.message}`);
  }

  const responseText = await response.text();
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch (err) {
    throw new Error(`postPoll: failed to parse response (HTTP ${response.status}): ${responseText.slice(0, 200)}`);
  }

  if (!response.ok) {
    console.log("postPoll error:", responseData);
    return responseData;
  }

  console.log("poll posted", responseData.url);

  return responseData;
};

export default postPoll;
