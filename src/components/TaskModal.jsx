import { useState, useEffect, useRef } from 'react';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function TaskModal({ task, onSave, onDelete, onClose }) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState(task?.priority || 'medium');
    const titleRef = useRef(null);

    const isEditing = !!task?.id;

    useEffect(() => {
        titleRef.current?.focus();
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSave({
            ...(task || {}),
            title: title.trim(),
            description: description.trim(),
            priority,
        });
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick} id="task-modal-overlay">
            <div className="modal" role="dialog" aria-modal="true" id="task-modal">
                <div className="modal__header">
                    <h2 className="modal__title">{isEditing ? 'Edit Task' : 'New Task'}</h2>
                    <button className="modal__close" onClick={onClose} aria-label="Close" id="modal-close-btn">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal__body">
                        <div className="form-group">
                            <label className="form-group__label" htmlFor="task-title-input">Title</label>
                            <input
                                ref={titleRef}
                                id="task-title-input"
                                className="form-group__input"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter task title…"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-group__label" htmlFor="task-desc-input">Description</label>
                            <textarea
                                id="task-desc-input"
                                className="form-group__textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description…"
                            />
                        </div>

                        <div className="form-group">
                            <span className="form-group__label">Priority</span>
                            <div className="priority-options">
                                {PRIORITIES.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        className={`priority-option priority-option--${p}${priority === p ? ' priority-option--active' : ''}`}
                                        onClick={() => setPriority(p)}
                                        id={`priority-${p}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal__footer">
                        <div>
                            {isEditing && (
                                <button
                                    type="button"
                                    className="btn btn--danger btn--sm"
                                    onClick={() => onDelete(task.id)}
                                    id="delete-task-btn"
                                >
                                    🗑 Delete
                                </button>
                            )}
                        </div>
                        <div className="modal__footer-right">
                            <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn--primary btn--sm" id="save-task-btn">
                                {isEditing ? 'Save Changes' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
