export default () => {
  document.querySelectorAll(".section-heading-row a").forEach((link) => {
    link.addEventListener("click", (ev) => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        ev.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
};
