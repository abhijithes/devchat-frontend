// src/chat/components/ChatSettings.tsx

import { useEffect, useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import { chatSettingsConfig } from "./ChatSettingsConfig";

const ChatSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("chatSettings");
    if (saved) return JSON.parse(saved);

    return chatSettingsConfig.reduce((acc, item) => {
      acc[item.key] = item.default;
      return acc;
    }, {} as any);
  });

  // console.log(settings);
  

  

  const updateSetting = (key: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  

  useEffect(() => {
    localStorage.setItem("chatSettings", JSON.stringify(settings));
    window.dispatchEvent(new Event("chatSettingsUpdated"));
  }, [settings]);


  return (
    <div className="px-40 py-10   w-full pl-0">
      <h1 className="text-3xl font-bold mb-10 ">Chat</h1>

      {chatSettingsConfig.map((item) => (
        <div key={item.key} className="flex items-center gap-5 mb-6  ">
          <ToggleSwitch
            checked={settings[item.key]}
            onChange={() => updateSetting(item.key)}
            activeColor={item.activeColor}
          />
          <span>{item.label}</span>

        
        </div>
      ))}
    </div>
  );
};

export default ChatSettings;
