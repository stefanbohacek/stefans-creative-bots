import { randomUUID } from "node:crypto";
import sleep from "../sleep.js";

const MAX_ATTEMPTS = 5;
const MAX_RATE_LIMIT_WAIT_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 60000;

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

const getApiMessage = async (resp) => {
  const respText = await resp.text();
  let message = respText.slice(0, 200);

  try {
    message = JSON.parse(respText).error || message;
  } catch (err) {
    message = respText.slice(0, 200);
  }

  return message;
};

export const requestWithRetry = async (url, options = {}) => {
  let resp = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let failure = null;
    resp = null;

    try {
      resp = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!resp.ok) {
        const apiMessage = await getApiMessage(resp);
        failure = new Error(
          `${resp.status} ${resp.statusText}: ${apiMessage} (${url})`,
        );
        failure.status = resp.status;
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
        `mastodon request: ${failure.message}, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt}/${MAX_ATTEMPTS})`,
      );
      await sleep(delay);
    }
  }

  return resp;
};

export const apiRequest = async (
  client,
  path,
  { method = "GET", json, formData } = {},
) => {
  if (!client?.config?.api_url || !client?.config?.access_token) {
    throw new Error("mastodon error: missing token or API URL");
  }

  const url = `${client.config.api_url.replace(/\/?$/, "/")}${path}`;
  const headers = { Authorization: `Bearer ${client.config.access_token}` };
  const options = { method, headers };

  if (json) {
    headers["Content-Type"] = "application/json";
    headers["Idempotency-Key"] = randomUUID();
    options.body = JSON.stringify(json);
  } else if (formData) {
    options.body = formData;
  }

  const resp = await requestWithRetry(url, options);
  return await resp.json();
};
