export default () => {
  const backToTopBtn = document.getElementById("back-to-top");
  const handleBackToTopBtn = () => {
    backToTopBtn.classList.toggle("visible", window.scrollY > 200);
  };
  handleBackToTopBtn();
  window.addEventListener("scroll", handleBackToTopBtn, { passive: true });
};
