import mastodonClient from "./../../modules/mastodon/index.js";
import overlayGenerator from "./../../modules/generators/overlay.js";

const botScript = async () => {
  const width = 940;
  const height = 794;
  const imageURL =
    "https://bots.stefanbohacek.com/images/whataweek.jpg";
  const dayOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][new Date().getDay()];

  if (["Monday", "Tuesday", "Wednesday"].includes(dayOfWeek)) {
    const mastodon = new mastodonClient({
      access_token: process.env.WHATAWEEK_BOT_ACCESS_TOKEN_SECRET,
      api_url: process.env.MASTODON_API_URL,
    });

    overlayGenerator(
      [
        {
          url: imageURL,
          x: 0,
          y: 0,
          width: width,
          height: height,
        },
        {
          text: "What a week, huh?",
          fontSize: 42,
          fontFamily: "Arial",
          style: "#333",
          x: 100,
          y: 158,
        },
        {
          text: `Captain, it's ${dayOfWeek}`,
          fontSize: 42,
          fontFamily: "Arial",
          style: "#333",
          x: 80,
          y: 300,
        },
      ],
      { width, height },
      (err, image) => {
        const status = `#WhatAWeek #WhatAWeekHuh #${dayOfWeek}`;

        mastodon.postImage({
          status,
          image,
          alt_text: `A panel from the "The Adventures of Tintin" comics featuring the titular character Tintin, a young man with blonde hair wearing a brown trench coat, and Captain Archibald Haddock, a retired merchant sailor with dark bushy hair and a full-grown beard. They are both sitting at a table having a conversation, while Tintin's dog Snowy, a white Wire Fox Terrier, looks on, startled.
  
  Captain Haddock: "What a week, huh?"
  Tintin: "Captain, it's ${dayOfWeek}"`,
        });
      }
    );
  } else {
    console.log("@whataweek: skipping...");
  }
};

export default botScript;
