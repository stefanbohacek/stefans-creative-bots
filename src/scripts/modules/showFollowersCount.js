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

const prefillFollowerCounts = async (cards) => {
  try {
    const resp = await fetch("/fediverse-info/all");
    const data = await resp.json();

    for (const card of cards) {
      const botLinks = card.querySelector(".bot-links");
      if (!botLinks) {
        continue;
      }

      const fediverseLink = [...botLinks.querySelectorAll("a")].find(
        (link) => link.textContent.trim() === "Follow on Mastodon",
      );

      if (!fediverseLink) {
        continue;
      }

      const url = fediverseLink.dataset.fediverseUrl || fediverseLink.href;
      const urlObj = new URL(url);
      const handle = `@${urlObj.pathname.substring(2)}@${urlObj.hostname}`;
      const accountData = data[handle];

      if (accountData?.followers) {
        const followersCountEl = card.querySelector(".followers-count");
        if (followersCountEl) {
          followersCountEl.innerHTML = `${accountData.followers.toLocaleString()} followers`;
          followersCountEl.classList.remove("d-none");
          followersCountEl.dataset.checked = "true";
        }
      }
    }
  } catch (error) {
    console.error("prefillFollowerCounts error:", error);
  }
};

export default async () => {
  const cards = [...document.querySelectorAll(".card")];

  if (cards.length) {
    await prefillFollowerCounts(cards);

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
