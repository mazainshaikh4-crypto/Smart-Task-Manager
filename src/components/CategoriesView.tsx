import React from 'react';
import {
  BookOpen,
  Briefcase,
  HeartPulse,
  Layers,
  Plus,
  ShoppingBag,
  User,
} from 'lucide-react';
import { CATEGORIES, Task, TaskCategory } from '../types/task';
import { TaskList } from './TaskList';

interface CategoriesViewProps {
  tasks: Task[];
  selectedCategory: TaskCategory;
  onSelectCategory: (category: TaskCategory) => void;
  onOpenAddForCategory: (category: TaskCategory) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const CATEGORY_ICONS: Record<TaskCategory, React.ComponentType<{ className?: string }>> = {
  Personal: User,
  Education: BookOpen,
  Work: Briefcase,
  Shopping: ShoppingBag,
  Health: HeartPulse,
  Other: Layers,
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  tasks,
  selectedCategory,
  onSelectCategory,
  onOpenAddForCategory,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const categoryTasks = tasks.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Selector Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const items = tasks.filter((t) => t.category === category);
          const completed = items.filter((t) => t.completed).length;
          const pending = items.length - completed;
          const pct = items.length === 0 ? 0 : Math.round((completed / items.length) * 100);
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`flex flex-col rounded-xl border p-5 text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                      isSelected
                        ? 'border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                    {category}
                  </span>
                </div>
                <span className="font-mono-tabular text-xs font-medium text-slate-500 dark:text-slate-400">
                  {pending} open
                </span>
              </div>

              <div className="mt-4 w-full">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="tabular-nums">
                    {completed}/{items.length} done
                  </span>
                  <span className="tabular-nums font-medium">{pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-300 dark:bg-indigo-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Category Tasks */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              {selectedCategory} Tasks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {categoryTasks.length}{' '}
              {categoryTasks.length === 1 ? 'task' : 'tasks'} in {selectedCategory}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenAddForCategory(selectedCategory)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add to {selectedCategory}</span>
          </button>
        </div>

        <TaskList
          tasks={categoryTasks}
          totalTaskCount={tasks.length}
          emptyTitle={`No ${selectedCategory.toLowerCase()} tasks yet`}
          emptyDescription={`Tasks assigned to the ${selectedCategory} category will appear here.`}
          onOpenAddModal={() => onOpenAddForCategory(selectedCategory)}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};
