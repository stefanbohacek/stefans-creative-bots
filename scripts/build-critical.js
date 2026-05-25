import app from "../app.js";
import { generate } from "critical";
import { loadBotInfo } from "../modules/loadBots.js";
import { readFile, writeFile } from "fs/promises";

const bots = loadBotInfo(app);
app.set("bots", bots);

const PORT = 3099;
const server = app.listen(PORT);

server.on("listening", async () => {
  console.log("generating critical CSS...");
  try {
    const { css } = await generate({
      base: "public/",
      src: `http://localhost:${PORT}`,
      css: ["styles/main.css"],
      inline: false,
      width: 1300,
      height: 900,
    });

    const mainCSS = await readFile("public/styles/main.css", "utf8");
    const themeCSS = (mainCSS.match(/\[data-bs-theme[^{\s]+\{[^}]+\}/g) ?? []).filter(b => b.includes("--hh-"));
    await writeFile(
      "public/styles/critical.css",
      themeCSS.join("") + css.toString(),
    );
    console.log("critical CSS saved to public/styles/critical.css");
  } catch (err) {
    console.error("failed to generate critical CSS:", err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
});
