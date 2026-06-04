import getFediverseAccountInfo, { mapFediverseRow } from "../modules/getFediverseAccountInfo.js";
import db from "../modules/db.js";
import express from "express";
const router = express.Router();

router.get("/all", async (req, res) => {
  let rows;
  try {
    [rows] = await db.execute(
      /* sql */`SELECT * FROM fediverse_account_info WHERE display_name IS NOT NULL`
    );
  } catch (err) {
    console.log("Failed to load fediverse account info:", err.message);
    return res.status(500).json({ error: "unable to connected to the database" });
  }

  const result = {};
  for (const row of rows) {
    result[`@${row.username}@${row.server}`] = mapFediverseRow(row);
  }

  res.status(200).json(result);
});

router.get("/", async (req, res) => {
  const { url } = req.query;
  try {
    const fediverseAccountInfo = await getFediverseAccountInfo(url);
    res.status(200).json(fediverseAccountInfo);
  } catch (err) {
    console.log("failed to get fediverse account info:", err.message);
    res.status(500).json({ error: "unable to connected to the database" });
  }
});

export default router;
