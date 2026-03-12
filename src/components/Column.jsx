import { useState, useRef } from 'react';
import TaskCard from './TaskCard';

const P_WT = { urgent: 4, high: 3, medium: 2, low: 1 };
const COL_VARS = ['--col0', '--col1', '--col2', '--col3', '--col4', '--col5', '--col6', '--col7', '--col8'];

export default function Column({
    column, tasks, isDefault,
    onAddTask, onEditTask, onDeleteColumn,
    onUpdateTitle, onMoveTask,
    searchQuery, sortOrder, columnIndex = 0,
}) {
    const [isDragOver, setIsDragOver] = useState(false);
    const dragCounter = useRef(0);

    /* ---- Filter & sort ---- */
    let ids = column.taskIds.filter(id => {
        if (!searchQuery) return true;
        const t = tasks[id];
        if (!t) return false;
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) ||
            (t.description?.toLowerCase().includes(q)) ||
            t.priority.toLowerCase().includes(q);
    });
    ids = [...ids].sort((a, b) => {
        const ta = tasks[a], tb = tasks[b];
        if (!ta || !tb) return 0;
        if (sortOrder === 'newest') return new Date(tb.createdAt) - new Date(ta.createdAt);
        if (sortOrder === 'oldest') return new Date(ta.createdAt) - new Date(tb.createdAt);
        if (sortOrder === 'priority') return (P_WT[tb.priority] || 0) - (P_WT[ta.priority] || 0);
        if (sortOrder === 'duedate') {
            if (!ta.dueDate && !tb.dueDate) return 0;
            if (!ta.dueDate) return 1;
            if (!tb.dueDate) return -1;
            return new Date(ta.dueDate) - new Date(tb.dueDate);
        }
        return 0;
    });

    /* ---- Drag-n-drop ---- */
    const onDragEnter = e => { e.preventDefault(); dragCounter.current++; setIsDragOver(true); };
    const onDragLeave = () => { dragCounter.current--; if (dragCounter.current === 0) setIsDragOver(false); };
    const onDragOver = e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
    const onDrop = e => {
        e.preventDefault(); dragCounter.current = 0; setIsDragOver(false);
        try {
            const { taskId, sourceColId } = JSON.parse(e.dataTransfer.getData('application/json'));
            const cards = Array.from(e.currentTarget.querySelectorAll('.task-card'));
            let dest = ids.length;
            for (let i = 0; i < cards.length; i++) {
                const r = cards[i].getBoundingClientRect();
                if (e.clientY < r.top + r.height / 2) { dest = i; break; }
            }
            onMoveTask(taskId, sourceColId, column.id, dest);
        } catch { }
    };

    const accentVar = COL_VARS[columnIndex % COL_VARS.length];
    const fillPct = column.taskIds.length > 0
        ? Math.min((ids.length / column.taskIds.length) * 100, 100)
        : 0;

    return (
        <div
            className={`column${isDragOver ? ' column--drag-over' : ''}`}
            onDragEnter={onDragEnter} onDragLeave={onDragLeave}
            onDragOver={onDragOver} onDrop={onDrop}
            id={`col-${column.id}`}
        >
            {/* Header */}
            <div className="column__header">
                <div className="column__header-left">
                    <span className="column__count">{ids.length}</span>
                    <input
                        className="column__title"
                        defaultValue={column.title}
                        onBlur={e => {
                            const v = e.target.value.trim();
                            if (v && v !== column.title) onUpdateTitle(column.id, v);
                            else e.target.value = column.title;
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                        aria-label={`Column: ${column.title}`}
                    />
                </div>
                <div className="column__header-right">
                    {!isDefault && (
                        <button
                            className="btn btn--icon btn--ghost column__del-btn"
                            onClick={() => onDeleteColumn(column.id)}
                            aria-label="Delete column" title="Delete column"
                        >✕</button>
                    )}
                    <button
                        className="column__add-icon"
                        onClick={() => onAddTask(column.id)}
                        aria-label="Add task" title="Add task"
                    >+</button>
                </div>
            </div>

            {/* Color stripe */}
            <div
                className="column__stripe"
                style={{ '--accent-col': `var(${accentVar})`, '--fill': `${fillPct}%` }}
            />

            {/* Tasks */}
            <div className="column__body">
                {ids.length === 0 ? (
                    <div className="column__empty">
                        <span className="column__empty-icon">⬡</span>
                        {searchQuery ? 'No matches' : 'Drop tasks here'}
                    </div>
                ) : (
                    ids.map(id => {
                        const task = tasks[id];
                        if (!task) return null;
                        return <TaskCard key={id} task={task} columnId={column.id} onEdit={onEditTask} />;
                    })
                )}
            </div>

            {/* Footer */}
            <div className="column__footer">
                <button className="column__add-btn" onClick={() => onAddTask(column.id)} id={`add-${column.id}`}>
                    <span>＋</span> Add Task
                </button>
            </div>
        </div>
    );
}
