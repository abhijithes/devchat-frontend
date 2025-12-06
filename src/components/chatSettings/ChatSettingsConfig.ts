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
    
  },
  {
    key: "comments",
    label: "Comments",
    default: false,
  }
];
