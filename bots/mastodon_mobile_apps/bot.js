import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from 'fs';
import fetch from 'node-fetch';
import mastodonClient from "./../../modules/mastodon/index.js";
import truncate from "./../../modules/truncate.js";

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
      "app_download": "https://play.google.com/store/apps/details?id=org.joinmastodon.android",
      "current_version": ""
    },
    {
      "app": "Mastodon for iOS",
      "platform": "iOS",
      "github_repo": "mastodon/mastodon-ios",
      "app_download": "https://apps.apple.com/us/app/mastodon-for-iphone-and-ipad/id1571998974",
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
        console.log(`found new ${app.platform} version: ${currentRelease.tag_name} (current: ${app.current_version})`);
        
        app.current_version = currentRelease.tag_name;
        let status = `New ${app.platform} release (${currentRelease.tag_name})!\n\n${currentRelease.body ? truncate(currentRelease.body, 400) : ""}`;
        status += `\n\n- https://github.com/${app.github_repo}/releases\n- ${app.app_download}\n\n#mastodon #update #release #${app.platform.toLowerCase()}`;
        console.log(status);
        mastodon.post({ status });

      } else {
        console.log(`no new ${app.platform} version found (current: ${app.current_version})`);
      }
    }
  }, Promise.resolve());
  fs.writeFileSync(savedDataPath, JSON.stringify(apps, null, 2), "utf8");
};

export default botScript;
