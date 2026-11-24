import React from 'react';
import { ClipboardList, Plus, RotateCcw } from 'lucide-react';
import { Task } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  totalTaskCount: number;
  emptyTitle?: string;
  emptyDescription?: string;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  onOpenAddModal: () => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  totalTaskCount,
  emptyTitle,
  emptyDescription,
  hasActiveFilters = false,
  onResetFilters,
  onOpenAddModal,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  if (tasks.length === 0) {
    const isFilteredEmpty = totalTaskCount > 0 && hasActiveFilters;
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500">
          <ClipboardList className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-base font-semibold text-slate-900 dark:text-white">
          {isFilteredEmpty
            ? 'No matching tasks found'
            : emptyTitle || 'Your task list is clear'}
        </h3>
        <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {isFilteredEmpty
            ? 'Try adjusting your search query or clearing your active priority, status, or category filters.'
            : emptyDescription ||
              'Create a task with a priority and deadline to start organizing your schedule.'}
        </p>
        <div className="mt-6 flex items-center gap-3">
          {isFilteredEmpty && onResetFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Filters</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Task</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
};
