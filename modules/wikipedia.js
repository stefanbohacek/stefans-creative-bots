import fetch from "node-fetch";
import wtf from "wtf_wikipedia";
import { parse } from "node-html-parser";
import he from "he";
import randomFromArray from "./random-from-array.js";
import sleep from "./sleep.js";

const WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";

export const getPageSummary = async (wikipediaUrl) => {
  const pageTitle = wikipediaUrl.split("/wiki/")[1];
  try {
    const resp = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`,
    );
    if (
      !resp.ok ||
      !resp.headers.get("content-type")?.includes("application/json")
    ) {
      return {};
    }
    const { title, extract } = await resp.json();
    return { title, description: extract };
  } catch (error) {
    console.log("wikipedia:getPageSummary:error", error);
    return {};
  }
};

export const getWikipediaPage = async (title) => {
  try {
    const encodedTitle = encodeURIComponent(title);
    const url = `${WIKIPEDIA_API_URL}?action=query&titles=${encodedTitle}&format=json&formatversion=2`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.query.pages[0].missing !== true) {
      const pageTitle = data.query.pages[0].title;
      const encodedPageTitle = encodeURIComponent(pageTitle.replace(/ /g, "_"));
      return `https://en.wikipedia.org/wiki/${encodedPageTitle}`;
    }
    return null;
  } catch (error) {
    console.log("wikipedia:getWikipediaPage:error", error);
    return null;
  }
};

const getUserboxGalleries = async () => {
  const results = [];
  let cmcontinue = undefined;

  do {
    const params = {
      action: "query",
      list: "categorymembers",
      cmtitle: "Category:Userbox galleries",
      cmlimit: "500",
      cmtype: "page",
      format: "json",
    };
    if (cmcontinue) {
      params.cmcontinue = cmcontinue;
    }

    const resp = await fetch(
      `${WIKIPEDIA_API_URL}?${new URLSearchParams(params)}`,
    );
    const { query, continue: cont } = await resp.json();

    results.push(...query.categorymembers);
    cmcontinue = cont?.cmcontinue;
    if (cmcontinue) {
      await sleep(1000);
    }
  } while (cmcontinue);

  return results.filter((g) => !g.title.includes("/Language/"));
};

const getGalleryUserboxes = async (galleryTitle) => {
  const doc = await wtf.fetch(galleryTitle);
  return doc
    .templates()
    .filter((t) => t.json().template === "yy")
    .map((t) => t.json().list[0]);
};

const renderUserbox = async (template) => {
  const resp = await fetch(WIKIPEDIA_API_URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "parse",
      prop: "text",
      text: `{{${template}}}`,
      contentmodel: "wikitext",
      format: "json",
    }),
  });
  const { parse: rendered } = await resp.json();
  const root = parse(rendered.text["*"]);
  const infoCell = root.querySelector(".userbox-info");
  infoCell?.querySelectorAll("sup").forEach((sup) => sup.remove());
  return he
    .decode(infoCell?.innerText ?? "")
    .replace(/\s+/g, " ")
    .trim();
};

export const renderUserboxHTML = async (template) => {
  const resp = await fetch(WIKIPEDIA_API_URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "parse",
      prop: "text",
      text: `{{${template}}}`,
      contentmodel: "wikitext",
      format: "json",
    }),
  });
  const { parse: rendered } = await resp.json();
  return rendered.text["*"]
    .replace(/src="\/\//g, 'src="https://')
    .replace(/src="\//g, 'src="https://en.wikipedia.org/');
};

export const getRandomUserbox = async () => {
  const galleries = await getUserboxGalleries();
  const gallery = randomFromArray(galleries);
  const templates = await getGalleryUserboxes(gallery.title);
  if (!templates.length) {
    await sleep(1000);
    return getRandomUserbox();
  }

  const template = randomFromArray(templates);
  const html = await renderUserboxHTML(template);

  const root = parse(html);
  const infoCell = root.querySelector(".userbox-info");
  infoCell?.querySelectorAll("sup").forEach((sup) => sup.remove());
  const text = he
    .decode(infoCell?.innerText ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text || text.includes("...") || text.includes("{{{")) {
    await sleep(1000);
    return getRandomUserbox();
  }

  return { text, html };
};

// export const getRandomUserbox = async () => {
//   const galleries = await getUserboxGalleries();
//   // console.log("galleries", galleries);
//   const gallery = randomFromArray(galleries);
//   const templates = await getGalleryUserboxes(gallery.title);
//   if (!templates.length) {
//     await sleep(1000);
//     return getRandomUserbox();
//   }

//   const text = await renderUserbox(randomFromArray(templates));
//   if (!text || text.includes("...") || text.includes("{{{")) {
//     await sleep(1000);
//     return getRandomUserbox();
//   }
//   return text;
// };
