import fetch from 'node-fetch';
import mastodonClient from "./../../modules/mastodon/index.js";
import truncate from "./../../modules/truncate.js";
import db from "./../../modules/db.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.MASTODON_MOBILE_APPS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

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

  const [rows] = await db.execute(
    /* sql */`SELECT app, platform, github_repo, app_download, current_version FROM mastodon_mobile_apps`
  );

  const apps = rows.length ? rows : defaultApps;

  console.log("checking Mastodon mobile app versions... ");

  await apps.reduce(async (prev, app) => {
    await prev;

    const response = await fetch(`https://api.github.com/repos/${app.github_repo}/releases`);
    const data = await response.json();

    if (data && data.length) {
      const currentRelease = data[0];

      if (app.current_version !== currentRelease.tag_name) {
        console.log(`found new ${app.platform} version: ${currentRelease.tag_name} (current: ${app.current_version})`);

        app.current_version = currentRelease.tag_name;
        let status = `New ${app.platform} release (${currentRelease.tag_name})!\n\n${currentRelease.body ? truncate(currentRelease.body, 400) : ""}`;
        status += `\n\n- https://github.com/${app.github_repo}/releases\n- ${app.app_download}\n\n#mastodon #update #release #${app.platform.toLowerCase()}`;
        // console.log(status);
        await mastodon.post({ status });

      } else {
        console.log(`no new ${app.platform} version found (current: ${app.current_version})`);
      }
    }
  }, Promise.resolve());

  for (const app of apps) {
    await db.execute(
      /* sql */`INSERT INTO mastodon_mobile_apps (app, platform, github_repo, app_download, current_version) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE current_version = VALUES(current_version)`,
      [app.app, app.platform, app.github_repo, app.app_download, app.current_version]
    );
  }
};

export default botScript;
