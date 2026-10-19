const lastChecked = document.getElementById("last-checked");

if (lastChecked) {
  const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const checkedAt = new Date(lastChecked.getAttribute("datetime")).getTime();

  lastChecked.title = new Date(checkedAt).toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  });

  const updateLastChecked = () => {
    const seconds = Math.max(0, Math.round((Date.now() - checkedAt) / 1000));

    if (seconds < 60) {
      lastChecked.textContent = relativeTime.format(-seconds, "second");
    } else if (seconds < 3600) {
      lastChecked.textContent = relativeTime.format(
        -Math.floor(seconds / 60),
        "minute",
      );
    } else {
      lastChecked.textContent = relativeTime.format(
        -Math.floor(seconds / 3600),
        "hour",
      );
    }
  };

  updateLastChecked();
}

const linkPattern =
  /(\S+)\s+\[(https?:\/\/[^\s\[\]]+)\]|https?:\/\/[^\s\[\]]+/g;

document.querySelectorAll(".mention-text").forEach((element) => {
  const text = element.textContent;
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const match of text.matchAll(linkPattern)) {
    const link = document.createElement("a");

    link.href = match[2] || match[0];
    link.textContent = match[1] || match[0];
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    fragment.append(text.slice(lastIndex, match.index), link);
    lastIndex = match.index + match[0].length;
  }

  fragment.append(text.slice(lastIndex));
  element.replaceChildren(fragment);
});

const confirmations = {
  reply: "Send this reply?",
  boost: "Boost this post from {from} to {bot}?",
  like: "Like this post from {from} to {bot}?",
  "boost-like": "Boost and like this post from {from} to {bot}?",
  clear: "Clear this mention?",
};

const confirmClear = (message) => {
  const answer = prompt(`${message}\n\nType CLEAR to confirm.`);
  const confirmed = answer !== null && answer.trim().toLowerCase() === "clear";

  if (answer !== null && !confirmed) {
    alert("Text didn't match, nothing was cleared.");
  }

  return confirmed;
};

const send = async (url, body) => {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await resp.json();

  if (!resp.ok) {
    alert(`Failed: ${data.error}`);
  }

  return resp.ok;
};

document.querySelectorAll("tr[data-id] button").forEach((button) => {
  button.addEventListener("click", async () => {
    const row = button.closest("tr");
    const action = button.dataset.action;
    const text = row.querySelector("textarea").value;
    const message = confirmations[action]
      .replace("{from}", () => row.dataset.from)
      .replace("{bot}", () => row.dataset.bot);

    if (action === "reply" && !text.trim()) {
      alert("Reply text is empty.");
    } else if (action === "clear" ? confirmClear(message) : confirm(message)) {
      const succeeded = await send(`/admin/dashboard/${action}`, {
        id: row.dataset.id,
        text,
      });

      if (
        succeeded &&
        action !== "clear" &&
        confirm("Clear this mention now?")
      ) {
        await send("/admin/dashboard/clear", { id: row.dataset.id });
      }

      if (succeeded) {
        location.reload();
      }
    }
  });
});

const bulkConfirmations = {
  responded: "Clear all mentions with a response?",
  selected: "Clear the selected mentions?",
};

const getSelectedIds = () =>
  [...document.querySelectorAll(".select-mention:checked")].map(
    (checkbox) => checkbox.closest("tr").dataset.id,
  );

const updateSelectedButton = () => {
  const count = getSelectedIds().length;
  const button = document.getElementById("clear-selected");
  button.textContent = `Clear selected mentions (${count})`;
  button.disabled = count === 0;
};

document.querySelectorAll(".select-mention").forEach((checkbox) => {
  checkbox.addEventListener("change", updateSelectedButton);

  checkbox.closest("tr").addEventListener("click", (ev) => {
    const clickedControl = ev.target.closest("a, button, textarea, input");
    const hasSelectedText = window.getSelection().toString() !== "";

    if (!clickedControl && !hasSelectedText) {
      checkbox.checked = !checkbox.checked;
      updateSelectedButton();
    }
  });
});

const selectAll = document.getElementById("select-all");

if (selectAll) {
  selectAll.addEventListener("change", () => {
    document.querySelectorAll(".select-mention").forEach((checkbox) => {
      checkbox.checked = selectAll.checked;
    });
    updateSelectedButton();
  });
}

document.querySelectorAll(".clear-bulk").forEach((button) => {
  button.addEventListener("click", async () => {
    const scope = button.dataset.scope;

    if (confirmClear(bulkConfirmations[scope])) {
      const resp = await fetch(`/admin/dashboard/clear-${scope}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: scope === "selected" ? getSelectedIds() : [],
        }),
      });
      const data = await resp.json();

      if (resp.ok) {
        location.reload();
      } else {
        alert(`Failed: ${data.error}`);
      }
    }
  });
});
