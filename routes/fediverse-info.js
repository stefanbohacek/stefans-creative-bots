import getFediverseAccountInfo, { mapFediverseRow } from "../modules/getFediverseAccountInfo.js";
import db from "../modules/db.js";
import express from "express";
const router = express.Router();

router.get("/all", async (req, res) => {
  const [rows] = await db.execute(
    /* sql */`SELECT * FROM fediverse_account_info WHERE display_name IS NOT NULL`
  );

  const result = {};
  for (const row of rows) {
    result[`@${row.username}@${row.server}`] = mapFediverseRow(row);
  }

  res.status(200).json(result);
});

router.get("/", async (req, res) => {
  const { url } = req.query;
  const fediverseAccountInfo = await getFediverseAccountInfo(url);
  res.status(200).json(fediverseAccountInfo);
});

export default router;
