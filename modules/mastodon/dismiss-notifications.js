import { apiRequest } from "./request.js";

export default async (client, notification) => {
  console.log(`clearing notification ${notification.id}...`);
  return await apiRequest(client, `notifications/${notification.id}/dismiss`, {
    method: "POST",
  });
};
