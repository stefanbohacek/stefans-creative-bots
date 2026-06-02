import mastodonClient from "./../../modules/mastodon/index.js";
import getBotInfo from "./../../modules/getBotInfo.js";
import stitchImages from "./../../modules/stitchImages.js";

const { botID } = getBotInfo(import.meta.url);

const botScript = async () => {
  try {
    await (async () => {
      const forecastImageURLs = [
        "https://services.swpc.noaa.gov/images/animations/ovation/north/latest.jpg",
        "https://services.swpc.noaa.gov/images/animations/ovation/south/latest.jpg",
      ];

      const forecastURL =
        "https://www.swpc.noaa.gov/communities/aurora-dashboard-experimental";

      const stitchedImage = await stitchImages(forecastImageURLs);

      const mastodon = new mastodonClient({
        // access_token: process.env.MASTODON_TEST_TOKEN,
        access_token: process.env.AURORAFORECAST_BOT_MASTODON_ACCESS_TOKEN,
        api_url: process.env.MASTODON_API_URL,
      });

      const status = `Aurora forecast for the next 30-90 minutes.\n\nFull forecast data: ${forecastURL}\n\n#Aurora #AuroraBorealis #AuroraAustralis #NorthernLights #SouthernLights #forecast`;

      await mastodon.postImage({
        status,
        image: stitchedImage,
        alt_text:
          "Aurora forecast maps showing predicted aurora intensity over the North and South poles in the next 30-90 minutes",
      });

      return true;
    })();
  } catch (err) {
    console.log(`@${botID} error:`, err);
  }
};

export default botScript;
