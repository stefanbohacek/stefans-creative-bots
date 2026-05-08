const STORAGE_KEY = "fediverse_server";

const authorizeInteractionPlatforms = ["mastodon", "hometown", "glitch-soc", "fedibird"];

const updateFediverseLinks = (server, platform) => {
  document.querySelectorAll("[data-fediverse-url]").forEach(link => {
    link.href = server && authorizeInteractionPlatforms.includes(platform)
      ? `https://${server}/authorize_interaction?uri=${link.dataset.fediverseUrl}`
      : link.dataset.fediverseUrl;
  });
};

const updateFsbInput = (server) => {
  const fsbInput = document.querySelector(".fsb-domain");
  if (fsbInput) {
    fsbInput.value = server;
    fsbInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
};

const applyServer = async (server) => {
  localStorage.setItem(STORAGE_KEY, server);
  updateFsbInput(server);

  let platform = "mastodon";
  try {
    const resp = await fetch(`https://fediverse-info.stefanbohacek.com/node-info?domain=${server}`);
    const data = await resp.json();
    platform = data?.software?.name?.toLowerCase();
  } catch (err) {}

  updateFediverseLinks(server, platform);

  const note = document.getElementById("fediverse-server-note");
  if (note) { note.classList.toggle("d-none", authorizeInteractionPlatforms.includes(platform)); }
};

export default () => {
  document.addEventListener("submit", (ev) => {
    if (ev.target.classList.contains("fsb-prompt")) {
      const fsbInput = e.target.querySelector(".fsb-domain");
      if (fsbInput) { fsbInput.dataset.software = ""; }
    }
  }, true);

  const input = document.getElementById("fediverse-server-input");

  if (input) {
    const param = new URLSearchParams(window.location.search).get("server");
    const server = param || localStorage.getItem(STORAGE_KEY) || "mastodon.social";
    if (param) { localStorage.setItem(STORAGE_KEY, param); }

    input.value = server;
    applyServer(server);

    const updateBtn = document.getElementById("fediverse-server-update");

    const handleUpdate = async () => {
      const server = input.value.trim();
      if (server) {
        if (updateBtn) {
          updateBtn.disabled = true;
          updateBtn.textContent = "Updating...";
        }
        await applyServer(server);
        if (updateBtn) {
          updateBtn.disabled = false;
          updateBtn.textContent = "Update";
        }
      }
    };

    updateBtn?.addEventListener("click", handleUpdate);

    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") { handleUpdate(); }
    });
  }
};
