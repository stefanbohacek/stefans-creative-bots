import "dotenv/config";

const botNames = process.argv.slice(2).length ? process.argv.slice(2) : ["test"];

for (const botName of botNames) {
  console.log(`Running bot: ${botName}`);
  try {
    const bot = await import(`./bots/${botName}/bot.js`);
    await bot.default();
  } catch (error) {
    console.log(`TEST:ERROR (${botName}):`, error);
  }
}

process.exit(0);
