export const browserFetch = (page, url) =>
  page.evaluate(async (targetUrl) => {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return { error: `fetch failed: ${response.status}` };
    } else {
      return { text: await response.text() };
    }
  }, url);

export const browserFetchBinary = (page, url) =>
  page.evaluate(async (targetUrl) => {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return { error: `fetch failed: ${response.status}` };
    } else {
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = "";
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      return { data: btoa(binary) };
    }
  }, url);
