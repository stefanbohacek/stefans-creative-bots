import fs from "fs/promises";
import path from "path";
import sleep from "./sleep.js";

export default async (fediverseLinkURL) => {
  const url = new URL(fediverseLinkURL);
  const server = url.hostname;
  const username = url.pathname.substring(2);

  console.log(
    `getFediverseAccountInfo: loading data for @${username}@${server}...`
  );

  const filename = `@${username}@${server}.json`;
  const dataDir = "./data/fediverse";
  const filePath = path.join(dataDir, filename);

  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.log(`getFediverseAccountInfo error: @${username}@${server}`, error);
  }

  let shouldFetch = true;

  try {
    const stats = await fs.stat(filePath);
    const fileAge = Date.now() - stats.mtime.getTime();
    const fileAgeThreshold = 3 * 60 * 60 * 1000;

    if (fileAge < fileAgeThreshold) {
      shouldFetch = false;
      const cachedData = await fs.readFile(filePath, "utf8");
      return JSON.parse(cachedData);
    }
  } catch (error) {
    shouldFetch = true;
  }

  if (!shouldFetch) {
    const cachedData = await fs.readFile(filePath, "utf8");
    return JSON.parse(cachedData);
  }

  try {
    await sleep(1000);    
    const resp = await fetch(
      `https://${server}/api/v1/accounts/lookup?acct=${username}`
    );

    if (!resp.ok) {
      console.log(
        `getFediverseAccountInfo error: @${username}@${server}`,
        resp.statusText
      );
      return {};
    }

    const accountData = await resp.json();

    if (!accountData.id || typeof accountData.followers_count !== "number") {
      return {};
    }

    const result = {
      displayName: accountData.display_name,
      avatar: accountData.avatar,
      followers: accountData.followers_count,
      following: accountData.following_count,
      posts: accountData.statuses_count,
      fetchedAt: new Date().toISOString(),
    };

    await fs.writeFile(filePath, JSON.stringify(result, null, 2), "utf8");

    return result;
  } catch (error) {
    console.log(`getFediverseAccountInfo error: @${username}@${server}`, error);

    try {
      const cachedData = await fs.readFile(filePath, "utf8");
      return JSON.parse(cachedData);
    } catch (cacheError) {
      console.log(
        `getFediverseAccountInfo error: @${username}@${server}`,
        error
      );
      return {};
    }
  }
};
