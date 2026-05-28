import sleep from "./sleep.js";
import db from "./db.js";

export const mapFediverseRow = (row) => ({
  displayName: row.display_name,
  avatar: row.avatar,
  followers: row.followers,
  following: row.following_count,
  posts: row.posts,
  last_status_at: row.last_status_at,
  fetchedAt: row.fetched_at,
});

export default async (fediverseLinkURL) => {
  const url = new URL(fediverseLinkURL);
  const server = url.hostname;
  const username = url.pathname.substring(2);

  if (["stefanbohacek.online"].includes(server)) {
    console.log(
      `getFediverseAccountInfo: loading data for @${username}@${server}...`
    );

    const [cachedRows] = await db.execute(
      /* sql */`SELECT * FROM fediverse_account_info
       WHERE username = ? AND server = ? AND fetched_at > NOW() - INTERVAL 3 HOUR`,
      [username, server]
    );

    if (cachedRows.length) {
      return mapFediverseRow(cachedRows[0]);
    }

    const [lockResult] = await db.execute(
      /* sql */`UPDATE fediverse_account_info SET fetching = 1
       WHERE username = ? AND server = ? AND fetching = 0`,
      [username, server]
    );

    if (lockResult.affectedRows === 0) {
      const [staleRows] = await db.execute(
        /* sql */`SELECT * FROM fediverse_account_info WHERE username = ? AND server = ?`,
        [username, server]
      );

      if (staleRows.length && staleRows[0].display_name) {
        return mapFediverseRow(staleRows[0]);
      }

      return {};
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
        last_status_at: accountData.last_status_at,
        fetchedAt: new Date().toISOString(),
      };

      await db.execute(
        /* sql */`INSERT INTO fediverse_account_info
         (username, server, display_name, avatar, followers, following_count, posts, last_status_at, fetched_at, fetching)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)
         ON DUPLICATE KEY UPDATE
           display_name = VALUES(display_name),
           avatar = VALUES(avatar),
           followers = VALUES(followers),
           following_count = VALUES(following_count),
           posts = VALUES(posts),
           last_status_at = VALUES(last_status_at),
           fetched_at = NOW(),
           fetching = 0`,
        [
          username,
          server,
          result.displayName,
          result.avatar,
          result.followers,
          result.following,
          result.posts,
          result.last_status_at,
        ]
      );

      return result;
    } catch (error) {
      console.log(
        `getFediverseAccountInfo error: @${username}@${server}`,
        error
      );

      const [staleRows] = await db.execute(
        /* sql */`SELECT * FROM fediverse_account_info WHERE username = ? AND server = ?`,
        [username, server]
      );

      if (staleRows.length && staleRows[0].display_name) {
        return mapFediverseRow(staleRows[0]);
      }

      console.log(
        `getFediverseAccountInfo error: @${username}@${server}`,
        error
      );
      return {};
    } finally {
      await db.execute(
        /* sql */`UPDATE fediverse_account_info SET fetching = 0 WHERE username = ? AND server = ?`,
        [username, server]
      );
    }
  } else {
    return {};
  }
};
