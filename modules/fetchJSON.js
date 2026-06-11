import getSCBUserAgent from "./getSCBUserAgent.js";

const fetchJSON = async (url, options) => {
  options = options || {};
  options.headers = options.headers || {};
  options.headers["User-Agent"] = getSCBUserAgent();

  const response = await fetch(url, options);
  const responseText = await response.text();

  try {
    return JSON.parse(responseText);
  } catch (err) {
    throw new Error(
      `Failed to parse response from ${url}: ${err.message}\n\nResponse body:\n${responseText.slice(0, 500)}`,
    );
  }
};

export default fetchJSON;
