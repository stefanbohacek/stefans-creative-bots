import sleep from "./sleep.js";
import db from "./db.js";
import lookupAccount from "./mastodon/lookupAccount.js";

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

    let cachedRows;
    try {
      [cachedRows] = await db.execute(
        /* sql */`SELECT * FROM fediverse_account_info
         WHERE username = ? AND server = ? AND fetched_at > NOW() - INTERVAL 3 HOUR`,
        [username, server]
      );
    } catch (err) {
      console.log(`getFediverseAccountInfo: DB unavailable:`, err.message);
      return {};
    }

    if (cachedRows.length) {
      return mapFediverseRow(cachedRows[0]);
    }

    let lockResult;
    try {
      [lockResult] = await db.execute(
        /* sql */`UPDATE fediverse_account_info SET fetching = 1
         WHERE username = ? AND server = ? AND fetching = 0`,
        [username, server]
      );
    } catch (err) {
      console.log(`getFediverseAccountInfo: DB unavailable:`, err.message);
      return {};
    }

    if (lockResult.affectedRows === 0) {
      let staleRows;
      try {
        [staleRows] = await db.execute(
          /* sql */`SELECT * FROM fediverse_account_info WHERE username = ? AND server = ?`,
          [username, server]
        );
      } catch (err) {
        console.log(`getFediverseAccountInfo: DB unavailable:`, err.message);
        return {};
      }

      if (staleRows.length && staleRows[0].display_name) {
        return mapFediverseRow(staleRows[0]);
      }

      return {};
    }

    try {
      await sleep(1000);
      const accountData = await lookupAccount(username, server);

      if (!accountData) {
        console.log(`getFediverseAccountInfo error: @${username}@${server}`);
        return {};
      }

      const result = { ...accountData, fetchedAt: new Date().toISOString() };

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
          accountData.displayName,
          accountData.avatar,
          accountData.followers,
          accountData.following,
          accountData.posts,
          accountData.last_status_at,
        ]
      );

      return result;
    } catch (error) {
      console.log(
        `getFediverseAccountInfo error: @${username}@${server}`,
        error
      );

      try {
        const [staleRows] = await db.execute(
          /* sql */`SELECT * FROM fediverse_account_info WHERE username = ? AND server = ?`,
          [username, server]
        );

        if (staleRows.length && staleRows[0].display_name) {
          return mapFediverseRow(staleRows[0]);
        }
      } catch (dbErr) {
        console.log(`getFediverseAccountInfo: DB unavailable:`, dbErr.message);
      }

      console.log(
        `getFediverseAccountInfo error: @${username}@${server}`,
        error
      );
      return {};
    } finally {
      try {
        await db.execute(
          /* sql */`UPDATE fediverse_account_info SET fetching = 0 WHERE username = ? AND server = ?`,
          [username, server]
        );
      } catch (err) {
        console.log(`getFediverseAccountInfo: failed to clear lock:`, err.message);
      }
    }
  } else {
    return {};
  }
};
