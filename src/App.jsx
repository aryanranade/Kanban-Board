import { useKanban } from './hooks/useKanban';
import { useTheme } from './hooks/useTheme';
import Board from './components/Board';

export default function App() {
  const kanban = useKanban();
  const { theme, toggleTheme } = useTheme();

  return (
    <Board
      columns={kanban.columns}
      tasks={kanban.tasks}
      addTask={kanban.addTask}
      updateTask={kanban.updateTask}
      deleteTask={kanban.deleteTask}
      moveTask={kanban.moveTask}
      addColumn={kanban.addColumn}
      updateColumnTitle={kanban.updateColumnTitle}
      deleteColumn={kanban.deleteColumn}
      theme={theme}
      toggleTheme={toggleTheme}
    />
  );
}
