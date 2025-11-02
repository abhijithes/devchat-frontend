import { useEffect, useState } from "react";
import { removeToken } from "../../utils/token";
import { NotificationSounds } from "../../constant/audio-files";

const themes = ["Light", "Dark", "System Default"];

const UserSettingsPage = () => {
  const [selectedTheme, setSelectedTheme] = useState("System Default");
  const [selectedSound, setSelectedSound] = useState(1001);
  const [activeStatus, setActiveStatus] = useState(true);

  const handleLogout = () => {
    removeToken();
  };

  const handleRemoveAccount = () => {
    console.log("Account removed");
  };

  // Load saved sound on mount
  useEffect(() => {
    const savedSound = localStorage.getItem("DEV_CHATS_NOTI_SOUND");
    if (savedSound) {
      setSelectedSound(Number(savedSound));
    }
  }, []);

  const hanldeChangeNotificationSound = (id) => {
    localStorage.setItem("DEV_CHATS_NOTI_SOUND", id.toString());

    setSelectedSound(Number(id));
    const selected = NotificationSounds.find(
      (s) => s.audioId === selectedSound
    );

    if (selected && selected.src) {
      const audio = new Audio(selected.src);
      audio
        .play()
        .catch(() =>
          console.warn("Autoplay blocked: user interaction required.")
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 ">
      <div className="w-full mx-auto px-5 space-y-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">User Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your preferences and account settings.
          </p>
        </header>

        {/* Theme Customization */}
        <section>
          <h2 className="text-xl font-medium mb-3">Theme Customization</h2>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-black bg-transparent"
          >
            {themes.map((theme, i) => (
              <option key={i} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </section>

        {/* Notification Sound */}
        <section>
          <h2 className="text-xl font-medium mb-3">Notification Sound</h2>
          <select
            value={selectedSound}
            onChange={(e) => hanldeChangeNotificationSound(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-black bg-transparent"
          >
            {NotificationSounds.map((sound) => (
              <option key={sound.audioId} value={sound.audioId}>
                {sound.name}
              </option>
            ))}
          </select>
        </section>

        {/* Active Status */}
        <section>
          <h2 className="text-xl font-medium mb-3">Active Status</h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={activeStatus}
              onChange={(e) => setActiveStatus(e.target.checked)}
              className="w-5 h-5 accent-black cursor-pointer"
            />
            <span className="text-gray-700">
              Show me as active to other users
            </span>
          </div>
        </section>

        {/* Logout */}
        <section>
          <button
            onClick={handleLogout}
            className="text-red-600 font-medium hover:underline transition"
          >
            Log Out
          </button>
        </section>

        {/* Remove Account */}
        <section>
          <h2 className="text-xl font-medium mb-3 text-red-600">Danger Zone</h2>
          <p className="text-gray-600 mb-3">
            Once you remove your account, all your data will be permanently
            deleted. This action cannot be undone.
          </p>
          <button
            onClick={handleRemoveAccount}
            className="text-sm font-medium text-white bg-red-600 px-5 py-2 rounded-md hover:bg-red-700 transition"
          >
            Remove Account
          </button>
        </section>
      </div>
    </div>
  );
};

export default UserSettingsPage;
