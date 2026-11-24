import React, { useState } from 'react';
import { Bell, Download, Moon, RotateCcw, Sun, Trash2 } from 'lucide-react';
import { AppSettings, Task, ThemeMode } from '../types/task';

interface SettingsViewProps {
  settings: AppSettings;
  tasks: Task[];
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onExportTasks: () => void;
  onRequestRestoreSamples: () => void;
  onRequestClearAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  tasks,
  onUpdateSettings,
  onExportTasks,
  onRequestRestoreSamples,
  onRequestClearAll,
}) => {
  const [nameInput, setNameInput] = useState(settings.userName);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameInput.trim() || 'Alex';
    setNameInput(cleaned);
    onUpdateSettings({ userName: cleaned });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleToggleBrowserNotifications = async () => {
    if (!settings.browserNotifications) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          onUpdateSettings({ browserNotifications: true });
        } else {
          onUpdateSettings({ browserNotifications: false });
        }
      }
    } else {
      onUpdateSettings({ browserNotifications: false });
    }
  };

  const themes: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'dark', label: 'Dark Mode', icon: Moon },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile & Greeting */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
          Workspace Profile
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Personalize the greeting shown on your daily dashboard.
        </p>

        <form onSubmit={handleSaveName} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="settings-display-name"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Display Name
            </label>
            <input
              id="settings-display-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={40}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 whitespace-nowrap shrink-0 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {savedNotice ? 'Saved' : 'Update Name'}
          </button>
        </form>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
          Appearance
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose between light and dark surface themes.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {themes.map((item) => {
            const Icon = item.icon;
            const active = settings.theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onUpdateSettings({ theme: item.id })}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  active
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Reminders */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Due Date Reminders
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Show an in-app notification banner whenever a scheduled task reaches its due time while the app is open.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.remindersEnabled}
            aria-label="Toggle in-app due reminders"
            onClick={() => onUpdateSettings({ remindersEnabled: !settings.remindersEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              settings.remindersEnabled ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                settings.remindersEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {'Notification' in window && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
              <Bell className="h-4 w-4 text-slate-400" />
              <span>Desktop browser alerts</span>
            </div>
            <button
              type="button"
              onClick={handleToggleBrowserNotifications}
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {settings.browserNotifications ? 'Disable Browser Alerts' : 'Enable Browser Alerts'}
            </button>
          </div>
        )}
      </section>

      {/* Local Data Management */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
          Local Storage & Backup
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          All <span className="tabular-nums font-medium">{tasks.length}</span> tasks are stored permanently in your browser.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onExportTasks}
            disabled={tasks.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={onRequestRestoreSamples}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Load Sample Tasks</span>
          </button>

          <button
            type="button"
            onClick={onRequestClearAll}
            disabled={tasks.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Tasks</span>
          </button>
        </div>
      </section>
    </div>
  );
};
