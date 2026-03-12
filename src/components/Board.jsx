import { useState } from 'react';
import Column from './Column';
import TaskModal from './TaskModal';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

const DEFAULT_COL_IDS = ['col-todo', 'col-in-progress', 'col-done'];

export default function Board({
    columns, tasks,
    addTask, updateTask, deleteTask, moveTask,
    addColumn, updateColumnTitle, deleteColumn,
    theme, toggleTheme,
}) {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [modal, setModal] = useState(null);   // { mode:'create'|'edit', columnId?, task? }
    const [confirm, setConfirm] = useState(null);

    const openAddTask = (columnId) => setModal({ mode: 'create', columnId });
    const openNewTask = () => setModal({ mode: 'create', columnId: columns[0]?.id });
    const openEditTask = (task) => setModal({ mode: 'edit', task });

    const handleSave = (data) => {
        if (modal.mode === 'create') {
            const colId = data.columnId || modal.columnId;
            addTask(colId, data.title, data.description, data.priority, data.dueDate, data.subtasks, data.labels);
        } else {
            updateTask(data.id, {
                title: data.title, description: data.description,
                priority: data.priority, dueDate: data.dueDate,
                subtasks: data.subtasks, labels: data.labels,
            });
        }
        setModal(null);
    };

    const requestDeleteTask = (taskId) => {
        const task = tasks[taskId];
        setConfirm({ type: 'task', id: taskId, name: task?.title || 'this task' });
        setModal(null);
    };

    const requestDeleteColumn = (colId) => {
        const col = columns.find(c => c.id === colId);
        setConfirm({ type: 'column', id: colId, name: col?.title || 'this column' });
    };

    const doConfirm = () => {
        if (confirm.type === 'task') deleteTask(confirm.id);
        else deleteColumn(confirm.id);
        setConfirm(null);
    };

    /* ---- Stats ---- */
    const allTasks = Object.values(tasks);
    const total = allTasks.length;
    const now = new Date();
    const overdue = allTasks.filter(t => t.dueDate && new Date(t.dueDate + 'T23:59:59') < now).length;
    const doneCol = columns.find(c => c.id === 'col-done');
    const progCol = columns.find(c => c.id === 'col-in-progress');
    const doneCount = doneCol ? doneCol.taskIds.length : 0;
    const progCount = progCol ? progCol.taskIds.length : 0;
    const donePct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
    const customCols = columns.filter(c => !DEFAULT_COL_IDS.includes(c.id));

    return (
        <>
            {/* ======= HEADER ======= */}
            <header className="app-header">
                <div className="app-header__brand">
                    <div className="app-header__logo">K</div>
                    <h1 className="app-header__title">Kanban Board</h1>
                </div>
                <div className="app-header__actions">
                    <SearchBar value={search} onChange={setSearch} />
                    <div className="sort-select-wrapper">
                        <span className="sort-select-icon">⇅</span>
                        <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)} id="sort-sel">
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="priority">Priority</option>
                            <option value="duedate">Due Date</option>
                        </select>
                    </div>
                    <ThemeToggle theme={theme} onToggle={toggleTheme} />
                    <button className="btn btn--ghost header-btn" onClick={openNewTask} id="hdr-new-task">
                        + New Task
                    </button>
                    <button className="btn btn--primary header-btn" onClick={() => addColumn(`Column ${columns.length + 1}`)} id="hdr-new-col">
                        + New Column
                    </button>
                </div>
            </header>

            {/* ======= STATS BAR ======= */}
            <div className="stats-bar" id="stats-bar">
                <div className="stats-item">
                    <div className="stats-icon stats-icon--total">▦</div>
                    <div className="stats-text">
                        <span className="count">{total}</span>
                        <span className="label">Total</span>
                    </div>
                </div>

                <div className="stats-divider" />

                <div className="stats-item">
                    <div className="stats-icon stats-icon--done">✓</div>
                    <div className="stats-text">
                        <span className="count">{doneCount} <small style={{ fontSize: '0.68rem', fontWeight: 500, opacity: 0.55 }}>({donePct}%)</small></span>
                        <span className="label">Done</span>
                    </div>
                </div>

                <div className="stats-divider" />

                <div className="stats-item">
                    <div className="stats-icon stats-icon--prog">⚡</div>
                    <div className="stats-text">
                        <span className="count">{progCount}</span>
                        <span className="label">In Progress</span>
                    </div>
                </div>

                {customCols.map(col => (
                    <span key={col.id} style={{ display: 'contents' }}>
                        <div className="stats-divider" />
                        <div className="stats-item">
                            <div className="stats-icon stats-icon--custom">⊡</div>
                            <div className="stats-text">
                                <span className="count">{col.taskIds.length}</span>
                                <span className="label">{col.title}</span>
                            </div>
                        </div>
                    </span>
                ))}

                {overdue > 0 && (
                    <>
                        <div className="stats-divider" />
                        <div className="stats-item stats-item--over">
                            <div className="stats-icon stats-icon--over">⚠</div>
                            <div className="stats-text">
                                <span className="count">{overdue}</span>
                                <span className="label">Overdue</span>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ======= BOARD ======= */}
            <main className="board" id="board">
                {columns.map((col, idx) => (
                    <Column
                        key={col.id} column={col} tasks={tasks}
                        isDefault={DEFAULT_COL_IDS.includes(col.id)}
                        onAddTask={openAddTask} onEditTask={openEditTask}
                        onDeleteColumn={requestDeleteColumn}
                        onUpdateTitle={updateColumnTitle} onMoveTask={moveTask}
                        searchQuery={search} sortOrder={sort}
                        columnIndex={idx}
                    />
                ))}
                <button className="add-col-btn" onClick={() => addColumn(`Column ${columns.length + 1}`)} id="inline-add-col">
                    + New Column
                </button>
            </main>

            {/* ======= TASK MODAL ======= */}
            {modal && (
                <TaskModal
                    task={modal.mode === 'edit' ? modal.task : null}
                    onSave={handleSave} onDelete={requestDeleteTask}
                    onClose={() => setModal(null)}
                    columns={columns} defaultColumnId={modal.columnId}
                />
            )}

            {/* ======= CONFIRM ======= */}
            {confirm && (
                <div className="modal-overlay" onClick={() => setConfirm(null)} id="confirm-overlay">
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 380 }}>
                        <div className="modal__head" style={{ paddingBottom: 0 }}>
                            <h2 className="modal__head-title" style={{ fontSize: '1.1rem' }}>Confirm Delete</h2>
                            <button className="modal__close-abs" onClick={() => setConfirm(null)} aria-label="Close">✕</button>
                        </div>
                        <div className="modal__body" style={{ paddingTop: 12 }}>
                            <p className="confirm-msg">
                                Delete <strong>"{confirm.name}"</strong>?
                                {confirm.type === 'column' && ' All tasks will be removed.'}
                            </p>
                            <div className="confirm-actions">
                                <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancel</button>
                                <button
                                    className="btn btn--primary" onClick={doConfirm}
                                    id="confirm-del"
                                    style={{ background: 'var(--red)', borderColor: 'var(--red)', boxShadow: 'none' }}
                                >Delete</button>
                            </div>
                        </div>
                        <div style={{ height: 16 }} />
                    </div>
                </div>
            )}
        </>
    );
}
