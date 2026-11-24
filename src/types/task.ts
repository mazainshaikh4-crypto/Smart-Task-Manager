export type TaskCategory =
  | 'Personal'
  | 'Education'
  | 'Work'
  | 'Shopping'
  | 'Health'
  | 'Other';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export type SidebarView =
  | 'dashboard'
  | 'my-tasks'
  | 'today'
  | 'upcoming'
  | 'completed'
  | 'categories'
  | 'settings';

export type StatusFilter = 'all' | 'pending' | 'completed';

export type SortOption =
  | 'due-asc'
  | 'due-desc'
  | 'priority-desc'
  | 'priority-asc'
  | 'created-desc';

export type ThemeMode = 'light' | 'dark';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD or ''
  dueTime: string; // HH:mm or ''
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  dueTime: string;
}

export interface AppSettings {
  userName: string;
  theme: ThemeMode;
  remindersEnabled: boolean;
  browserNotifications: boolean;
}

export const CATEGORIES: TaskCategory[] = [
  'Personal',
  'Education',
  'Work',
  'Shopping',
  'Health',
  'Other',
];

export const PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];

export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};
