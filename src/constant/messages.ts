export interface Message {
    _id?: string;
    roomId: string; // Chat ID
    senderId: {
        firstName: string;
        lastName?: string;
        email: string;
        _id: string;
        profilePicture?: string;
    };
    text?: string;
    files?: {
        public_id?: string;
        originalName?: string;
        url?: string;
        type?: "image" | "document" | "audio";
        duration?: number;
        waveform?: number[];
    }[];
    status: "sent" | "delivered" | "seen";
    readby: string[];
    isEdited?: boolean;
    messageType: "text" | "code" | "voice" | "call";
    createdAt?: Date;
    updatedAt?: Date;
}

export type CallLogStatus =
    | "connected"
    | "missed"
    | "declined"
    | "cancelled"
    | "ended-while-connecting"
    | "error";

export type CallLogDirection = "outgoing" | "incoming";

export interface CallRecord {
    _id?: string;
    roomId: string;
    callId: string;
    kind: "audio" | "video";
    callerId: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        profilePicture?: string;
    };
    peerId: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        profilePicture?: string;
    };
    direction: CallLogDirection;
    status: CallLogStatus;
    durationSec?: number;
    startedAt: string | Date;
    endedAt: string | Date;
    endedBy: "self" | "peer" | "timeout" | "system";
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

// Reuse Message as the list envelope used by the chat window's message
// query. Call logs are stored separately, but we surface them through the
// same message list by tagging them with messageType: "call".
export interface ChatItem {
    _id?: string;
    roomId: string;
    messageType: Message["messageType"];
    createdAt?: Date;
    senderId?: Message["senderId"];
    text?: string;
    files?: Message["files"];
    // call log specific
    callLog?: CallRecord;
    status?: Message["status"];
    readby?: string[];
    isEdited?: boolean;
}
