export default () => {
  const today = new Date();

  document.querySelectorAll(".badge-year[data-date-created]").forEach((el) => {
    const created = new Date(el.dataset.dateCreated);
    if (
      created.getUTCMonth() === today.getUTCMonth() &&
      created.getUTCDate() === today.getUTCDate()
    ) {
      el.textContent += " 🎉";
    }
  });
};
