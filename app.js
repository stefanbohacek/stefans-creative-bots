import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express from "express";
import compression from "compression";
import { engine } from "express-handlebars";
import session from "express-session";
import bodyParser from "body-parser";
import createMemoryStore from "memorystore";
import Grant from "grant-express";
// import tumblr from 'tumblr.js';

import { notifyAdmin } from "./modules/email.js";
import indexRoute from "./routes/index.js";
import triggerRoute from "./routes/trigger.js";
import fediverseInfoRoute from "./routes/fediverse-info.js";
import rssFeedRoute from "./routes/feed.js";
import botStatusRoute from "./routes/bot-status.js";
// import connectTumblrRoute from "./routes/connect-tumblr.js";
// import callbackRoute from "./routes/callback.js";
// import disconnectRoute from "./routes/disconnect.js";

const app = express();
const MemoryStore = createMemoryStore(session);

let criticalCSS = "";
if (process.env.ENVIRONMENT === "production") {
  try {
    criticalCSS = readFileSync("./public/styles/critical.css", "utf8");
  } catch {}
}

app.use(async (req, res, next) => {
  if (process.env.ENVIRONMENT === "production") {
    res.locals.critical_css = criticalCSS;
  } else {
    try {
      res.locals.critical_css = await readFile("./public/styles/critical.css", "utf8");
    } catch {
      res.locals.critical_css = "";
    }
  }
  next();
});

app.engine("handlebars", engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(compression());
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

console.log("loading app...");

app.get("/health", (req, res) => res.sendStatus(200));

app.use("/", indexRoute);
app.use("/trigger", triggerRoute);
app.use("/fediverse-info", fediverseInfoRoute);
app.use("/feed", rssFeedRoute);
app.use("/bot-status", botStatusRoute);
app.use("/images", express.static(__dirname + "/temp/"));

app.use(express.static("public"));
app.use(express.static("views"));

app.use(async (err, req, res, next) => {
  console.error("express error:", err);
  await notifyAdmin("Express error", `<pre>${err?.stack || err}</pre>`);
  res.status(500).send("Internal server error");
});

export default app;
