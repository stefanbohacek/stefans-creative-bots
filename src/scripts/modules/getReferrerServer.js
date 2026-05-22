export default () => {
  let referrerServer = null;
  try {
    const referrer = document.referrer;

    if (referrer) {
      const url = new URL(referrer);

      if (url.hostname !== window.location.hostname) {
        referrerServer = url.hostname;
      }
    }
  } catch {
    /* noop*/
  }

  return referrerServer;
};
