const populate = (dayjs, statuses) => {
  document
    .querySelectorAll("time[data-handle][data-run-type]")
    .forEach((el) => {
      const status = statuses[el.dataset.handle];
      const key = el.dataset.runType === "next" ? "next_run" : "last_run";

      if (status && status[key]) {
        el.textContent = dayjs(status[key]).fromNow();
        el.closest("li").classList.remove("d-none");
      }
    });
};

const fetchAndPopulate = async (dayjs, handles) => {
  try {
    const resp = await fetch("/bot-status");
    const statuses = await resp.json();

    populate(dayjs, statuses);

    const hasAll = [...handles].every((handle) => statuses[handle]);
    if (!hasAll) {
      setTimeout(() => fetchAndPopulate(dayjs, handles), 2000);
    }
  } catch (err) {
    console.error("showBotStatus error:", err);
    setTimeout(() => fetchAndPopulate(dayjs, handles), 2000);
  }
};

export default (dayjs) => {
  const handles = new Set(
    [
      ...document.querySelectorAll("time[data-handle][data-run-type='next']"),
    ].map((el) => el.dataset.handle),
  );

  if (handles.size > 0) {
    fetchAndPopulate(dayjs, handles);
  }
};
