import fetch from "node-fetch";

export default async (query, filterImage) => {
  const apiUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
    query,
  )}&format=json`;
  const resp = await fetch(apiUrl);
  const respJSON = await resp.json();
  let items = respJSON?.results?.bindings || [];

  // console.log("wikidata:items", items);

  if (items && items.length) {
    const itemPromises = items.map(async (item) => {
      const wikidataId = item?.item?.value?.split("/entity/")[1];
      const wikipediaUrl =
        item?.article?.value || `https://www.wikidata.org/wiki/${wikidataId}`;

      // console.log("wikidata:item", item);

      let image = item?.image?.value || "";
      let imageUrl = "";
      let itemTitle = item?.itemLabel?.value || "";
      let wikipediaDescription = "";

      if (item?.image?.value) {
        image = item.image.value.split(
          "http://commons.wikimedia.org/wiki/Special:FilePath/",
        )[1];
        imageUrl = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${image}&width=410`;
      }

      return {
        label: itemTitle,
        description: item?.itemDescription?.value || "",
        date: item?.date?.value ? new Date(item.date.value) : null,
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
      items = items.filter(
        (item) => item.image && (item.label || item.description),
      );
    }
  }
  return items;
};
