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
  file?: {
    fileName?: string;
    originalName?: string;
    fileUrl?: string;
  };
  status: "sent" | "delivered" | "seen";
  isEdited?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
