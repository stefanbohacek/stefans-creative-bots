import fetch from "node-fetch";

const getChannelId = async (handle) => {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${handle}&key=${process.env.YOUTUBE_API_KEY}`;
  const resp = await fetch(url);
  const json = await resp.json();
  return json?.items?.[0]?.id || null;
};

export const getLiveStreams = async (handle) => {
  if (!handle) return [];

  const channelId = await getChannelId(handle);
  if (!channelId) {
    console.log(`No channel found for handle: ${handle}`);
    return [];
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${process.env.YOUTUBE_API_KEY}`;
  const resp = await fetch(url);
  const respJSON = await resp.json();
  // console.log(url, respJSON);

  return respJSON?.items || [];
};
