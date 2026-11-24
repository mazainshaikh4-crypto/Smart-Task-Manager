import { AppSettings, Task } from '../types/task';
import { addDays, toLocalDateString } from './dateUtils';

const TASKS_STORAGE_KEY = 'cadence_tasks_v1';
const SETTINGS_STORAGE_KEY = 'cadence_settings_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Alex',
  theme: 'light',
  remindersEnabled: true,
  browserNotifications: false,
};

export function createStarterTasks(now: Date = new Date()): Task[] {
  const today = toLocalDateString(now);
  const yesterday = toLocalDateString(addDays(now, -1));
  const tomorrow = toLocalDateString(addDays(now, 1));
  const inThreeDays = toLocalDateString(addDays(now, 3));
  const created = now.toISOString();

  return [
    {
      id: 'starter-1',
      title: 'Finalize Q4 product roadmap presentation',
      description: 'Review slide deck metrics and align milestone dates with engineering leads before 3:00 PM sync.',
      category: 'Work',
      priority: 'High',
      dueDate: today,
      dueTime: '15:00',
      completed: false,
      completedAt: null,
      createdAt: created,
    },
    {
      id: 'starter-2',
      title: 'Submit distributed systems lab report',
      description: 'Upload final PDF and benchmark latency plots to the course portal.',
      category: 'Education',
      priority: 'High',
      dueDate: yesterday,
      dueTime: '18:00',
      completed: false,
      completedAt: null,
      createdAt: created,
    },
    {
      id: 'starter-3',
      title: '30-minute strength & mobility workout',
      description: 'Upper body circuit and stretching routine after evening study block.',
      category: 'Health',
      priority: 'Medium',
      dueDate: today,
      dueTime: '19:30',
      completed: false,
      completedAt: null,
      createdAt: created,
    },
    {
      id: 'starter-4',
      title: 'Pick up weekly groceries and coffee beans',
      description: 'Oat milk, spinach, avocados, sourdough bread, and espresso roast.',
      category: 'Shopping',
      priority: 'Low',
      dueDate: tomorrow,
      dueTime: '17:30',
      completed: false,
      completedAt: null,
      createdAt: created,
    },
    {
      id: 'starter-5',
      title: 'Schedule annual dental checkup',
      description: 'Call clinic front desk to confirm morning slot next week.',
      category: 'Personal',
      priority: 'Low',
      dueDate: inThreeDays,
      dueTime: '10:00',
      completed: false,
      completedAt: null,
      createdAt: created,
    },
    {
      id: 'starter-6',
      title: 'Review lecture notes on database indexing',
      description: 'Summarize B+ tree trade-offs and practice query plan problems.',
      category: 'Education',
      priority: 'Medium',
      dueDate: today,
      dueTime: '11:00',
      completed: true,
      completedAt: created,
      createdAt: created,
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw === null) {
      const starter = createStarterTasks();
      saveTasksToStorage(starter);
      return starter;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadSettingsFromStorage(): AppSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial: AppSettings = {
        ...DEFAULT_SETTINGS,
        theme: prefersDark ? 'dark' : 'light',
      };
      saveSettingsToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: AppSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors gracefully
  }
}
