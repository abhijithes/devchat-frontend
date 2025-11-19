import axios from "axios";
import { endpoints } from "../constant/constant";
import { getUserPublicInfo } from "../utils/token";
import { generalHeader } from "../components/TaskTable/services/task-detail-service";

// Api endpoints
const getUserslist = async (searchTerm: string) => {
  const ownerId = getUserPublicInfo()?.id || "";

  const response = await axios.get(
    `${endpoints.searchUser}/${ownerId}?search=${encodeURIComponent(
      searchTerm
    )}`,
    generalHeader
  );
  return response;
};

const openChats = async (recieverIds: string[]) => {
  const response = await axios.post(
    endpoints.createChat,
    {
      recieverIds,
    },
    generalHeader
  );
  return response;
};

const getChatsList = async () => {
  const response = await axios.get(endpoints.getChatsList, generalHeader);
  return response;
};

const sendMessage = async (messageData: any) => {
  const response = await axios.post(
    endpoints.sendMessage,
    messageData,
    generalHeader
  );
  return response;
};

const UpdateMessage = async (messageData: any) => {
  console.log("up");

  const response = await axios.patch(
    endpoints.updateMessage(messageData.id),
    { text: messageData.text },
    generalHeader
  );
  return response;
};

const getChats = async (roomId: string) => {
  const response = await axios.get(endpoints.getChats(roomId), generalHeader);
  return response;
};

export { getUserslist, openChats, getChatsList, sendMessage, getChats, UpdateMessage };
