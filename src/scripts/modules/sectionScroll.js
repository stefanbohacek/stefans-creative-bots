export default () => {
  document
    .querySelectorAll(".section-heading-row h2 a[href^='#']")
    .forEach((link) => {
      link.addEventListener("click", (ev) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          return;
        }
        ev.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
};
