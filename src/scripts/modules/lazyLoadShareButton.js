export default () => {
  const target = document.querySelector(".fsb-prompt");

  if (target) {
    let loaded = false;

    const loadStyles = () => {
      if (!loaded) {
        loaded = true;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://fediverse-share-button.stefanbohacek.com/fediverse-share-button/styles.min.css";
        document.head.appendChild(link);
        window.removeEventListener("scroll", handleScroll);
        observer.disconnect();
      }
    };

    const handleScroll = () => {
      const pageScrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY / pageScrollHeight >= 0.5) {
        loadStyles();
      }
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadStyles();
      }
    });

    observer.observe(target);
    window.addEventListener("scroll", handleScroll, { passive: true });
  }
};
