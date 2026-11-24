import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  AppSettings,
  PRIORITY_WEIGHT,
  SidebarView,
  SortOption,
  StatusFilter,
  Task,
  TaskCategory,
  TaskFormData,
  TaskPriority,
} from './types/task';
import {
  formatLongDate,
  getGreeting,
  getTaskDueTimestamp,
  isTaskDueToday,
  isTaskOverdue,
  toLocalDateString,
} from './utils/dateUtils';
import {
  createStarterTasks,
  loadSettingsFromStorage,
  loadTasksFromStorage,
  saveSettingsToStorage,
  saveTasksToStorage,
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CategoriesView } from './components/CategoriesView';
import { UpcomingView } from './components/UpcomingView';
import { SettingsView } from './components/SettingsView';
import { ReminderToast } from './components/ReminderToast';

type ConfirmState =
  | { type: 'delete-task'; task: Task }
  | { type: 'clear-completed'; count: number }
  | { type: 'clear-all' }
  | { type: 'restore-samples' }
  | null;

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettingsFromStorage());

  const [activeView, setActiveView] = useState<SidebarView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('due-asc');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<TaskCategory>('Work');

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<TaskCategory>('Personal');
  const [modalDefaultDueDate, setModalDefaultDueDate] = useState<string | undefined>(undefined);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  // Live Due Reminders
  const [activeReminders, setActiveReminders] = useState<Task[]>([]);
  const dismissedReminderIdsRef = useRef<Set<string>>(new Set());
  const snoozedUntilRef = useRef<Map<string, number>>(new Map());
  const notifiedBrowserIdsRef = useRef<Set<string>>(new Set());

  // Sync tasks to LocalStorage
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Sync settings to LocalStorage & apply dark class
  useEffect(() => {
    saveSettingsToStorage(settings);
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  // Reminder checker: notifies when a pending task's due time is reached while app is open
  const checkDueReminders = useCallback(() => {
    if (!settings.remindersEnabled) {
      setActiveReminders([]);
      return;
    }

    const now = Date.now();
    const dueNow: Task[] = [];

    for (const task of tasks) {
      if (task.completed || !task.dueDate || !task.dueTime) continue;
      if (dismissedReminderIdsRef.current.has(task.id)) continue;

      const snoozeTime = snoozedUntilRef.current.get(task.id);
      if (snoozeTime && now < snoozeTime) continue;

      const dueDateObj = getTaskDueTimestamp(task);
      if (!dueDateObj) continue;

      const elapsed = now - dueDateObj.getTime();
      // Trigger for tasks whose due time is reached within the last 60 minutes while app is open
      if (elapsed >= 0 && elapsed <= 60 * 60 * 1000) {
        dueNow.push(task);

        if (
          settings.browserNotifications &&
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted' &&
          !notifiedBrowserIdsRef.current.has(task.id)
        ) {
          notifiedBrowserIdsRef.current.add(task.id);
          new Notification(`Due Task: ${task.title}`, {
            body: `${task.category} · ${task.priority} priority`,
          });
        }
      }
    }

    setActiveReminders(dueNow);
  }, [tasks, settings.remindersEnabled, settings.browserNotifications]);

  useEffect(() => {
    checkDueReminders();
    const interval = window.setInterval(checkDueReminders, 15000);
    return () => window.clearInterval(interval);
  }, [checkDueReminders]);

  // Computed counts for sidebar
  const counts = useMemo(() => {
    const now = new Date();
    const pending = tasks.filter((t) => !t.completed).length;
    const completed = tasks.filter((t) => t.completed).length;
    const today = tasks.filter((t) => !t.completed && (isTaskDueToday(t, now) || isTaskOverdue(t, now))).length;
    const upcoming = tasks.filter((t) => !t.completed).length;

    return {
      all: tasks.length,
      pending,
      today,
      upcoming,
      completed,
    };
  }, [tasks]);

  // Filtering + Sorting Logic
  const getFilteredAndSortedTasks = useCallback(
    (sourceTasks: Task[], options?: { ignoreStatusFilter?: boolean }) => {
      const query = searchQuery.trim().toLowerCase();

      const filtered = sourceTasks.filter((task) => {
        if (query && !task.title.toLowerCase().includes(query) && !task.description.toLowerCase().includes(query)) {
          return false;
        }
        if (!options?.ignoreStatusFilter) {
          if (statusFilter === 'completed' && !task.completed) return false;
          if (statusFilter === 'pending' && task.completed) return false;
        }
        if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
          return false;
        }
        if (categoryFilter !== 'All' && task.category !== categoryFilter) {
          return false;
        }
        return true;
      });

      return [...filtered].sort((a, b) => {
        // Always keep pending before completed when sorting by due date unless viewing completed
        if (sortBy === 'due-asc') {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          const timeA = getTaskDueTimestamp(a)?.getTime() ?? Number.MAX_SAFE_INTEGER;
          const timeB = getTaskDueTimestamp(b)?.getTime() ?? Number.MAX_SAFE_INTEGER;
          return timeA - timeB;
        }
        if (sortBy === 'due-desc') {
          const timeA = getTaskDueTimestamp(a)?.getTime() ?? 0;
          const timeB = getTaskDueTimestamp(b)?.getTime() ?? 0;
          return timeB - timeA;
        }
        if (sortBy === 'priority-desc') {
          return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        }
        if (sortBy === 'priority-asc') {
          return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    },
    [searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]
  );

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('All');
    setCategoryFilter('All');
  };

  // Task CRUD Handlers
  const handleOpenAddModal = (defaults?: { category?: TaskCategory; dueDate?: string }) => {
    setEditingTask(null);
    setModalDefaultCategory(defaults?.category ?? 'Personal');
    setModalDefaultDueDate(defaults?.dueDate);
    setTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (data: TaskFormData, existingId?: string) => {
    if (existingId) {
      // Reset reminder tracking for edited task in case user updated due date/time
      dismissedReminderIdsRef.current.delete(existingId);
      snoozedUntilRef.current.delete(existingId);
      notifiedBrowserIdsRef.current.delete(existingId);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === existingId
            ? {
                ...t,
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority,
                dueDate: data.dueDate,
                dueTime: data.dueTime,
              }
            : t
        )
      );
    } else {
      const newTask: Task = {
        id: generateId(),
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const nextCompleted = !task.completed;
        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
        };
      })
    );
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleConfirmAction = () => {
    if (!confirmState) return;

    if (confirmState.type === 'delete-task') {
      const targetId = confirmState.task.id;
      setTasks((prev) => prev.filter((t) => t.id !== targetId));
      setActiveReminders((prev) => prev.filter((r) => r.id !== targetId));
    } else if (confirmState.type === 'clear-completed') {
      setTasks((prev) => prev.filter((t) => !t.completed));
    } else if (confirmState.type === 'clear-all') {
      setTasks([]);
      setActiveReminders([]);
    } else if (confirmState.type === 'restore-samples') {
      setTasks(createStarterTasks());
      dismissedReminderIdsRef.current.clear();
      snoozedUntilRef.current.clear();
    }

    setConfirmState(null);
  };

  // Reminder Toast Actions
  const handleDismissReminder = (id: string) => {
    dismissedReminderIdsRef.current.add(id);
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSnoozeReminder = (id: string) => {
    snoozedUntilRef.current.set(id, Date.now() + 15 * 60 * 1000);
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Settings & Export
  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleExportTasks = () => {
    const payload = JSON.stringify(tasks, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cadence-tasks-${toLocalDateString(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const now = new Date();
  const todayFormatted = formatLongDate(now);
  const greeting = getGreeting(now);

  // View-specific task collections
  const dashboardTasks = useMemo(
    () => getFilteredAndSortedTasks(tasks),
    [tasks, getFilteredAndSortedTasks]
  );

  const todayViewTasks = useMemo(() => {
    const relevant = tasks.filter(
      (t) => isTaskDueToday(t, now) || isTaskOverdue(t, now)
    );
    return getFilteredAndSortedTasks(relevant);
  }, [tasks, getFilteredAndSortedTasks]);

  const completedViewTasks = useMemo(() => {
    const relevant = tasks.filter((t) => t.completed);
    return getFilteredAndSortedTasks(relevant, { ignoreStatusFilter: true });
  }, [tasks, getFilteredAndSortedTasks]);

  const confirmDialogConfig = (() => {
    if (!confirmState) return null;
    if (confirmState.type === 'delete-task') {
      return {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${confirmState.task.title}"? This action cannot be undone.`,
        confirmLabel: 'Delete Task',
      };
    }
    if (confirmState.type === 'clear-completed') {
      return {
        title: 'Clear Completed Tasks',
        message: `Remove all ${confirmState.count} completed ${
          confirmState.count === 1 ? 'task' : 'tasks'
        } from your list? Pending tasks will remain untouched.`,
        confirmLabel: 'Clear Completed',
      };
    }
    if (confirmState.type === 'clear-all') {
      return {
        title: 'Clear All Tasks',
        message:
          'This will permanently remove every task saved in your browser. Are you sure you want to continue?',
        confirmLabel: 'Clear All',
      };
    }
    return {
      title: 'Load Sample Tasks',
      message:
        'Replace your current task list with starter tasks across Work, Education, Health, Personal, and Shopping?',
      confirmLabel: 'Load Samples',
    };
  })();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        counts={counts}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          activeView={activeView}
          theme={settings.theme}
          onToggleTheme={() =>
            handleUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
          }
          onOpenAddModal={() => handleOpenAddModal()}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* DASHBOARD VIEW */}
          {activeView === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="font-mono-tabular text-xs font-medium text-slate-500 dark:text-slate-400">
                    {todayFormatted}
                  </p>
                  <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                    {greeting}, {settings.userName}
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {counts.pending === 0
                      ? 'All tasks are complete. Add a new task whenever you are ready.'
                      : `You have ${counts.pending} pending ${
                          counts.pending === 1 ? 'task' : 'tasks'
                        } to manage.`}
                  </p>
                </div>
              </div>

              <StatsOverview
                tasks={tasks}
                onQuickToggle={handleToggleComplete}
                onSelectView={(view) => setActiveView(view)}
              />

              <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                    Tasks
                  </h2>
                  <span className="font-mono-tabular text-xs text-slate-500 dark:text-slate-400">
                    Showing {dashboardTasks.length} of {tasks.length}
                  </span>
                </div>

                <TaskFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  priorityFilter={priorityFilter}
                  onPriorityFilterChange={setPriorityFilter}
                  categoryFilter={categoryFilter}
                  onCategoryFilterChange={setCategoryFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  completedCount={counts.completed}
                  onClearCompleted={() =>
                    setConfirmState({ type: 'clear-completed', count: counts.completed })
                  }
                />

                <TaskList
                  tasks={dashboardTasks}
                  totalTaskCount={tasks.length}
                  hasActiveFilters={hasActiveFilters}
                  onResetFilters={handleResetFilters}
                  onOpenAddModal={() => handleOpenAddModal()}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleOpenEditModal}
                  onDelete={(task) => setConfirmState({ type: 'delete-task', task })}
                />
              </section>
            </div>
          )}

          {/* MY TASKS VIEW */}
          {activeView === 'my-tasks' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    My Tasks
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Search, filter, sort, and manage every task across your workspace.
                  </p>
                </div>
                <span className="font-mono-tabular text-xs font-medium text-slate-500 dark:text-slate-400">
                  {dashboardTasks.length} shown
                </span>
              </div>

              <TaskFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                completedCount={counts.completed}
                onClearCompleted={() =>
                  setConfirmState({ type: 'clear-completed', count: counts.completed })
                }
              />

              <TaskList
                tasks={dashboardTasks}
                totalTaskCount={tasks.length}
                hasActiveFilters={hasActiveFilters}
                onResetFilters={handleResetFilters}
                onOpenAddModal={() => handleOpenAddModal()}
                onToggleComplete={handleToggleComplete}
                onEdit={handleOpenEditModal}
                onDelete={(task) => setConfirmState({ type: 'delete-task', task })}
              />
            </div>
          )}

          {/* TODAY VIEW */}
          {activeView === 'today' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono-tabular text-xs font-medium text-slate-500 dark:text-slate-400">
                    {todayFormatted}
                  </p>
                  <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Today &amp; Overdue
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Tasks scheduled for today along with any overdue deadlines needing attention.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal({ dueDate: toLocalDateString(new Date()) })}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add for Today</span>
                </button>
              </div>

              <TaskFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                completedCount={counts.completed}
                onClearCompleted={() =>
                  setConfirmState({ type: 'clear-completed', count: counts.completed })
                }
              />

              <TaskList
                tasks={todayViewTasks}
                totalTaskCount={tasks.length}
                emptyTitle="Nothing due today"
                emptyDescription="You have no overdue or today-scheduled tasks matching these filters."
                hasActiveFilters={hasActiveFilters}
                onResetFilters={handleResetFilters}
                onOpenAddModal={() =>
                  handleOpenAddModal({ dueDate: toLocalDateString(new Date()) })
                }
                onToggleComplete={handleToggleComplete}
                onEdit={handleOpenEditModal}
                onDelete={(task) => setConfirmState({ type: 'delete-task', task })}
              />
            </div>
          )}

          {/* UPCOMING VIEW */}
          {activeView === 'upcoming' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Upcoming Deadlines
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Chronological view of all pending tasks ordered by due date and time.
                </p>
              </div>

              <UpcomingView
                tasks={tasks}
                onOpenAddModal={() => handleOpenAddModal()}
                onToggleComplete={handleToggleComplete}
                onEdit={handleOpenEditModal}
                onDelete={(task) => setConfirmState({ type: 'delete-task', task })}
              />
            </div>
          )}

          {/* COMPLETED VIEW */}
          {activeView === 'completed' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Completed Tasks
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Review finished items or clear completed tasks to keep your workspace lean.
                  </p>
                </div>
              </div>

              <TaskFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                completedCount={counts.completed}
                onClearCompleted={() =>
                  setConfirmState({ type: 'clear-completed', count: counts.completed })
                }
                hideStatusTabs
              />

              <TaskList
                tasks={completedViewTasks}
                totalTaskCount={counts.completed}
                emptyTitle="No completed tasks yet"
                emptyDescription="Tasks you mark as completed will appear here for reference."
                hasActiveFilters={
                  searchQuery.trim() !== '' ||
                  priorityFilter !== 'All' ||
                  categoryFilter !== 'All'
                }
                onResetFilters={handleResetFilters}
                onOpenAddModal={() => handleOpenAddModal()}
                onToggleComplete={handleToggleComplete}
                onEdit={handleOpenEditModal}
                onDelete={(task) => setConfirmState({ type: 'delete-task', task })}
              />
            </div>
          )}

          {/* CATEGORIES VIEW */}
          {activeView === 'categories' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Categories
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Browse completion progress across Personal, Education, Work, Shopping, Health, and Other.
                </p>
              </div>

              <CategoriesView
                tasks={tasks}
                selectedCategory={selectedCategoryTab}
                onSelectCategory={setSelectedCategoryTab}
                onOpenAddForCategory={(cat) => handleOpenAddModal({ category: cat })}
                onToggleComplete={handleToggleComplete}
                onEdit={handleOpenEditModal}
                onDelete={(task) => setConfirmState({ type: 'delete-task', task })}
              />
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeView === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Settings
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Manage theme appearance, notification preferences, and local task storage.
                </p>
              </div>

              <SettingsView
                settings={settings}
                tasks={tasks}
                onUpdateSettings={handleUpdateSettings}
                onExportTasks={handleExportTasks}
                onRequestRestoreSamples={() => setConfirmState({ type: 'restore-samples' })}
                onRequestClearAll={() => setConfirmState({ type: 'clear-all' })}
              />
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        editingTask={editingTask}
        defaultCategory={modalDefaultCategory}
        defaultDueDate={modalDefaultDueDate}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      {/* Delete / Bulk Action Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState !== null}
        title={confirmDialogConfig?.title ?? ''}
        message={confirmDialogConfig?.message ?? ''}
        confirmLabel={confirmDialogConfig?.confirmLabel}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmState(null)}
      />

      {/* Live Due-Task Reminder Notification Stack */}
      <ReminderToast
        reminders={activeReminders}
        onCompleteTask={handleToggleComplete}
        onSnoozeTask={handleSnoozeReminder}
        onDismiss={handleDismissReminder}
      />
    </div>
  );
}
