import getReferrerServer from "./getReferrerServer.js";

const STORAGE_KEY = "fediverse_server";

const getInteractionUrl = (server, platform, uri) => {
  switch (platform) {
    case "mastodon":
    case "hometown":
    case "glitch-soc":
    case "fedibird":
      return `https://${server}/authorize_interaction?uri=${uri}`;
    case "misskey":
      return `https://${server}/authorize-follow?acct=${uri}`;
    case "pleroma":
    case "akkoma":
      return `https://${server}/ostatus_subscribe?acct=${uri}`;
    // case "lemmy":
    //   return `https://${server}/activitypub/externalInteraction?uri=${uri}`;
    case "friendica":
      return `https://${server}/contact/follow?url=${uri}`;
    default:
      return null;
  }
};

const updateFediverseLinks = (server, platform) => {
  document.querySelectorAll("[data-fediverse-url]").forEach((link) => {
    const url =
      server && getInteractionUrl(server, platform, link.dataset.fediverseUrl);
    link.href = url || link.dataset.fediverseUrl;
  });
};

const updateFsbInput = (server) => {
  const fsbInput = document.querySelector(".fsb-domain");
  if (fsbInput) {
    fsbInput.value = server;
    fsbInput.dispatchEvent(new Event("input", { bubbles: true }));
  }
};

const updateFollowLinks = async (server) => {
  localStorage.setItem(STORAGE_KEY, server);
  updateFsbInput(server);

  let platform = "mastodon";
  if (server !== "mastodon.social") {
    try {
      const resp = await fetch(
        `https://fediverse-info.stefanbohacek.com/node-info?domain=${server}`,
      );
      const data = await resp.json();
      platform = data?.software?.name?.toLowerCase();
    } catch (err) {}
  }

  updateFediverseLinks(server, platform);

  const linksUpdated = getInteractionUrl(server, platform, "") !== null;
  const note = document.getElementById("fediverse-server-unknown");
  if (note) {
    note.classList.toggle("d-none", linksUpdated);
  }

  return linksUpdated;
};

export default async () => {
  document.addEventListener(
    "submit",
    (ev) => {
      if (ev.target.classList.contains("fsb-prompt")) {
        const fsbInput = e.target.querySelector(".fsb-domain");
        if (fsbInput) {
          fsbInput.dataset.software = "";
        }
      }
    },
    true,
  );

  const input = document.getElementById("fediverse-server-input");

  if (input) {
    const param = new URLSearchParams(window.location.search).get("server");
    const stored = localStorage.getItem(STORAGE_KEY);

    if (param) {
      localStorage.setItem(STORAGE_KEY, param);
    }

    const server = param || stored || "mastodon.social";
    input.value = server;
    updateFollowLinks(server);

    if (!param && !stored) {
      const referrerServer = getReferrerServer();
      if (referrerServer) {
        try {
          const resp = await fetch(
            `https://fediverse-info.stefanbohacek.com/node-info?domain=${referrerServer}`,
          );
          const data = await resp.json();
          const platform = data?.software?.name?.toLowerCase();
          if (getInteractionUrl(referrerServer, platform, "") !== null) {
            input.value = referrerServer;
            updateFollowLinks(referrerServer);
          }
        } catch {
          /* noop */
        }
      }
    }

    const updateBtn = document.getElementById("fediverse-server-update");

    const handleUpdate = async () => {
      let server = input.value
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      const handleMatch = server.match(/^@?[^@]+@([^@]+)$/);
      if (handleMatch) {
        server = handleMatch[1];
      }
      input.value = server;
      const errorMessage = document.getElementById("fediverse-server-error");
      if (errorMessage) {
        errorMessage.classList.toggle(
          "d-none",
          !server ||
            server.split(".").filter((part) => part.length > 0).length >= 2,
        );
      }
      if (
        server &&
        server.split(".").filter((part) => part.length > 0).length >= 2
      ) {
        if (updateBtn) {
          updateBtn.disabled = true;
          updateBtn.textContent = "Updating...";
        }
        const linksUpdated = await updateFollowLinks(server);
        if (updateBtn) {
          updateBtn.disabled = false;
          updateBtn.textContent = "Update";
        }
        const updatedNote = document.getElementById("fediverse-server-updated");
        if (updatedNote) {
          updatedNote.classList.toggle("d-none", !linksUpdated);
          if (linksUpdated) {
            setTimeout(() => updatedNote.classList.add("d-none"), 5000);
          }
        }
      }
    };

    updateBtn?.addEventListener("click", handleUpdate);

    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        handleUpdate();
      }
    });
  }
};
