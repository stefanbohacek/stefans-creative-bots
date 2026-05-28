import getFediverseAccountInfo from "../modules/getFediverseAccountInfo.js";
import db from "../modules/db.js";
import express from "express";
const router = express.Router();

router.get("/all", async (req, res) => {
  const [rows] = await db.execute(
    /* sql */`SELECT username, server, display_name, avatar, followers, following_count, posts, last_status_at
     FROM fediverse_account_info
     WHERE display_name IS NOT NULL`
  );

  const result = {};
  for (const row of rows) {
    result[`@${row.username}@${row.server}`] = {
      displayName: row.display_name,
      avatar: row.avatar,
      followers: row.followers,
      following: row.following_count,
      posts: row.posts,
      last_status_at: row.last_status_at,
    };
  }

  res.status(200).json(result);
});

router.get("/", async (req, res) => {
  const { url } = req.query;
  const fediverseAccountInfo = await getFediverseAccountInfo(url);
  res.status(200).json(fediverseAccountInfo);
});

export default router;
