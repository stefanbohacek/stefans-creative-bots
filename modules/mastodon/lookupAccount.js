export default async (username, server) => {
  const resp = await fetch(
    `https://${server}/api/v1/accounts/lookup?acct=${username}`,
  );

  if (!resp.ok) {
    return null;
  }

  const data = await resp.json();

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
