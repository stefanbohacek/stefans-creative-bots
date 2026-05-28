import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, "../temp");

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

await db.query(/* sql */`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
await db.query(/* sql */`USE \`${process.env.DB_NAME}\``);

await db.execute(/* sql */`
  CREATE TABLE IF NOT EXISTS bot_pool (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bot_name VARCHAR(255) UNIQUE NOT NULL
  )
`);

await db.execute(/* sql */`
  CREATE TABLE IF NOT EXISTS what_capital_question (
    id INT PRIMARY KEY,
    country VARCHAR(255),
    capital VARCHAR(255),
    current_question VARCHAR(255)
  )
`);

await db.execute(/* sql */`
  CREATE TABLE IF NOT EXISTS what_capital_scores (
    username VARCHAR(255) PRIMARY KEY,
    score INT DEFAULT 0
  )
`);

await db.execute(/* sql */`
  CREATE TABLE IF NOT EXISTS mastodon_mobile_apps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(50),
    github_repo VARCHAR(255),
    app_download VARCHAR(500),
    current_version VARCHAR(100)
  )
`);

await db.execute(/* sql */`
  CREATE TABLE IF NOT EXISTS mastodon_roadmap_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id VARCHAR(255) NOT NULL,
    category ENUM('released','nextRelease','exploring') NOT NULL,
    label VARCHAR(500) NOT NULL,
    description TEXT,
    UNIQUE KEY uq_item_category (item_id, category)
  )
`);

await db.execute(/* sql */`
  CREATE TABLE IF NOT EXISTS fediverse_account_info (
    username VARCHAR(255) NOT NULL,
    server VARCHAR(255) NOT NULL,
    display_name VARCHAR(500),
    avatar VARCHAR(500),
    followers INT,
    following_count INT,
    posts INT,
    last_status_at VARCHAR(50),
    fetched_at TIMESTAMP,
    PRIMARY KEY (username, server)
  )
`);

console.log("tables created");

const poolFilePath = path.join(tempDir, "pool.json");
if (fs.existsSync(poolFilePath)) {
  const botPool = JSON.parse(fs.readFileSync(poolFilePath, "utf8"));
  for (const botName of botPool) {
    await db.execute(/* sql */`INSERT IGNORE INTO bot_pool (bot_name) VALUES (?)`, [
      botName,
    ]);
  }
  console.log(`bot_pool: inserted ${botPool.length} item(s)`);
} else {
  console.log("bot_pool: pool.json not found, skipping...");
}

const whatCapitalFilePath = path.join(tempDir, "what_capital.json");
if (fs.existsSync(whatCapitalFilePath)) {
  const data = JSON.parse(fs.readFileSync(whatCapitalFilePath, "utf8"));

  await db.execute(
    /* sql */
    `INSERT INTO what_capital_question (id, country, capital, current_question) VALUES (1, ?, ?, ?)
     ON DUPLICATE KEY UPDATE country = VALUES(country), capital = VALUES(capital), current_question = VALUES(current_question)`,
    [data.country || "", data.capital || "", data.current_question || ""],
  );
  console.log("what_capital_question: inserted");

  if (data.scores) {
    let scoreCount = 0;
    for (const [username, score] of Object.entries(data.scores)) {
      await db.execute(
        /* sql */`INSERT IGNORE INTO what_capital_scores (username, score) VALUES (?, ?)`,
        [username, score],
      );
      scoreCount++;
    }
    console.log(`what_capital_scores: inserted ${scoreCount} score(s)`);
  }
} else {
  console.log("what_capital: what_capital.json not found, skipping...");
}

const mobileAppsFilePath = path.join(tempDir, "mastodon_mobile_apps.json");
if (fs.existsSync(mobileAppsFilePath)) {
  const apps = JSON.parse(fs.readFileSync(mobileAppsFilePath, "utf8"));
  for (const app of apps) {
    await db.execute(
      /* sql */
      `INSERT IGNORE INTO mastodon_mobile_apps (app, platform, github_repo, app_download, current_version) VALUES (?, ?, ?, ?, ?)`,
      [
        app.app,
        app.platform,
        app.github_repo,
        app.app_download,
        app.current_version,
      ],
    );
  }
  console.log(`mastodon_mobile_apps: inserted ${apps.length} app(s)`);
} else {
  console.log(
    "mastodon_mobile_apps: mastodon_mobile_apps.json not found, skipping...",
  );
}

const roadmapDir = path.join(tempDir, "mastodon-roadmap");
const roadmapCategories = [
  { file: "released.json", category: "released" },
  { file: "nextRelease.json", category: "nextRelease" },
  { file: "exploring.json", category: "exploring" },
];

let roadmapCount = 0;
for (const { file, category } of roadmapCategories) {
  const filePath = path.join(roadmapDir, file);
  if (fs.existsSync(filePath)) {
    const items = JSON.parse(fs.readFileSync(filePath, "utf8"));
    for (const item of items) {
      await db.execute(
        /* sql */`INSERT IGNORE INTO mastodon_roadmap_items (item_id, category, label, description) VALUES (?, ?, ?, ?)`,
        [item.id, category, item.label, item.description || ""],
      );
      roadmapCount++;
    }
  }
}
console.log(`mastodon_roadmap_items: inserted ${roadmapCount} item(s).`);

await db.end();
console.log("migration complete");
