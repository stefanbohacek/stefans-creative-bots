import fetch from "node-fetch";

export const getLiveStreams = async (channelId) => {
  let videos = [];
  if (!channelId) return videos;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${process.env.YOUTUBE_API_KEY}`;
  const resp = await fetch(url);
  const respJSON = await resp.json();

  if (respJSON?.items) {
    videos = respJSON.items.filter((item) =>
      item?.snippet?.title.includes("from the International Space Station")
    );
  }

  return videos;
};
