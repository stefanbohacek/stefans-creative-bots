import { apiRequest } from "./request.js";

const dismissNotification = async (client, notification) => {
  console.log("clearing notifications...");
  return await apiRequest(client, "notifications/dismiss", {
    method: "POST",
    json: { id: notification.id },
  });
};

export default dismissNotification;
