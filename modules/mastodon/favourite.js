import { apiRequest } from "./request.js";

export default async (client, statusId) => {
  console.log(`favouriting status ${statusId}...`);
  return await apiRequest(client, `statuses/${statusId}/favourite`, {
    method: "POST",
  });
};
