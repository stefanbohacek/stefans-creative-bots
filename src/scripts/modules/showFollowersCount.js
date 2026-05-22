const loadFollowersForCard = async (card) => {
  const botLinks = card.querySelector(".bot-links");

  if (botLinks) {
    const fediverseLink = [...botLinks.querySelectorAll("a")].find(
      (link) => link.textContent.trim() === "Follow on Mastodon",
    );

    if (fediverseLink) {
      const followersCountEl = card.querySelector(".followers-count");

      if (followersCountEl && followersCountEl.dataset.checked !== "true") {
        try {
          const url = fediverseLink.dataset.fediverseUrl || fediverseLink.href;
          const resp = await fetch(`/fediverse-info?url=${url}`);
          const respJSON = await resp.json();

          if (respJSON.followers) {
            followersCountEl.innerHTML = `${respJSON.followers.toLocaleString()} followers`;
            followersCountEl.classList.remove("d-none");
          }
          followersCountEl.dataset.checked = "true";
        } catch (error) {
          console.error("showFollowersCount error:", error);
          followersCountEl.dataset.checked = "true";
        }
      }
    }
  }
};

export default async () => {
  const cards = [...document.querySelectorAll(".card")];

  if (cards.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadFollowersForCard(entry.target);
          }
        });
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    cards.forEach((card) => {
      observer.observe(card);
    });
  }
};
