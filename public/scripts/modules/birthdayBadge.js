export default () => {
  const today = new Date();

  document.querySelectorAll(".badge-year[data-date-created]").forEach((el) => {
    const created = new Date(el.dataset.dateCreated);
    if (
      created.getMonth() === today.getMonth() &&
      created.getDate() === today.getDate()
    ) {
      el.textContent += " 🎉";
    }
  });
};
