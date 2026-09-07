import cheerio from "cheerio";
import mastodonClient from "./../../modules/mastodon/index.js";
import { json as fetchJSON } from "./../../modules/fetch.js";
import db from "./../../modules/db.js";
import getBotInfo from "./../../modules/getBotInfo.js";

const { botID } = getBotInfo(import.meta.url);

const wikipediaPageTitle = "List of potentially habitable exoplanets";
const wikipediaPageURL =
  "https://en.wikipedia.org/wiki/List_of_potentially_habitable_exoplanets";
const referencePlanets = ["Earth", "Venus", "Mars"];

const getMainListPlanets = async () => {
  const params = new URLSearchParams({
    action: "parse",
    page: wikipediaPageTitle,
    prop: "text",
    redirects: "1",
    format: "json",
  });

  const data = await fetchJSON(`https://en.wikipedia.org/w/api.php?${params}`);

  if (!data.parse) {
    throw new Error(
      `${botID}: Wikipedia API returned no content for "${wikipediaPageTitle}": ${
        data.error?.info || "unknown error"
      }`,
    );
  }

  const $ = cheerio.load(data.parse.text["*"]);
  const planets = [];

  $(".wikitable")
    .first()
    .find("tr")
    .each(function () {
      const link = $(this).find("td").first().find("a").first();
      const planetName = link.text().trim();
      const href = link.attr("href");

      if (
        planetName &&
        !referencePlanets.includes(planetName) &&
        !planets.some((planet) => planet.name === planetName)
      ) {
        planets.push({
          name: planetName,
          url:
            href && href.startsWith("/wiki/")
              ? `https://en.wikipedia.org${href}`
              : null,
        });
      }
    });

  return planets;
};

const botScript = async () => {
  const mastodon = new mastodonClient({
    // access_token: process.env.MASTODON_TEST_TOKEN,
    access_token: process.env.EXOPLANETS2_BOT_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  console.log(
    `${botID}: checking the list of potentially habitable exoplanets...`,
  );

  const listedPlanets = await getMainListPlanets();

  if (!listedPlanets.length) {
    throw new Error(
      `${botID}: no planets found on ${wikipediaPageURL}, check page format`,
    );
  } else {
    const [savedRows] = await db.execute(
      /* sql */ `SELECT planets FROM potentially_habitable_planets WHERE id = 1`,
    );

    const savedNames = savedRows.length
      ? savedRows[0].planets.split(",").filter((planetName) => planetName)
      : [];

    const added = listedPlanets.filter(
      (planet) => !savedNames.includes(planet.name),
    );

    console.log(
      `${botID}: found ${added.length} new planet(s) out of ${listedPlanets.length} listed`,
      added.map((planet) => planet.name),
    );

    if (!added.length) {
      await db.execute(
        /* sql */ `UPDATE potentially_habitable_planets SET checked = NOW() WHERE id = 1`,
      );
    } else {
      const status = `New potentially habitable exoplanet${
        added.length > 1 ? "s" : ""
      }:\n\n${added
        .map((planet) =>
          planet.url ? `- ${planet.name}: ${planet.url}` : `- ${planet.name}`,
        )
        .join(
          "\n",
        )}\n\n${wikipediaPageURL}\n\n#space #exoplanets #astronomy #ExtraterrestrialLife`;

      // console.log(status);
      await mastodon.post({ status });

      const updatedNames = [
        ...savedNames,
        ...added.map((planet) => planet.name),
      ];

      await db.execute(
        /* sql */ `INSERT INTO potentially_habitable_planets (id, planets, checked, updated) VALUES (1, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE planets = VALUES(planets), checked = VALUES(checked), updated = VALUES(updated)`,
        [updatedNames.join(",")],
      );
    }
  }
};

export default botScript;
