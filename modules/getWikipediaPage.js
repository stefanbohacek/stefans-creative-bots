export default async (title) => {
    try {
      const encodedTitle = encodeURIComponent(title);
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodedTitle}&format=json&formatversion=2`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.query.pages[0].missing !== true) {
        const pageTitle = data.query.pages[0].title;
        const encodedPageTitle = encodeURIComponent(pageTitle.replace(/ /g, '_'));
        return `https://en.wikipedia.org/wiki/${encodedPageTitle}`;
      }
      return null;
    } catch (error) {
      return null;
    }
}