export type Message = {
  _id: string;
  senderId: string; // corresponds to a UserIcon _id
  content: string;
  createdAt: string; // ISO timestamp
  isRead: boolean;
};

export const messages: Message[] = [
  {
    _id: 'msg-1',
    senderId: 'user-1',
    content: 'Hey team, the deployment is scheduled for 3pm today. Please finish any pending reviews.',
    createdAt: '2025-11-11T08:10:00.000Z',
    isRead: true,
  },
  {
    _id: 'msg-2',
    senderId: 'user-2',
    content: "I reviewed the changes for the task table — looks good. Left a small comment on styling.",
    createdAt: '2025-11-11T08:12:30.000Z',
    isRead: true,
  },
  {
    _id: 'msg-3',
    senderId: 'user-3',
    content: "Can someone assign me the follow-up ticket for the auth fix?",
    createdAt: '2025-11-11T08:15:00.000Z',
    isRead: true,
  },
  {
    _id: 'msg-4',
    senderId: 'user-4',
    content: 'On it — I will assign it to you now.',
    createdAt: '2025-11-11T08:16:10.000Z',
    isRead: true,
  },
  {
    _id: 'msg-5',
    senderId: 'user-5',
    content: "Reminder: stand-up in 15 minutes.",
    createdAt: '2025-11-11T08:20:00.000Z',
    isRead: false,
  },
  {
    _id: 'msg-6',
    senderId: 'user-6',
    content: 'I pushed a hotfix for the date parsing issue. Please pull latest and test locally.',
    createdAt: '2025-11-11T08:25:45.000Z',
    isRead: false,
  },
  {
    _id: 'msg-7',
    senderId: 'user-7',
    content: 'Thanks — testing now.',
    createdAt: '2025-11-11T08:26:10.000Z',
    isRead: false,
  },
  {
    _id: 'msg-8',
    senderId: 'user-8',
    content: 'FYI: I updated the README with setup steps for the new service.',
    createdAt: '2025-11-11T08:30:00.000Z',
    isRead: false,
  },
  {
    _id: 'msg-9',
    senderId: 'user-9',
    content: 'Great — that will help onboard the new team members.',
    createdAt: '2025-11-11T08:31:00.000Z',
    isRead: false,
  },
  {
    _id: 'msg-10',
    senderId: 'user-10',
    content: "I'll join the stand-up remotely — in a different timezone today.",
    createdAt: '2025-11-11T08:32:00.000Z',
    isRead: false,
  },
  {
    _id: 'msg-10',
    senderId: 'user-10',
    content: "I'll join the stand-up remotely — in a different timezone today.",
    createdAt: '2025-11-11T08:32:00.000Z',
    isRead: false,
  },
  {
    _id: 'msg-10',
    senderId: 'user-10',
    content: "I'll join the stand-up remotely — in a different timezone today.",
    createdAt: '2025-11-11T08:32:00.000Z',
    isRead: false,
  },
];

export default messages;
