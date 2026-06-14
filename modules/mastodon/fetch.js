import sleep from "../sleep.js";

const fetchPage = async (url) => {
  await sleep(1000);
  console.log(`mastodon fetch: ${url}`);

  let resp;
  try {
    resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.MASTODON_UTILITY_ACCESS_TOKEN}`,
      },
    });
  } catch (err) {
    console.log(`mastodon fetch error for ${url}:`, err.cause?.message || err.message);
    return [];
  }

  if (!resp.ok) {
    console.log(`mastodon fetch error: ${resp.status} ${resp.statusText} (${url})`);
    return [];
  }

  const respText = await resp.text();
  let data;
  try {
    data = JSON.parse(respText);
  } catch (err) {
    console.log(`mastodon fetch: failed to parse JSON from ${url} (HTTP ${resp.status}):`, respText.slice(0, 200));
    return [];
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
  try {
    const url = new URL(`https://${instance}/api/v1/${endpoint}`);
    url.search = new URLSearchParams(params).toString();
    return await fetchPage(url.href);
  } catch (err) {
    console.log(`mastodonFetch error: ${endpoint}`, err);
    return [];
  }
};
