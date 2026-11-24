import React from 'react';
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  X,
} from 'lucide-react';
import { SidebarView } from '../types/task';

interface SidebarProps {
  activeView: SidebarView;
  onSelectView: (view: SidebarView) => void;
  counts: {
    all: number;
    pending: number;
    today: number;
    upcoming: number;
    completed: number;
  };
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  id: SidebarView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  counts,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: NavItemConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-tasks', label: 'My Tasks', icon: ListTodo, count: counts.pending },
    { id: 'today', label: 'Today', icon: CalendarDays, count: counts.today },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarClock, count: counts.upcoming },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: counts.completed },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (view: SidebarView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5 dark:bg-slate-900">
      <div>
        <div className="mb-6 flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => handleSelect('dashboard')}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md dark:text-white"
          >
            Cadence
          </button>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Main Navigation" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-3 whitespace-nowrap">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                {typeof item.count === 'number' && (
                  <span
                    className={`tabular-nums text-xs ${
                      isActive
                        ? 'font-semibold text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 pt-4 px-2 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Saved locally</span>
          <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
            {counts.all} {counts.all === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 lg:block dark:border-slate-800">
        <div className="sticky top-0 h-screen">{navContent}</div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-[1px] transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-50 w-72 max-w-[80vw] border-r border-slate-200 shadow-xl dark:border-slate-800">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
