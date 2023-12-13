import dotenv from "dotenv";
dotenv.config();

// import bot from "./bots/lighthouses/bot.js";
import bot from "./bots/threadsfederated/bot.js";
// import bot from './bots/wikipediatopedits/bot.js';

bot();
