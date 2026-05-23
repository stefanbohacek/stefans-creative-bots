import dayjs from "dayjs";

const formatRelative = (iso) => {
  const text = dayjs(iso).fromNow();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export default async () => {
  const timeEls = document.querySelectorAll("time.relative-time[data-handle]");
  if (!timeEls.length) return;

  try {
    const statuses = await fetch("/bot-status").then((r) => r.json());
    timeEls.forEach((el) => {
      const status = statuses[el.dataset.handle];
      if (!status) return;
      const ts = el.dataset.runType === "next" ? status.next_run : status.last_run;
      if (ts) el.textContent = formatRelative(ts);
    });
  } catch (err) {
    console.error("showRelativeTimes error:", err);
  }
};
