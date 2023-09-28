import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import express from "express";
import { engine } from "express-handlebars";
import session from "express-session";
import bodyParser from "body-parser";
import createMemoryStore from "memorystore";
import Grant from "grant-express";
// import tumblr from 'tumblr.js';

import indexRoute from "./routes/index.js";
import connectTumblrRoute from "./routes/connect-tumblr.js";
import callbackRoute from "./routes/callback.js";
import disconnectRoute from "./routes/disconnect.js";

const app = express();
const MemoryStore = createMemoryStore(session);

app.engine("handlebars", engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

if (process.env.SESSION_SECRET) {
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      secure: true,
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
    })
  );
}

console.log("loading app...");

app.use("/", indexRoute);
app.use("/connect-tumblr", connectTumblrRoute);
app.use("/callback", callbackRoute);
app.use("/disconnect", disconnectRoute);

app.use("/images", express.static(__dirname + "/temp/"));

app.use(express.static("public"));
app.use(express.static("views"));

export default app;
