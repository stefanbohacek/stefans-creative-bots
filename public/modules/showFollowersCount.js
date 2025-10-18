const loadFollowersForCard = async (card) => {
  const botLinks = card.querySelector(".bot-links");
  if (!botLinks) return;

  const mastodonLink = [...botLinks.querySelectorAll("a")].find(
    link => link.innerHTML === "Follow on Mastodon"
  );

  if (!mastodonLink) return;

  const followersCountElement = card.querySelector(".followers-count");
  const lastPostElement = card.querySelector(".last-run");
  if (!followersCountElement) return;

  if (!followersCountElement.classList.contains("d-none") || followersCountElement.dataset.checked === "true") return;

  try {
    const resp = await fetch(`/fediverse-info?url=${mastodonLink.href}`);
    const respJSON = await resp.json();
    
    if (respJSON.followers) {
      followersCountElement.innerHTML = `${respJSON.followers.toLocaleString()} followers`;
      followersCountElement.classList.remove("d-none");
    }
    // if (lastPostElement && respJSON.last_status_at) {
    //   lastPostElement.innerHTML = dayjs(respJSON.last_status_at).fromNow();
    // }
    followersCountElement.dataset.checked = "true";
  } catch (error) {
    console.error("showFollowersCount error:", error);
    followersCountElement.dataset.checked = "true";
  }
};

export default async () => {
  const cards = [...document.querySelectorAll(".card")];
  
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadFollowersForCard(entry.target);
        }
      });
    },
    {
      rootMargin: "100px",
      threshold: 0.1
    }
  );

  cards.forEach(card => {
    observer.observe(card);
  });

  const initiallyVisibleCards = cards.filter(card => {
    const rect = card.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  });

  initiallyVisibleCards.forEach(card => {
    loadFollowersForCard(card);
  });
};