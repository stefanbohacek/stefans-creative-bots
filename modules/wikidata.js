import getUserAgent from "./getSCBUserAgent.js";
import db from "./db.js";

const TTL_48H = 48 * 60 * 60 * 1000;

export const getWikidataLabel = async (item) => {
  const response = await fetch(
    `https://www.wikidata.org/entity/${item.wikidataId}.json`,
    {
      headers: {
        "User-Agent": getUserAgent(),
      },
    },
  );

  if (!response.ok) {
    console.log(
      `getWikidataLabel error: ${response.status} ${response.statusText}`,
    );
    return "";
  }

  const data = await response.json();
  const entity = data.entities[item.wikidataId];
  return entity?.labels?.en?.value || entity?.labels?.mul?.value || "";
};

export const getWikidataCache = async (botId, ttl = TTL_48H) => {
  const [rows] = await db.execute(
    /* sql */ `SELECT data, updated_at FROM wikidata_cache WHERE bot_id = ?`,
    [botId],
  );

  if (!rows.length) {
    return null;
  }

  const isStale = Date.now() - new Date(rows[0].updated_at).getTime() > ttl;

  return { data: JSON.parse(rows[0].data), isStale };
};

export const saveWikidataCache = async (botId, items) => {
  await db.execute(
    /* sql */ `INSERT INTO wikidata_cache (bot_id, data) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = NOW()`,
    [botId, JSON.stringify(items)],
  );
};

export const queryWikidata = async (query, filterImage) => {
  const apiUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
    query,
  )}&format=json`;
  const resp = await fetch(apiUrl, {
    headers: {
      "User-Agent": getUserAgent(),
    },
  });

  if (!resp.ok) {
    console.log(`queryWikidata error: ${resp.status} ${resp.statusText}`);
    return [];
  }

  const respText = await resp.text();
  let respJSON;
  try {
    respJSON = JSON.parse(respText);
  } catch (err) {
    console.log(`queryWikidata JSON parse error:`, err.message);
    console.log(
      `queryWikidata response (first 500 chars):`,
      respText.substring(0, 500),
    );
    return [];
  }

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
        wikidataId: wikidataId,
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
