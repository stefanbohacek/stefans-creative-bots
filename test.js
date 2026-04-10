import dotenv from "dotenv";
dotenv.config();

// import bot from "./bots/test/bot.js";
// import bot from "./bots/roots/bot.js";
// import bot from "./bots/birds/bot.js";
// import bot from "./bots/rorschach/bot.js";
// import bot from "./bots/test/bot.js";
// import bot from "./bots/telescope/bot.js";
// import bot from "./bots/southpoleviews/bot.js";
// import bot from "./bots/arcade/bot.js";
// import bot from "./bots/helloworld__bot/bot.js";
// import bot from "./bots/userboxes/bot.js";
import bot from "./bots/discontinued/bot.js";

try {
  bot();
} catch (error) {
  console.log("TEST:ERROR", error);
}
