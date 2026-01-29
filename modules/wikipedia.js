import fetch from "node-fetch";

export default async (wikipediaUrl) => {
  let title;
  let description;

  if (wikipediaUrl) {
    const pageTitle = wikipediaUrl.split("/wiki/")[1];

    try {
      const resp = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`,
      );

      if (resp.ok) {
        const contentType = resp.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const respJSON = await resp.json();
          description = respJSON.extract || "";
          console.log("respJSON", respJSON.title);
          if (respJSON.title) {
            itemTitle = respJSON.title;
          }
          console.log("itemTitle", itemTitle);
        }
      }
    } catch (error) {
      console.log("wikipedia:error", error);
    }
  }

  return {
    title,
    description,
  };
};
