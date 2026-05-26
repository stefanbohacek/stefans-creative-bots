import { readFile, writeFile } from "fs/promises";
import Handlebars from "handlebars";

const getTimestamp = () => `[${new Date().toISOString()}]`;

console.log(getTimestamp(), "reading templates...");

const [layoutSource, homeSource] = await Promise.all([
  readFile("views/layouts/main.handlebars", "utf8"),
  readFile("views/home.handlebars", "utf8"),
]);

const body = Handlebars.compile(homeSource)({ categories: [] });
const html = Handlebars.compile(layoutSource)({ body, critical_css: "" });

console.log(getTimestamp(), "templates compiled");
console.log(getTimestamp(), "loading critical CSS generator...");

const { generate } = await import("critical");

console.log(getTimestamp(), "launching Chrome...");

try {
  const { css } = await generate({
    html,
    base: "public/",
    css: ["styles/main.css"],
    inline: false,
    width: 1300,
    height: 900,
  });

  console.log(getTimestamp(), "Chrome launched");
  console.log(getTimestamp(), "extracting theme variables...");

  const mainCSS = await readFile("public/styles/main.css", "utf8");
  const themeCSS = (
    mainCSS.match(/\[data-bs-theme[^{\s]+\{[^}]+\}/g) ?? []
  ).filter((b) => b.includes("--hh-"));

  const criticalCSSPath = "public/styles/critical.css";

  await writeFile(criticalCSSPath, themeCSS.join("") + css.toString());

  console.log(getTimestamp(), `critical CSS saved to ${criticalCSSPath}`);
} catch (err) {
  console.error(getTimestamp(), "error generating critical CSS:", err);
  process.exit(1);
}
