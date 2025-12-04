// src/chat/config/chatSettingsConfig.ts

import type {ChatSettingItem} from "./ChatSettingsTypes";

export const chatSettingsConfig: ChatSettingItem[] = [
  {
    key: "control",
    label: "Control",
    default: false,
  },
  {
    key: "write",
    label: "Write",
    default: false,
  },
  {
    key: "ai",
    label: "AI",
    default: true,
    activeColor: "bg-green-300",
  },
  {
    key: "comments",
    label: "Comments",
    default: false,
  },
  // {
  //   key: "timer",
  //   label: "Timer",
  //   default: false,
  //   isTimer: true, // special setting for timer UI
  // },
];
