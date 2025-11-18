export interface Message {
  _id?: string;
  roomId: string; // Chat ID
  senderId: string; // User ID
  text?: string;
  file?: {
    fileName?: string;
    originalName?: string;
    fileUrl?: string;
  };
  status: "sent" | "delivered" | "seen";
  createdAt?: Date;
  updatedAt?: Date;
}
