import { useState, useEffect, useContext } from "react";
import api from "../lib/axios";
import { AuthContext } from "../context/AuthContext";

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await api.get(`/user-settings/${user._id}`);
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = async (field, value) => {
    try {
      const updated = { ...settings, [field]: value };
      await api.put(`/user-settings/${settings._id}`, updated);
      setSettings(updated);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (!settings) return <p>Loading settings...</p>;

  return (
    <div className="max-w-xl mx-auto mt-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="flex items-center justify-between">
        <span>Dark Mode</span>
        <input
          type="checkbox"
          checked={settings.dark_mode}
          onChange={e => handleChange("dark_mode", e.target.checked)}
        />
      </div>
      <div className="flex items-center justify-between">
        <span>Notifications</span>
        <input
          type="checkbox"
          checked={settings.notifications_enabled}
          onChange={e => handleChange("notifications_enabled", e.target.checked)}
        />
      </div>
      <div className="flex items-center justify-between">
        <span>Privacy</span>
        <select
          value={settings.privacy_visibility}
          onChange={e => handleChange("privacy_visibility", e.target.value)}
        >
          <option value="public">Public</option>
          <option value="friends">Friends</option>
          <option value="private">Private</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <span>Language</span>
        <input
          type="text"
          value={settings.language}
          onChange={e => handleChange("language", e.target.value)}
          className="border p-1 rounded"
        />
      </div>
    </div>
  );
};

export default Settings;