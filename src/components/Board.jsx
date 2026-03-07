import { useState } from 'react';
import Column from './Column';
import TaskModal from './TaskModal';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

const DEFAULT_COLUMN_IDS = ['col-todo', 'col-in-progress', 'col-done'];

export default function Board({
    columns,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addColumn,
    updateColumnTitle,
    deleteColumn,
    theme,
    toggleTheme,
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [modalState, setModalState] = useState(null);
    // modalState: { mode: 'create' | 'edit', columnId?, task? }
    const [confirmDelete, setConfirmDelete] = useState(null);
    // confirmDelete: { type: 'task' | 'column', id, title }

    const handleAddTask = (columnId) => {
        setModalState({ mode: 'create', columnId });
    };

    const handleEditTask = (task) => {
        setModalState({ mode: 'edit', task });
    };

    const handleSaveTask = (taskData) => {
        if (modalState.mode === 'create') {
            addTask(modalState.columnId, taskData.title, taskData.description, taskData.priority);
        } else {
            updateTask(taskData.id, {
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority,
            });
        }
        setModalState(null);
    };

    const handleDeleteTask = (taskId) => {
        const task = tasks[taskId];
        setConfirmDelete({ type: 'task', id: taskId, title: task?.title || 'this task' });
        setModalState(null);
    };

    const handleDeleteColumn = (columnId) => {
        const col = columns.find((c) => c.id === columnId);
        setConfirmDelete({ type: 'column', id: columnId, title: col?.title || 'this column' });
    };

    const handleConfirmDelete = () => {
        if (confirmDelete.type === 'task') {
            deleteTask(confirmDelete.id);
        } else {
            deleteColumn(confirmDelete.id);
        }
        setConfirmDelete(null);
    };

    const handleAddColumn = () => {
        const title = `Column ${columns.length + 1}`;
        addColumn(title);
    };

    return (
        <>
            {/* Header */}
            <header className="app-header">
                <div className="app-header__brand">
                    <div className="app-header__logo">K</div>
                    <h1 className="app-header__title">Kanban Board</h1>
                </div>
                <div className="app-header__actions">
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    <ThemeToggle theme={theme} onToggle={toggleTheme} />
                    <button className="btn btn--primary" onClick={handleAddColumn} id="add-column-btn">
                        ＋ Column
                    </button>
                </div>
            </header>

            {/* Board */}
            <main className="board" id="kanban-board">
                {columns.map((column) => (
                    <Column
                        key={column.id}
                        column={column}
                        tasks={tasks}
                        isDefault={DEFAULT_COLUMN_IDS.includes(column.id)}
                        onAddTask={handleAddTask}
                        onEditTask={handleEditTask}
                        onDeleteColumn={handleDeleteColumn}
                        onUpdateTitle={updateColumnTitle}
                        onMoveTask={moveTask}
                        searchQuery={searchQuery}
                    />
                ))}
                <button className="add-column-btn" onClick={handleAddColumn} id="add-column-inline-btn">
                    ＋ Add Column
                </button>
            </main>

            {/* Task Modal */}
            {modalState && (
                <TaskModal
                    task={modalState.mode === 'edit' ? modalState.task : null}
                    onSave={handleSaveTask}
                    onDelete={handleDeleteTask}
                    onClose={() => setModalState(null)}
                />
            )}

            {/* Confirm Delete Dialog */}
            {confirmDelete && (
                <div className="modal-overlay" onClick={() => setConfirmDelete(null)} id="confirm-overlay">
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal__header">
                            <h2 className="modal__title">Confirm Delete</h2>
                            <button className="modal__close" onClick={() => setConfirmDelete(null)} aria-label="Close">
                                ✕
                            </button>
                        </div>
                        <div className="modal__body">
                            <div className="confirm-dialog">
                                <p className="confirm-dialog__message">
                                    Are you sure you want to delete <strong>"{confirmDelete.title}"</strong>?
                                    {confirmDelete.type === 'column' && ' All tasks in this column will be removed.'}
                                </p>
                                <div className="confirm-dialog__actions">
                                    <button className="btn btn--ghost" onClick={() => setConfirmDelete(null)}>
                                        Cancel
                                    </button>
                                    <button className="btn btn--danger" onClick={handleConfirmDelete} id="confirm-delete-btn"
                                        style={{ background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
