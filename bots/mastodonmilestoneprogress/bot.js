import fetch from "node-fetch";
import mastodonClient from "./../../modules/mastodon/index.js";

const botScript = async () => {
  const response = await fetch(
    "https://api.github.com/repos/mastodon/mastodon/milestones"
  );
  const milestones = await response.json();

  const status = "Daily #mastodon #milestones update:\n\n";
  let statusUpdates = [];

  if (milestones && milestones.length) {
    milestones.forEach((milestone) => {
      const progress = Math.round(
        100 * (milestone.closed_issues / (milestone.closed_issues + milestone.open_issues))
      );

      statusUpdates.push(
        `${milestone.title}: ${milestone.html_url}\n- ${milestone.open_issues} open issue(s)\n- ${milestone.closed_issues} closed issue(s)\n- ${progress}% progress\n`
      );
    });
  }

  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token:
      process.env.MASTODON_MILESTONE_PROGRESS_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  mastodon.post({
    status: status + statusUpdates.join("\n"),
  });

  return true;
};

export default botScript;
