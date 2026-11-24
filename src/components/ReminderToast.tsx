import React from 'react';
import { BellRing, Check, Clock, X } from 'lucide-react';
import { Task } from '../types/task';
import { formatDisplayDate, formatDisplayTime } from '../utils/dateUtils';

interface ReminderToastProps {
  reminders: Task[];
  onCompleteTask: (id: string) => void;
  onSnoozeTask: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const ReminderToast: React.FC<ReminderToastProps> = ({
  reminders,
  onCompleteTask,
  onSnoozeTask,
  onDismiss,
}) => {
  if (reminders.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Task reminders"
      className="fixed bottom-4 right-4 z-40 flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0"
    >
      {reminders.slice(0, 3).map((task) => (
        <div
          key={task.id}
          role="status"
          className="rounded-xl border border-amber-200 bg-white p-4 shadow-lg dark:border-amber-900/60 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <BellRing className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Task Reminder Due
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {task.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>{task.category}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="font-mono-tabular">
                    {formatDisplayDate(task.dueDate)}
                    {task.dueTime ? ` at ${formatDisplayTime(task.dueTime)}` : ''}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(task.id)}
              aria-label="Dismiss reminder"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onSnoozeTask(task.id)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Snooze 15m</span>
            </button>
            <button
              type="button"
              onClick={() => onCompleteTask(task.id)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark Done</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
