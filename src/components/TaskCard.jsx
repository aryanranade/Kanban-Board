import { useState } from 'react';

const LABEL_META = {
    feature: { name: 'Feature', color: 'purple' },
    bug: { name: 'Bug', color: 'red' },
    design: { name: 'Design', color: 'pink' },
    docs: { name: 'Docs', color: 'blue' },
    devops: { name: 'DevOps', color: 'cyan' },
    research: { name: 'Research', color: 'teal' },
    review: { name: 'Review', color: 'yellow' },
    backend: { name: 'Backend', color: 'orange' },
    frontend: { name: 'Frontend', color: 'green' },
};

export default function TaskCard({ task, columnId, onEdit }) {
    const [dragging, setDragging] = useState(false);

    const relTime = (iso) => {
        const d = new Date(iso), now = new Date(), diff = now - d;
        if (diff < 60000) return 'now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const fmtDue = (s) => {
        if (!s) return null;
        const d = new Date(s + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const isOverdue = (s) => s && new Date(s + 'T23:59:59') < new Date();

    const labels = task.labels || [];
    const subtasks = task.subtasks || [];
    const doneCount = subtasks.filter(s => s.done).length;
    const total = subtasks.length;
    const over = isOverdue(task.dueDate);

    return (
        <div
            className={`task-card${dragging ? ' task-card--dragging' : ''}`}
            draggable
            onDragStart={e => {
                setDragging(true);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('application/json', JSON.stringify({ taskId: task.id, sourceColId: columnId }));
            }}
            onDragEnd={() => setDragging(false)}
            onClick={() => onEdit(task)}
            id={`task-${task.id}`}
        >
            <div className={`task-card__strip task-card__strip--${task.priority}`} />
            <div className="task-card__inner">
                {labels.length > 0 && (
                    <div className="task-card__labels">
                        {labels.map(id => {
                            const m = LABEL_META[id];
                            return m ? <span key={id} className={`task-label task-label--${m.color}`}>{m.name}</span> : null;
                        })}
                    </div>
                )}
                <div className="task-card__title">{task.title}</div>
                {task.description && <div className="task-card__desc">{task.description}</div>}
                {total > 0 && (
                    <div className="task-card__sub">
                        <div className="task-card__sub-hd">
                            <span className="task-card__sub-lbl">Subtasks</span>
                            <span className="task-card__sub-lbl">{doneCount}/{total}</span>
                        </div>
                        <div className="task-card__sub-bar">
                            <div className="task-card__sub-fill" style={{ width: `${(doneCount / total) * 100}%` }} />
                        </div>
                    </div>
                )}
                <div className="task-card__foot">
                    <div className="task-card__foot-l">
                        <span className={`task-card__pri task-card__pri--${task.priority}`}>{task.priority}</span>
                    </div>
                    <div className="task-card__foot-r">
                        {task.dueDate && (
                            <span className={`task-card__due${over ? ' task-card__due--over' : ''}`}>
                                {over ? '⚠' : '📅'} {fmtDue(task.dueDate)}
                            </span>
                        )}
                        <span className="task-card__date">{relTime(task.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
