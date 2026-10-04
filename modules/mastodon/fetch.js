import sleep from "../sleep.js";

const MAX_ATTEMPTS = 5;
const MAX_RATE_LIMIT_WAIT_MS = 5 * 60 * 1000;

const getRetryDelay = (resp, attempt) => {
  let delay = 5000 * attempt;

  if (resp?.status === 429) {
    const retryAfter = Number(resp.headers.get("retry-after"));
    const resetTime = Date.parse(resp.headers.get("x-ratelimit-reset"));

    if (retryAfter > 0) {
      delay = retryAfter * 1000;
    } else if (!Number.isNaN(resetTime)) {
      delay = resetTime - Date.now();
    } else {
      delay = 60000;
    }
  }

  return Math.min(Math.max(delay, 1000), MAX_RATE_LIMIT_WAIT_MS);
};

const fetchPage = async (url) => {
  let resp;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await sleep(1000);
    console.log(`mastodon fetch: ${url}`);

    let failure = null;
    resp = null;

    try {
      resp = await fetch(url, {
        headers: {
          Authorization: `Bearer ${process.env.MASTODON_UTILITY_ACCESS_TOKEN}`,
        },
      });

      if (!resp.ok) {
        failure = new Error(`${resp.status} ${resp.statusText} (${url})`);
        failure.retryable = resp.status === 429 || resp.status >= 500;
      }
    } catch (err) {
      failure = new Error(`${err.cause?.message || err.message} (${url})`);
      failure.retryable = true;
    }

    if (!failure) {
      break;
    } else if (!failure.retryable || attempt === MAX_ATTEMPTS) {
      throw failure;
    } else {
      const delay = getRetryDelay(resp, attempt);
      console.log(
        `mastodon fetch: ${failure.message}, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt}/${MAX_ATTEMPTS})`,
      );
      await sleep(delay);
    }
  }

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
