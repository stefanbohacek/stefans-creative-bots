export default () => {
  const toggle = document.getElementById("menu-toggle");
  if (toggle) {
    document.querySelectorAll("#category-nav .nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.checked = false;
      });
    });
  }
};
