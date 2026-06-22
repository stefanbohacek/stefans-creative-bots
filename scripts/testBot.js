import "dotenv/config";
import db from "../modules/db.js";

const args = process.argv.slice(2);
const hasRunCount = /^\d+$/.test(args[args.length - 1]);
const runs = hasRunCount ? parseInt(args[args.length - 1]) : 1;
const botArgs = hasRunCount ? args.slice(0, -1) : args;
const botNames = botArgs.length ? botArgs : ["test"];

for (const botName of botNames) {
  for (let i = 0; i < runs; i++) {
    console.log(`Running bot: ${botName}${runs > 1 ? ` (${i + 1}/${runs})` : ""}`);
    try {
      const bot = await import(`../bots/${botName}/bot.js`);
      await bot.default();
    } catch (error) {
      console.log(`TEST:ERROR (${botName}):`, error);
    }
  }
}

await db.end();
