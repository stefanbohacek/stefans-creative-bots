import dotenv from "dotenv";
dotenv.config();

// import bot from "./bots/trains/bot.js";
// import bot from './bots/wikipediatopedits/bot.js';
// import bot from "./bots/ignoreallpreviousinstructions/bot.js";
// import bot from "./bots/test/bot.js";
import bot from "./bots/mastodon_roadmap/bot.js";

bot();
