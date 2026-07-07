import dayjs from "dayjs";

const showCreationDate = (el, fullDate) => {
  const botName = el.dataset.botName;
  const prefix = botName.toLowerCase().startsWith("the ") ? "" : "The ";
  const suffix = botName.toLowerCase().endsWith("bot") ? "" : " bot";
  alert(`${prefix}${botName}${suffix} was created on ${fullDate}.`);
};

export default () => {
  document.querySelectorAll(".badge-year[data-date-created]").forEach((el) => {
    const fullDate = dayjs(el.dataset.dateCreated).format("MMMM D, YYYY");
    el.title = fullDate;
    el.addEventListener("click", () => {
      showCreationDate(el, fullDate);
    });
    el.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showCreationDate(el, fullDate);
      }
    });
  });
};
