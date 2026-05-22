import express from "express";
import moment from "moment";
import { readFileSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import getRandomRange from "./../modules/get-random-range.js";
import capitalizeFirstLetter from "./../modules/capitalize-first-letter.js";
import slugify from "./../modules/slugify.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const categoriesConfig = JSON.parse(
  readFileSync(`${__dirname}/../config/categories.json`, "utf8"),
);

const router = express.Router();

router.get("/", (req, res) => {
  if (req.session && req.session.grant) {
    if (req.session.grant.response) {
      console.log("grant", req.session.grant.response);
    }
  }
  let bots = req.app.get("bots");

  if (bots && bots.length > 0) {
    bots.forEach((bot) => {
      if (bot.about.date_created) {
        bot.about.created_ago = capitalizeFirstLetter(
          moment(bot.about.date_created).fromNow(),
        );
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
          bot.about.next_run = capitalizeFirstLetter(
            moment(bot.cronjob.nextDates().ts).fromNow(),
          );
          if (bot.cronjob.lastExecution) {
            bot.about.last_run = capitalizeFirstLetter(
              moment(bot.cronjob.lastExecution).fromNow(),
            );
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
    generative_placeholders_color: getRandomRange(0, 99),
    footer_scripts: process.env.FOOTER_SCRIPTS,
  });
});

export default router;
