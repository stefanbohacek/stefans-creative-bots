import rainGenerator from "./../../modules/generators/rain.js";
import gtsClient from "./../../modules/GoToSocial/client.js";
import randomFromArray from "./../../modules/random-from-array.js";

console.log(process.env.GTS_RAIN_BOT_TOKEN,  process.env.GTS_API_URL)

const botScript = async () => {
  const gotosocial = new gtsClient({
    access_token: process.env.GTS_RAIN_BOT_TOKEN,
    api_url: process.env.GTS_API_URL,
  });

  const status = randomFromArray([
      "🌧️ #rain #weather #gif",
      "🌧️🌧️ #rain #weather #gif",
      "🌧️🌧️🌧️ #rain #weather #gif",
    ]),
    options = {
      width: 640,
      height: 480,
    };
  

  // rainGenerator(options, (err, image) => {
  //   mastodon.postImage({
  //     status,
  //     image,
  //     alt_text: "Animated GIF of rain.",
  //   });
  // });
  
  let postOptions = {
    status,
    visibility: "public"
    // poll: {
    //   options: options,
    //   expires_in: 86400,
    // },
  };

  const post = await gotosocial.post(postOptions);
  console.log("posted", post);
};

export default botScript;
