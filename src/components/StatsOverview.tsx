import React from 'react';
import { Task } from '../types/task';
import {
  formatDisplayDate,
  formatDisplayTime,
  getTaskDueTimestamp,
  isTaskDueToday,
  isTaskOverdue,
} from '../utils/dateUtils';

interface StatsOverviewProps {
  tasks: Task[];
  onQuickToggle: (id: string) => void;
  onSelectView: (view: 'today' | 'upcoming' | 'completed' | 'my-tasks') => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  tasks,
  onQuickToggle,
  onSelectView,
}) => {
  const now = new Date();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const overdueTasksList = tasks.filter((t) => isTaskOverdue(t, now));
  const overdueCount = overdueTasksList.length;

  const completionPercentage =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const todayTasks = tasks.filter((t) => isTaskDueToday(t, now));
  const todayCompleted = todayTasks.filter((t) => t.completed).length;

  const upcomingDeadlines = tasks
    .filter((t) => !t.completed && t.dueDate && !isTaskOverdue(t, now))
    .sort((a, b) => {
      const timeA = getTaskDueTimestamp(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const timeB = getTaskDueTimestamp(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    })
    .slice(0, 4);

  const metrics = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      subtext: 'All tracked items',
      accentClass: 'text-slate-900 dark:text-white',
      onClick: () => onSelectView('my-tasks'),
    },
    {
      label: 'Completed',
      value: completedTasks,
      subtext: `${completionPercentage}% completion rate`,
      accentClass: 'text-emerald-600 dark:text-emerald-400',
      onClick: () => onSelectView('completed'),
    },
    {
      label: 'Pending',
      value: pendingTasks,
      subtext: 'Remaining to finish',
      accentClass: 'text-indigo-600 dark:text-indigo-400',
      onClick: () => onSelectView('my-tasks'),
    },
    {
      label: 'Overdue',
      value: overdueCount,
      subtext: overdueCount > 0 ? 'Needs immediate attention' : 'All deadlines on track',
      accentClass:
        overdueCount > 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-slate-900 dark:text-white',
      onClick: () => onSelectView('today'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4-Column Task Statistics Strip (Unified single-elevation surface) */}
      <section
        aria-label="Task statistics"
        className="grid grid-cols-2 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900"
      >
        {metrics.map((metric, index) => (
          <button
            key={metric.label}
            type="button"
            onClick={metric.onClick}
            className={`flex flex-col items-start p-5 text-left transition-colors duration-150 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-slate-800/50 ${
              index % 2 === 1 ? 'border-l border-slate-200 sm:border-l-0 dark:border-slate-800' : ''
            }`}
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {metric.label}
            </span>
            <span
              className={`mt-2 font-display text-3xl font-bold tracking-tight tabular-nums ${metric.accentClass}`}
            >
              {metric.value}
            </span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {metric.subtext}
            </span>
          </button>
        ))}
      </section>

      {/* Progress Overview + Daily / Upcoming Summary */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Progress & Daily Overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Task Progress Overview
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                  {completedTasks}
                </span>{' '}
                of{' '}
                <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                  {totalTasks}
                </span>{' '}
                tasks completed
              </p>
            </div>
            <span className="font-display text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
              {completionPercentage}%
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div
            className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall task completion percentage"
          >
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out dark:bg-indigo-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          {/* Daily Overview List */}
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Daily Task Overview
              </h3>
              <button
                type="button"
                onClick={() => onSelectView('today')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View Today ({todayCompleted}/{todayTasks.length})
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No tasks scheduled specifically for today.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80">
                {todayTasks.slice(0, 4).map((task) => (
                  <li key={task.id} className="flex items-center justify-between gap-3 py-2.5">
                    <label className="flex min-w-0 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onQuickToggle(task.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <span
                        className={`truncate text-sm ${
                          task.completed
                            ? 'text-slate-400 line-through dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </label>
                    <span className="shrink-0 font-mono-tabular text-xs text-slate-500 dark:text-slate-400">
                      {task.dueTime ? formatDisplayTime(task.dueTime) : task.category}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Upcoming Deadlines
            </h2>
            <button
              type="button"
              onClick={() => onSelectView('upcoming')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              See schedule
            </button>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              No upcoming deadlines queued. Add a due date to a task to track it here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/80">
              {upcomingDeadlines.map((task) => (
                <li key={task.id} className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {task.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span>{task.category}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span
                        className={
                          task.priority === 'High'
                            ? 'font-medium text-red-600 dark:text-red-400'
                            : task.priority === 'Medium'
                            ? 'font-medium text-orange-600 dark:text-orange-400'
                            : 'font-medium text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {task.priority} Priority
                      </span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right font-mono-tabular text-xs text-slate-600 dark:text-slate-300">
                    <div>{formatDisplayDate(task.dueDate, now)}</div>
                    {task.dueTime && (
                      <div className="text-slate-400 dark:text-slate-500">
                        {formatDisplayTime(task.dueTime)}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
