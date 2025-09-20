import dotenv from "dotenv";
dotenv.config();

// import bot from "./bots/trains/bot.js";
// import bot from './bots/wikipediatopedits/bot.js';
// import bot from "./bots/ignoreallpreviousinstructions/bot.js";
// import bot from "./bots/test/bot.js";
// import bot from "./bots/linkedin-openings/bot.js";
// import bot from "./bots/galaxy/bot.js";
// import bot from "./bots/nycdatabot/bot.js";
// import bot from "./bots/roots/bot.js";
import bot from "./bots/birds/bot.js";

try {
  bot();
} catch (error) {
  console.log("TEST:ERROR", error);
}
