import { readFileSync } from "fs";
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

import indexRoute from "./routes/index.js";
import triggerRoute from "./routes/trigger.js";
import fediverseInfoRoute from "./routes/fediverse-info.js";
import rssFeedRoute from "./routes/feed.js";
// import connectTumblrRoute from "./routes/connect-tumblr.js";
// import callbackRoute from "./routes/callback.js";
// import disconnectRoute from "./routes/disconnect.js";

const app = express();
const MemoryStore = createMemoryStore(session);

let criticalCss = "";
try {
  criticalCss = readFileSync("./public/styles/critical.css", "utf8");
} catch {}

app.use((req, res, next) => {
  res.locals.critical_css = criticalCss;
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
app.use("/images", express.static(__dirname + "/temp/"));

app.use(express.static("public"));
app.use(express.static("views"));

export default app;
