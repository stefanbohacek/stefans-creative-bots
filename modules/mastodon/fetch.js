import sleep from "../sleep.js";
import { requestWithRetry } from "./request.js";

const fetchPage = async (url) => {
  await sleep(1000);
  console.log(`mastodon fetch: ${url}`);

  const resp = await requestWithRetry(url, {
    headers: {
      Authorization: `Bearer ${process.env.MASTODON_UTILITY_ACCESS_TOKEN}`,
    },
  });

  const respText = await resp.text();
  let data;
  try {
    data = JSON.parse(respText);
  } catch (err) {
    throw new Error(
      `failed to parse JSON from ${url} (HTTP ${resp.status}): ${respText.slice(0, 200)}`,
    );
  }

  const linkHeader = resp.headers.get("link");
  let nextPage = null;

  if (linkHeader) {
    const match = /<([^>]+)>; rel="next"/.exec(linkHeader);
    if (match) {
      nextPage = match[1];
    }
  }

  if (nextPage) {
    return data.concat(await fetchPage(nextPage));
  }

  return data;
};

export const mastodonFetch = async (instance, endpoint, params = {}) => {
  const url = new URL(`https://${instance}/api/v1/${endpoint}`);
  url.search = new URLSearchParams(params).toString();
  return await fetchPage(url.href);
};
