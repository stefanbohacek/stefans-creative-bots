import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import lookupAccount from "../modules/mastodon/lookupAccount.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const botsDir = path.join(__dirname, "../bots");

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const botDirs = fs.readdirSync(botsDir).filter((name) => {
  return fs.lstatSync(path.join(botsDir, name)).isDirectory();
});

const accounts = [];

for (const botDir of botDirs) {
  const aboutPath = path.join(botsDir, botDir, "about.json");
  if (!fs.existsSync(aboutPath)) {
    continue;
  }

  const about = JSON.parse(fs.readFileSync(aboutPath, "utf8"));

  if (!about.fediverse_handle) {
    continue;
  }

  const parts = about.fediverse_handle.split("@").filter(Boolean);
  if (parts.length < 2) {
    continue;
  }

  accounts.push({ username: parts[0], server: parts[1] });
}

console.log(`Found ${accounts.length} bot(s) with fediverse handles.`);

for (const { username, server } of accounts) {
  try {
    console.log(`Fetching @${username}@${server}...`);

    const accountData = await lookupAccount(username, server);

    if (!accountData) {
      console.log(`  skipped`);
      continue;
    }

    await db.execute(
      /* sql */ `INSERT INTO fediverse_account_info
       (username, server, display_name, avatar, followers, following_count, posts, last_status_at, fetched_at, fetching)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0)
       ON DUPLICATE KEY UPDATE
         display_name = VALUES(display_name),
         avatar = VALUES(avatar),
         followers = VALUES(followers),
         following_count = VALUES(following_count),
         posts = VALUES(posts),
         last_status_at = VALUES(last_status_at),
         fetched_at = NOW(),
         fetching = 0`,
      [
        username,
        server,
        accountData.displayName,
        accountData.avatar,
        accountData.followers,
        accountData.following,
        accountData.posts,
        accountData.last_status_at,
      ],
    );

    console.log(`  ${accountData.followers.toLocaleString()} followers`);

    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (err) {
    console.log(`  error: ${err.message}`);
  }
}

await db.end();
console.log("Done.");
