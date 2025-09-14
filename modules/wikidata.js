import fetch from "node-fetch";

export default async (query, filterImage) => {
  const apiUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
    query
  )}&format=json`;
  const resp = await fetch(apiUrl);
  const respJSON = await resp.json();
  let items = respJSON?.results?.bindings || [];

  if (items && items.length) {
    const itemPromises = items.map(async (item) => {
      const wikidataId = item?.item?.value?.split("/entity/")[1];
      const wikipediaUrl =
        item?.article?.value || `https://www.wikidata.org/wiki/${wikidataId}`;

      let image = "";
      let imageUrl = "";
      let wikipediaDescription = "";

      if (item?.image?.value) {
        image = item.image.value.split(
          "http://commons.wikimedia.org/wiki/Special:FilePath/"
        )[1];
        imageUrl = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${image}&width=410`;
      }

      if (wikipediaUrl.includes("/wiki/")) {
        const pageTitle = wikipediaUrl.split("/wiki/")[1];

        try {
          const resp = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`
          );

          if (resp.ok) {
            const contentType = resp.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const respJSON = await resp.json();
              wikipediaDescription = respJSON.extract || "";
            }
          }
        } catch (error) {
          wikipediaDescription = "";
        }
      }

      return {
        label: item?.itemLabel?.value || "",
        description: item?.itemDescription?.value || "",
        wikipediaUrl: wikipediaUrl,
        wikipediaDescription: wikipediaDescription,
        image: imageUrl,
        audio: item?.audioFile?.value || "",
        lat: item?.lat?.value || "",
        long: item?.lon?.value || "",
      };
    });

    items = await Promise.all(itemPromises);

    if (filterImage) {
      items = items.filter((item) => item.image && (item.label || item.description));
    }
  }
  return items;
};