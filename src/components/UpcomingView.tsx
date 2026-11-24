import React from 'react';
import { Task } from '../types/task';
import {
  addDays,
  getTaskDueTimestamp,
  isTaskOverdue,
  toLocalDateString,
} from '../utils/dateUtils';
import { TaskList } from './TaskList';

interface UpcomingViewProps {
  tasks: Task[];
  onOpenAddModal: () => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  tasks,
  onOpenAddModal,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const now = new Date();
  const todayStr = toLocalDateString(now);
  const tomorrowStr = toLocalDateString(addDays(now, 1));
  const pending = tasks.filter((t) => !t.completed);

  const sortChronological = (list: Task[]) =>
    [...list].sort((a, b) => {
      const timeA = getTaskDueTimestamp(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const timeB = getTaskDueTimestamp(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    });

  const overdue = sortChronological(pending.filter((t) => isTaskOverdue(t, now)));
  const dueToday = sortChronological(
    pending.filter((t) => t.dueDate === todayStr && !isTaskOverdue(t, now))
  );
  const dueTomorrow = sortChronological(
    pending.filter((t) => t.dueDate === tomorrowStr)
  );
  const later = sortChronological(
    pending.filter((t) => t.dueDate && t.dueDate > tomorrowStr)
  );
  const unscheduled = pending.filter((t) => !t.dueDate);

  const sections = [
    { key: 'overdue', title: 'Overdue', items: overdue, urgent: true },
    { key: 'today', title: 'Later Today', items: dueToday, urgent: false },
    { key: 'tomorrow', title: 'Tomorrow', items: dueTomorrow, urgent: false },
    { key: 'later', title: 'Upcoming Dates', items: later, urgent: false },
    { key: 'unscheduled', title: 'No Due Date', items: unscheduled, urgent: false },
  ].filter((sec) => sec.items.length > 0);

  if (sections.length === 0) {
    return (
      <TaskList
        tasks={[]}
        totalTaskCount={0}
        emptyTitle="No upcoming pending tasks"
        emptyDescription="You are caught up on every scheduled task. Add a new task to plan ahead."
        onOpenAddModal={onOpenAddModal}
        onToggleComplete={onToggleComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.key} className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2
              className={`font-display text-sm font-semibold ${
                section.urgent
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {section.title}
            </h2>
            <span className="font-mono-tabular text-xs text-slate-500 dark:text-slate-400">
              {section.items.length} {section.items.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <TaskList
            tasks={section.items}
            totalTaskCount={tasks.length}
            onOpenAddModal={onOpenAddModal}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </section>
      ))}
    </div>
  );
};
