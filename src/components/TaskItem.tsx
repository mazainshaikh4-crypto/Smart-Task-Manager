import React from 'react';
import { AlertCircle, Check, Flag, Pencil, Trash2 } from 'lucide-react';
import { Task } from '../types/task';
import {
  formatDisplayDate,
  formatDisplayTime,
  isTaskDueToday,
  isTaskOverdue,
} from '../utils/dateUtils';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  High: 'text-red-600 dark:text-red-400',
  Medium: 'text-orange-600 dark:text-orange-400',
  Low: 'text-emerald-600 dark:text-emerald-400',
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const now = new Date();
  const overdue = isTaskOverdue(task, now);
  const dueToday = !task.completed && !overdue && isTaskDueToday(task, now);

  return (
    <li
      className={`group flex items-start justify-between gap-4 px-4 py-4 transition-colors duration-150 sm:px-5 ${
        overdue
          ? 'bg-red-50/40 hover:bg-red-50/70 dark:bg-red-950/15 dark:hover:bg-red-950/25'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {/* Completion Checkbox Button (40px accessible hit area) */}
        <button
          type="button"
          onClick={() => onToggleComplete(task.id)}
          aria-label={
            task.completed ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`
          }
          aria-pressed={task.completed}
          className="mt-0.5 flex h-10 w-10 -m-2 shrink-0 items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 ${
              task.completed
                ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500'
                : overdue
                ? 'border-red-400 bg-white group-hover:border-red-500 dark:border-red-700 dark:bg-slate-900'
                : 'border-slate-300 bg-white group-hover:border-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:group-hover:border-indigo-400'
            }`}
          >
            {task.completed && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
          </span>
        </button>

        {/* Task Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h3
              className={`text-sm font-semibold leading-snug transition-colors ${
                task.completed
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h3>

            {overdue && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Overdue</span>
              </span>
            )}

            {dueToday && (
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Due today
              </span>
            )}
          </div>

          {task.description && (
            <p
              className={`mt-1 text-sm leading-relaxed ${
                task.completed
                  ? 'text-slate-400 dark:text-slate-600'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Clean unboxed metadata row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {task.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className={`inline-flex items-center gap-1 font-medium ${PRIORITY_STYLES[task.priority]}`}>
              <Flag className="h-3 w-3" aria-hidden="true" />
              <span>{task.priority}</span>
            </span>
            {task.dueDate && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  className={`font-mono-tabular ${
                    overdue
                      ? 'font-medium text-red-600 dark:text-red-400'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {formatDisplayDate(task.dueDate, now)}
                  {task.dueTime ? ` at ${formatDisplayTime(task.dueTime)}` : ''}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          title="Edit task"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
          title="Delete task"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-slate-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
};
