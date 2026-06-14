import { json as fetchJSON } from "../fetch.js";

export default async (username, server) => {
  let data;
  try {
    data = await fetchJSON(`https://${server}/api/v1/accounts/lookup?acct=${username}`);
  } catch (err) {
    console.log(`lookupAccount error for @${username}@${server}:`, err.message);
    return null;
  }

  if (!data.id || typeof data.followers_count !== "number") {
    return null;
  }

  return {
    displayName: data.display_name,
    avatar: data.avatar,
    followers: data.followers_count,
    following: data.following_count,
    posts: data.statuses_count,
    last_status_at: data.last_status_at,
  };
};
