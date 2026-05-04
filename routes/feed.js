import express from "express";
import { Feed } from "feed";

const router = express.Router();

router.get("/", async (req, res) => {
  const bots = req.app.get("bots");

  if (!bots) {
    return res.status(503).send("Service unavailable");
  }

  const activeBots = bots
    .filter((b) => b.about.active && b.about.date_created)
    .sort((a, b) => new Date(b.about.date_created) - new Date(a.about.date_created));

  const mostRecentDate = activeBots.length
    ? new Date(activeBots[0].about.date_created)
    : new Date();

  const feed = new Feed({
    title: "Stefan's Creative Online Bots",
    description: "Latest addition to my Creative Online Bots project.",
    id: "https://bots.stefanbohacek.com/",
    link: "https://bots.stefanbohacek.com/",
    language: "en",
    // image: "https://bots.stefanbohacek.com/TODO.png",
    favicon: "https://bots.stefanbohacek.com/images/icons/favico.ico",
    updated: mostRecentDate,
    feedLinks: {
      rss: "https://bots.stefanbohacek.com/feed",
    },
    author: {
      name: "Stefan Bohacek",
      email: "stefan@stefanbohacek.com",
      link: "https://stefanbohacek.com",
    },
  });

  activeBots.forEach((bot) => {
    const mastodonLink = bot.about.links?.find(
      (link) =>
        link.title === "Follow on Mastodon" ||
        link.url?.includes("stefanbohacek.online")
    );

    feed.addItem({
      title: bot.about.name,
      id: mastodonLink?.url ?? `https://bots.stefanbohacek.com/#${bot.about.name}`,
      link: mastodonLink?.url ?? "https://bots.stefanbohacek.com/",
      description: bot.about.description,
      date: new Date(bot.about.date_created),
      image: bot.about.thumbnail,
    });
  });

  res.set("Content-Type", "application/rss+xml");
  res.send(feed.rss2());
});

export default router;
