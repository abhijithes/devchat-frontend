import axios from "axios";
import { endpoints } from "../../constant/constant";
import { getToken } from "../../utils/token";

export const deleteBulkNotifications = async (notificationIds: string[]) => {
  const token = getToken();
  try {
    const res = await axios.delete(endpoints.deleteNotificationBulk, {
      data: { notificationIds },
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    return res;
  } catch (error: any) {
    console.error(
      "Error deleting bulk notifications:",
      error.response?.data || error.message
    );
    throw error.response?.data || { message: "Failed to delete notifications" };
  }
};
