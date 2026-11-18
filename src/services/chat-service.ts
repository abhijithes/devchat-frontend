import axios from "axios";
import { endpoints } from "../constant/constant";
import { getUserPublicInfo } from "../utils/token";
import { generalHeader } from "../components/TaskTable/services/task-detail-service";
import type { CallRecord } from "../constant/messages";

// Api endpoints
const getUserslist = async (searchTerm: string) => {
    const ownerId = getUserPublicInfo()?.id || "";

    const response = await axios.get(
        `${endpoints.searchUser}/${ownerId}?search=${encodeURIComponent(searchTerm)}`,
        generalHeader
    );
    return response;
};

const openChats = async (recieverIds: string[], groupName?: string | null) => {
    const response = await axios.post(
        endpoints.createChat,
        {
            recieverIds,
            name: groupName,
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
    console.log("mutation function called");

    const response = await axios.post(endpoints.sendMessage, messageData, generalHeader);
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

const getChats = async (roomId: string, cursor: string) => {
    const response = await axios.get(endpoints.getChats(roomId, cursor), generalHeader);
    return response;
};

const createCallLog = async (payload: {
    roomId: string;
    callId: string;
    kind: "audio" | "video";
    callerId: string;
    peerId: string;
    direction: "outgoing" | "incoming";
    status: CallRecord["status"];
    durationSec?: number;
    startedAt: string | Date;
    endedAt: string | Date;
    endedBy?: "self" | "peer" | "timeout" | "system";
}) => {
    const response = await axios.post(endpoints.createCallLog, payload, generalHeader);
    return response;
};

const getCallLogsByRoom = async (roomId: string, cursor?: string) => {
    const response = await axios.get(endpoints.getCallLogsByRoom(roomId, cursor), generalHeader);
    return response;
};

export { getUserslist, openChats, getChatsList, sendMessage, getChats, UpdateMessage, createCallLog, getCallLogsByRoom };
