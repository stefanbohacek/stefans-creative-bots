import dayjs from "dayjs";

const getCreationDateRelative = (created) => {
  const today = dayjs();
  if (created.isSame(today, "day")) {
    return "today";
  }
  if (created.isSame(today.subtract(1, "day"), "day")) {
    return "yesterday";
  }
  return created.fromNow();
};

const showCreationDate = (el, created, fullDate) => {
  const botName = el.dataset.botName;
  const prefix = botName.toLowerCase().startsWith("the ") ? "" : "The ";
  const suffix = botName.toLowerCase().endsWith("bot") ? "" : " bot";
  alert(
    `${prefix}${botName}${suffix} was created ${getCreationDateRelative(created)}, on ${fullDate}.`,
  );
};

export default () => {
  document.querySelectorAll(".badge-year[data-date-created]").forEach((el) => {
    const created = dayjs(el.dataset.dateCreated);
    const fullDate = created.format("MMMM D, YYYY");
    el.title = fullDate;
    el.addEventListener("click", () => {
      showCreationDate(el, created, fullDate);
    });
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showCreationDate(el, created, fullDate);
      }
    });
  });
};
