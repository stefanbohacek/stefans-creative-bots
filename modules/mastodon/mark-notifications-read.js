import { apiRequest } from "./request.js";

export default async (client, lastReadId) => {
  console.log(`marking notifications read up to ${lastReadId}...`);
  return await apiRequest(client, "markers", {
    method: "POST",
    json: { notifications: { last_read_id: lastReadId } },
  });
};
