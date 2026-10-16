import express from "express";
import db from "../modules/db.js";
import getMastodonClient from "../modules/getMastodonClient.js";

const router = express.Router();
const COOKIE_NAME = "admin_access";

const getCookie = (req, name) => {
  const cookies = (req.headers.cookie || "").split(";");
  let value = null;

  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split("=");
    if (key === name) {
      value = decodeURIComponent(rest.join("="));
    }
  }

  return value;
};

const findMentionedBot = (req, mention) =>
  req.app
    .get("bots")
    .find((bot) => bot.about.fediverse_handle === mention.bot_handle);

const clearMention = async (client, mention) => {
  try {
    await client.dismissNotification({ id: mention.notification_id });
  } catch (err) {
    if (err.status !== 404) {
      throw err;
    }
  }

  await db.execute(/* sql */ `DELETE FROM mentions WHERE id = ?`, [mention.id]);
};

router.use((req, res, next) => {
  const adminAccess = process.env.ADMIN_ACCESS;

  if (adminAccess && req.query.token === adminAccess) {
    res.cookie(COOKIE_NAME, adminAccess, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.ENVIRONMENT === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.redirect(req.baseUrl + req.path);
  } else if (adminAccess && getCookie(req, COOKIE_NAME) === adminAccess) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const bots = req.app.get("bots");
    const [rows] = await db.execute(
      /* sql */ `SELECT * FROM mentions ORDER BY mentioned_at DESC`,
    );

    const mentions = rows.map((row) => {
      const bot = bots.find(
        (botInfo) => botInfo.about.fediverse_handle === row.bot_handle,
      );

      return {
        ...row,
        bot_name: bot ? bot.about.name : row.bot_handle,
        status_url: row.status_url?.startsWith("https://")
          ? row.status_url
          : null,
        mentioned_at: new Date(row.mentioned_at).toLocaleString("en-US"),
      };
    });

    res.render("admin-dashboard", {
      layout: false,
      mentions,
      responded_count: mentions.filter((mention) => mention.responded).length,
    });
  } catch (err) {
    console.log("admin dashboard error:", err);
    res.status(500).send("Failed to load mentions");
  }
});

router.post(
  "/dashboard/clear-:scope(responded|all|selected)",
  async (req, res) => {
    try {
      let rows = [];

      if (req.params.scope === "selected") {
        const ids = Array.isArray(req.body.ids)
          ? req.body.ids.map(Number).filter(Number.isInteger)
          : [];

        if (ids.length) {
          [rows] = await db.query(
            /* sql */ `SELECT * FROM mentions WHERE id IN (?)`,
            [ids],
          );
        }
      } else {
        [rows] = await db.execute(
          req.params.scope === "responded"
            ? /* sql */ `SELECT * FROM mentions WHERE responded = 1`
            : /* sql */ `SELECT * FROM mentions`,
        );
      }

      let cleared = 0;
      let failed = 0;

      for (const mention of rows) {
        const bot = findMentionedBot(req, mention);
        const client = bot ? getMastodonClient(bot) : null;

        if (client) {
          try {
            await clearMention(client, mention);
            cleared++;
          } catch (err) {
            console.log(`clear ${req.params.scope} error: ${err.message}`);
            failed++;
          }
        } else {
          failed++;
        }
      }

      res.json({ cleared, failed });
    } catch (err) {
      console.log(`clear ${req.params.scope} error:`, err);
      res.status(500).json({ error: err.message });
    }
  },
);

router.post("/dashboard/:action", async (req, res) => {
  const { action } = req.params;
  const { id, text } = req.body;

  try {
    const [rows] = await db.execute(
      /* sql */ `SELECT * FROM mentions WHERE id = ?`,
      [id],
    );
    const mention = rows[0];
    const bot = mention ? findMentionedBot(req, mention) : null;
    const client = bot ? getMastodonClient(bot) : null;

    if (!client) {
      res.status(404).json({ error: "Mention or bot token not found" });
    } else if (action === "reply" && !text?.trim()) {
      res.status(400).json({ error: "Reply text is required" });
    } else if (["reply", "boost", "like", "clear"].includes(action)) {
      if (action === "reply") {
        await client.post({
          status: `@${mention.from_acct} ${text.trim()}`,
          in_reply_to_id: mention.status_id,
          visibility: mention.visibility,
          spoiler_text: mention.spoiler_text,
        });
      } else if (action === "boost") {
        await client.boost(mention.status_id);
      } else if (action === "like") {
        await client.favourite(mention.status_id);
      }

      if (action === "clear") {
        await clearMention(client, mention);
      } else {
        await db.execute(
          /* sql */ `UPDATE mentions SET responded = 1 WHERE id = ?`,
          [mention.id],
        );
      }

      res.json({ ok: true });
    } else {
      res.status(400).json({ error: "Unknown action" });
    }
  } catch (err) {
    console.log(`admin ${action} error:`, err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
