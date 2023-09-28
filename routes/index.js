import express from "express";
import moment from "moment";
import getRandomRange from "./../modules/get-random-range.js";

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
      if (bot.cronjob) {
        try {
          bot.about.next_run = moment(bot.cronjob.nextDates().ts).fromNow();
          if (bot.cronjob.lastExecution) {
            bot.about.last_run = moment(bot.cronjob.lastExecution).fromNow();
          }
        } catch (err) {
          console.log(err);
        }
      }
    });
  }

  try {
    bots.sort((a, b) =>
      a.about.name.toLowerCase() > b.about.name.toLowerCase() ? 1 : -1
    );
  } catch (err) {
    console.log(err);
  }

  res.render("home", {
    project_name: process.env.PROJECT_NAME,
    bots,
    generative_placeholders_color: getRandomRange(0, 99),
    footer_scripts: process.env.FOOTER_SCRIPTS,
  });
});

export default router;
