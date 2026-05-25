import dayjs from "dayjs";

const formatRelative = (iso) => {
  const text = dayjs(iso).fromNow();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const populate = (statuses) => {
  document.querySelectorAll("time.relative-time[data-handle]").forEach((el) => {
    const status = statuses[el.dataset.handle];
    if (!status) { return; }
    const ts = el.dataset.runType === "next" ? status.next_run : status.last_run;
    if (ts) {
      el.textContent = formatRelative(ts);
      el.closest("li").classList.remove("d-none");
    }
  });
};

const fetchAndPopulate = async (handles) => {
  try {
    const statuses = await fetch("/bot-status").then((r) => r.json());
    populate(statuses);
    const hasAll = [...handles].every((handle) => statuses[handle]);
    if (!hasAll) {
      setTimeout(() => fetchAndPopulate(handles), 2000);
    }
  } catch (err) {
    console.error("showRelativeTimes error:", err);
    setTimeout(() => fetchAndPopulate(handles), 2000);
  }
};

export default () => {
  const handles = new Set(
    [...document.querySelectorAll("time.relative-time[data-handle][data-run-type='next']")].map(
      (el) => el.dataset.handle
    )
  );

  if (handles.size > 0) {
    fetchAndPopulate(handles);
  }
};
