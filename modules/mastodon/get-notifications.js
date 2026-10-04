import { apiRequest } from "./request.js";

const getNotifications = async (client) => {
  console.log("retrieving notifications...");
  return await apiRequest(client, "notifications");
};

export default getNotifications;
