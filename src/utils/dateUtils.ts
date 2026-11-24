import { Task } from '../types/task';

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toLocalTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function addDays(base: Date, days: number): Date {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Parses a task's dueDate (YYYY-MM-DD) and optional dueTime (HH:mm) into a local Date.
 * If dueTime is omitted, defaults to 23:59:59 of that day for deadline comparison.
 */
export function getTaskDueTimestamp(task: Pick<Task, 'dueDate' | 'dueTime'>): Date | null {
  if (!task.dueDate) return null;
  const [year, month, day] = task.dueDate.split('-').map(Number);
  if (!year || !month || !day) return null;

  if (task.dueTime) {
    const [hours, minutes] = task.dueTime.split(':').map(Number);
    return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
  }

  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function isTaskOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.completed || !task.dueDate) return false;
  const due = getTaskDueTimestamp(task);
  if (!due) return false;
  return due.getTime() < now.getTime();
}

export function isTaskDueToday(task: Task, now: Date = new Date()): boolean {
  if (!task.dueDate) return false;
  return task.dueDate === toLocalDateString(now);
}

export function isTaskDueSoon(task: Task, now: Date = new Date()): boolean {
  if (task.completed || !task.dueDate) return false;
  const due = getTaskDueTimestamp(task);
  if (!due) return false;
  const diff = due.getTime() - now.getTime();
  return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
}

export function formatDisplayDate(dateStr: string, now: Date = new Date()): string {
  if (!dateStr) return 'No due date';
  const todayStr = toLocalDateString(now);
  const tomorrowStr = toLocalDateString(addDays(now, 1));
  const yesterdayStr = toLocalDateString(addDays(now, -1));

  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';
  if (dateStr === yesterdayStr) return 'Yesterday';

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: year !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatDisplayTime(timeStr: string): string {
  if (!timeStr) return '';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeStr;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatLongDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
