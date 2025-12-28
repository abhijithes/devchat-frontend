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
    }[];
    status: "sent" | "delivered" | "seen";
    readby: string[];
    isEdited?: boolean;
    messageType: "text" | "code";
    createdAt?: Date;
    updatedAt?: Date;
}
