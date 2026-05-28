import express from "express";
import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import getRandomRange from "./../modules/getRandomRange.js";
import slugify from "./../modules/slugify.js";
import db from "./../modules/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const categoriesConfig = JSON.parse(
  readFileSync(`${__dirname}/../config/categories.json`, "utf8"),
);

const router = express.Router();

let htmlCache = null;
let htmlCacheTime = 0;
let htmlCacheRendering = false;
const HTML_CACHE_TTL = 60 * 60 * 1000;

router.get("/", async (req, res) => {
  if (htmlCache && (Date.now() - htmlCacheTime < HTML_CACHE_TTL || htmlCacheRendering)) {
    return res.send(htmlCache);
  }

  htmlCacheRendering = true;

  if (req.session && req.session.grant) {
    if (req.session.grant.response) {
      console.log("grant", req.session.grant.response);
    }
  }
  let bots = req.app.get("bots");

  if (bots && bots.length > 0) {
    bots.forEach((bot) => {
      if (bot.about.date_created) {
        bot.about.created_year = new Date(bot.about.date_created).getFullYear();
      }

      if (bot.about.links) {
        bot.about.links.forEach((link) => {
          link.is_fediverse = link.title === "Follow on Mastodon";
        });
        const primaryLink = bot.about.links.find((l) =>
          l.title?.startsWith("Follow on"),
        );
        if (primaryLink) {
          bot.about.fediverse_url = primaryLink.url;
        }
      }

      if (bot.cronjob) {
        try {
          bot.about.next_run = new Date(bot.cronjob.nextDates().ts).toISOString();
          if (bot.cronjob.lastExecution) {
            bot.about.last_run = new Date(bot.cronjob.lastExecution).toISOString();
          }
        } catch (err) {
          console.log(err);
        }
      }
    });
  }

  try {
    bots.sort((a, b) =>
      a.about.name.toLowerCase() > b.about.name.toLowerCase() ? 1 : -1,
    );
  } catch (err) {
    console.log(err);
  }

  const activeBots = bots.filter((b) => b.about.active);
  const inactiveBots = bots.filter((b) => !b.about.active);

  const matchesHandle = (bot, handle) =>
    bot.about.fediverse_handle &&
    (bot.about.fediverse_handle === handle ||
      bot.about.fediverse_handle.startsWith(handle + "@"));

  const allCategories = categoriesConfig.map((category) => ({
    ...category,
    slug: slugify(category.title),
    bots: category.bots
      .map((handle) => activeBots.find((b) => matchesHandle(b, handle)))
      .filter(Boolean),
  }));

  const categories = allCategories.filter((c) => c.bots.length > 0);

  const latestBots = [...activeBots]
    .filter((b) => b.about.date_created)
    .sort((a, b) => new Date(b.about.date_created) - new Date(a.about.date_created))
    .slice(0, 6);

  const [followerStatsRows] = await db.execute(
    /* sql */`SELECT unique_followers, unique_servers, calculated_at FROM follower_stats WHERE id = 1`
  );

  let follower_stats = null;
  if (followerStatsRows.length) {
    const row = followerStatsRows[0];
    const date = new Date(row.calculated_at);
    follower_stats = {
      unique_followers: row.unique_followers.toLocaleString("en-US"),
      unique_servers: row.unique_servers.toLocaleString("en-US"),
      calculated_month: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
  }

  const [popularRows] = await db.execute(
    /* sql */`SELECT username, server FROM fediverse_account_info
     WHERE followers IS NOT NULL ORDER BY followers DESC LIMIT 6`
  );

  const popularBots = popularRows
    .map((row) =>
      activeBots.find(
        (b) => b.about.fediverse_handle === `@${row.username}@${row.server}`,
      ),
    )
    .filter(Boolean);

  if (popularBots.length > 0) {
    categories.unshift({
      title: "Popular",
      slug: "popular",
      bots: popularBots,
    });
  }

  if (latestBots.length > 0) {
    categories.unshift({
      title: "Latest",
      slug: "latest",
      bots: latestBots,
    });
  }

  res.render("home", {
    project_name: process.env.PROJECT_NAME,
    bots,
    categories,
    active_bots: activeBots,
    inactive_bots: inactiveBots,
    active_bots_count: activeBots.length.toLocaleString(),
    inactive_bots_count: inactiveBots.length.toLocaleString(),
    bots_count_total: (
      activeBots.length + inactiveBots.length
    ).toLocaleString(),
    follower_stats,
    generative_placeholders_color: getRandomRange(0, 99),
    footer_scripts: process.env.FOOTER_SCRIPTS,
  }, (err, html) => {
    htmlCacheRendering = false;
    if (err) return res.status(500).send(err.message);
    htmlCache = html;
    htmlCacheTime = Date.now();
    res.send(html);
  });
});

export default router;
