import getFediverseAccountInfo from "../modules/getFediverseAccountInfo.js";
import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  const { url } = req.query;
  const fediverseAccountInfo = await getFediverseAccountInfo(url);
  res.status(200).json(fediverseAccountInfo);
});

export default router;
