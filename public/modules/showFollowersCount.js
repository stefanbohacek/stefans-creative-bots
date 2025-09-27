export default async () => {
  const botLinksSection = [...document.getElementsByClassName("bot-links")];

  for (const botLinks of botLinksSection) {
    const botLinksArray = [...botLinks.querySelectorAll("a")];

    for (const botLink of botLinksArray) {
      if (botLink.innerHTML === "Follow on Mastodon") {
        try {
          const resp = await fetch(`/fediverse-info?url=${botLink.href}`);
          const respJSON = await resp.json();

          if (respJSON.followers) {
            const card = botLinks.closest(".card");
            const followersCountElement =
              card.querySelector(".followers-count");

            followersCountElement.innerHTML = `${respJSON.followers.toLocaleString()} followers`;
            followersCountElement.classList.remove("d-none");
          }
        } catch (error) {
          console.error("showFollowersCount error:", error);
        }
      }
    }
  }
};
