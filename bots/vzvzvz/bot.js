import onomatopoeias from "./../../data/onomatopoeias.js";
import mastodonClient from "./../../modules/mastodon/index.js";
import randomFromArray from "./../../modules/random-from-array.js";

const botScript = async () => {
  const mastodon = new mastodonClient({
    access_token: process.env.VZVZVZ_BOT_MASTODON_ACCESS_TOKEN,
    api_url: process.env.MASTODON_API_URL,
  });

  const category = randomFromArray(onomatopoeias);
  const item = randomFromArray(
    category.data.filter((d) => !d.language.includes("Russian"))
  );

  let language,
    sounds = [];

  for (let key in item) {
    if (key === "language") {
      language = item[key][0];
    } else {
      let sound = {};
      sound[key] = item[key][0];
      sounds.push(sound);
    }
  }

  const randomSound = randomFromArray(sounds);
  const action = Object.keys(randomSound)[0];
  const emoji = category.emoji?.[action] ?? "❓";

  const status = `${emoji} The sound of "${action}" in ${language}: ${randomSound[action]}\n#language #linguistics #onomatopoeia`;

  mastodon.post({ status });
};

export default botScript;