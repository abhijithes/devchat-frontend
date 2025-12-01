import axios from "axios";
import { endpoints } from "../../../constant/constant";
import { generalHeader } from "../../TaskTable/services/task-detail-service";

export const markAsRead = async (roomId: string) => {
  const response = await axios.patch(
    endpoints.markAsRead,
    {
      roomId,
    },
    generalHeader
  );

  return response;
};
