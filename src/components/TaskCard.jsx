import { useState } from 'react';

export default function TaskCard({ task, columnId, onEdit, onDragStart, onDragEnd }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e) => {
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData(
            'application/json',
            JSON.stringify({ taskId: task.id, sourceColId: columnId })
        );
        onDragStart && onDragStart(task.id);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        onDragEnd && onDragEnd();
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div
            className={`task-card${isDragging ? ' task-card--dragging' : ''}`}
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => onEdit(task)}
            id={`task-${task.id}`}
        >
            <div className={`task-card__priority-bar task-card__priority-bar--${task.priority}`} />
            <div className="task-card__title">{task.title}</div>
            {task.description && (
                <div className="task-card__desc">{task.description}</div>
            )}
            <div className="task-card__meta">
                <span className={`task-card__priority-badge task-card__priority-badge--${task.priority}`}>
                    {task.priority}
                </span>
                <span className="task-card__date">{formatDate(task.createdAt)}</span>
            </div>
        </div>
    );
}
