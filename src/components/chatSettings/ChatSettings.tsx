// src/chat/components/ChatSettings.tsx

import { useState } from "react";
import ToggleSwitch from "./ToggleSwitch";
import { chatSettingsConfig } from "./ChatSettingsConfig";

const ChatSettings = () => {
  const [settings, setSettings] = useState(
    chatSettingsConfig.reduce((acc, item) => {
      acc[item.key] = item.default;
      return acc;
    }, {} as any)
  );
  console.log(settings);
  

  const [timerValue, setTimerValue] = useState("");

  const updateSetting = (key: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateTimer = () => {
    console.log("Updated Timer:", timerValue);
  };

  return (
    <div className="p-10  w-full pl-0">
      <h1 className="text-3xl font-bold mb-10 ">Chat</h1>

      {chatSettingsConfig.map((item) => (
        <div key={item.key} className="flex items-center gap-5 mb-6  ">
          <ToggleSwitch
            checked={settings[item.key]}
            onChange={() => updateSetting(item.key)}
            activeColor={item.activeColor}
          />
          <span>{item.label}</span>

          {item.isTimer && (
            <>
              <input
                type="number"
                placeholder="Minutes"
                disabled={!settings[item.key]}
                value={timerValue}
                onChange={(e) => setTimerValue(e.target.value)}
                className="border px-4 py-2 rounded w-40 disabled:bg-gray-100"
              />

              <button
                disabled={!settings[item.key]}
                onClick={updateTimer}
                className="px-4 py-2 bg-black text-white rounded disabled:bg-gray-400"
              >
                update
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatSettings;
