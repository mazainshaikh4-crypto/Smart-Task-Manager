import React from 'react';
import { Menu, Moon, Plus, Sun } from 'lucide-react';
import { SidebarView, ThemeMode } from '../types/task';

interface HeaderProps {
  activeView: SidebarView;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenAddModal: () => void;
  onOpenMobileMenu: () => void;
}

const VIEW_LABELS: Record<SidebarView, string> = {
  dashboard: 'Dashboard',
  'my-tasks': 'My Tasks',
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
  categories: 'Categories',
  settings: 'Settings',
};

export const Header: React.FC<HeaderProps> = ({
  activeView,
  theme,
  onToggleTheme,
  onOpenAddModal,
  onOpenMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="hidden text-slate-400 sm:inline dark:text-slate-500">
            Workspace
          </span>
          <span className="hidden text-slate-300 sm:inline dark:text-slate-700" aria-hidden="true">
            /
          </span>
          <span className="font-display font-semibold text-slate-900 truncate dark:text-slate-100">
            {VIEW_LABELS[activeView]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus-visible:ring-offset-slate-900"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>
    </header>
  );
};
