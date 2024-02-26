import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from 'fs';
import fetch from 'node-fetch';
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.MASTODON_MOBILE_APPS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.BOTSINSPACE_API_URL,
  });

  let apps;
  const defaultApps = [
    {
      "app": "Mastodon for Android",
      "platform": "Android",
      "github_repo": "mastodon/mastodon-android",
      "current_version": ""
    },
    {
      "app": "Mastodon for iOS",
      "platform": "iOS",
      "github_repo": "mastodon/mastodon-ios",
      "current_version": ""
    }
  ];

  const savedDataPath = __dirname + "/../../data/mastodon_mobile_apps.json";

  if (fs.existsSync(savedDataPath)) {
    apps = JSON.parse(fs.readFileSync(savedDataPath, "utf8"));
  } else {
    apps = defaultApps;
  }

  console.log("checking Mastodon mobile app versions... ");

  await apps.reduce(async (prev, app) => {
    await prev;

    const response = await fetch(`https://api.github.com/repos/${app.github_repo}/releases`);
    const data = await response.json();

    if (data && data.length){
      const currentRelease = data[0];

      if (app.current_version !== currentRelease.tag_name){
        console.log(`found new ${app.platform} version: ${currentRelease.tag_name}`);
        
        app.current_version = currentRelease.tag_name;
        let status = `New ${app.platform} release!\n\n${currentRelease.body ? currentRelease.body : ""}`;
        status += `\n\nhttps://github.com/${app.github_repo}/releases\n\n#mastodon #update #release #${app.platform.toLowerCase()}`;
        console.log(status);
        mastodon.post({ status });

      } else {
        console.log(`no new ${app.platform} version found`);
      }
    }
  }, Promise.resolve());
  fs.writeFileSync(savedDataPath, JSON.stringify(apps, null, 2), "utf8");
};

export default botScript;
