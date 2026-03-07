import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kanban-board-data';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const DEFAULT_COLUMNS = [
  { id: 'col-todo', title: 'Todo', taskIds: [] },
  { id: 'col-in-progress', title: 'In Progress', taskIds: [] },
  { id: 'col-done', title: 'Done', taskIds: [] },
];

const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.columns && parsed.tasks) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load board data from localStorage:', e);
  }
  return { columns: DEFAULT_COLUMNS, tasks: {} };
};

const saveToStorage = (columns, tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ columns, tasks }));
  } catch (e) {
    console.warn('Failed to save board data to localStorage:', e);
  }
};

export function useKanban() {
  const [columns, setColumns] = useState(() => loadFromStorage().columns);
  const [tasks, setTasks] = useState(() => loadFromStorage().tasks);

  // Persist on every change
  useEffect(() => {
    saveToStorage(columns, tasks);
  }, [columns, tasks]);

  const addTask = useCallback((columnId, title, description = '', priority = 'medium') => {
    const id = `task-${generateId()}`;
    const newTask = {
      id,
      title,
      description,
      priority,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => ({ ...prev, [id]: newTask }));
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, taskIds: [...col.taskIds, id] } : col
      )
    );

    return id;
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], ...updates },
    }));
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        taskIds: col.taskIds.filter((id) => id !== taskId),
      }))
    );
  }, []);

  const moveTask = useCallback((taskId, sourceColId, destColId, destIndex) => {
    setColumns((prev) => {
      return prev.map((col) => {
        if (col.id === sourceColId && col.id === destColId) {
          // Moving within the same column
          const newTaskIds = col.taskIds.filter((id) => id !== taskId);
          newTaskIds.splice(destIndex, 0, taskId);
          return { ...col, taskIds: newTaskIds };
        }
        if (col.id === sourceColId) {
          return { ...col, taskIds: col.taskIds.filter((id) => id !== taskId) };
        }
        if (col.id === destColId) {
          const newTaskIds = [...col.taskIds];
          newTaskIds.splice(destIndex, 0, taskId);
          return { ...col, taskIds: newTaskIds };
        }
        return col;
      });
    });
  }, []);

  const addColumn = useCallback((title) => {
    const id = `col-${generateId()}`;
    setColumns((prev) => [...prev, { id, title, taskIds: [] }]);
    return id;
  }, []);

  const updateColumnTitle = useCallback((columnId, title) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, title } : col))
    );
  }, []);

  const deleteColumn = useCallback((columnId) => {
    setColumns((prev) => {
      const col = prev.find((c) => c.id === columnId);
      if (col) {
        // Also remove all tasks in this column
        setTasks((prevTasks) => {
          const next = { ...prevTasks };
          col.taskIds.forEach((id) => delete next[id]);
          return next;
        });
      }
      return prev.filter((c) => c.id !== columnId);
    });
  }, []);

  return {
    columns,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    updateColumnTitle,
    deleteColumn,
  };
}
