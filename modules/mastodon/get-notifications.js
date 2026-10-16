import { apiRequest } from "./request.js";

export default async (client, params = {}) => {
  console.log("retrieving notifications...");
  const query = new URLSearchParams(params).toString();
  return await apiRequest(
    client,
    query ? `notifications?${query}` : "notifications",
  );
};
