import dotenv from "dotenv";
dotenv.config();

// import bot from "./bots/test/bot.js";
// import bot from "./bots/thisdatasetdoesnotexist/bot.js";
import bot from "./bots/mastodon_mobile_apps/bot.js";
// import bot from './bots/wikipediatopedits/bot.js';

bot();
