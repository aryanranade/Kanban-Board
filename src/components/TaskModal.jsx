import { useState, useEffect, useRef } from 'react';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const LABELS = [
    { id: 'feature', name: 'Feature', color: 'purple' },
    { id: 'bug', name: 'Bug', color: 'red' },
    { id: 'design', name: 'Design', color: 'pink' },
    { id: 'docs', name: 'Docs', color: 'blue' },
    { id: 'devops', name: 'DevOps', color: 'cyan' },
    { id: 'research', name: 'Research', color: 'teal' },
    { id: 'review', name: 'Review', color: 'yellow' },
    { id: 'backend', name: 'Backend', color: 'orange' },
    { id: 'frontend', name: 'Frontend', color: 'green' },
];

const genId = () => `st-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export default function TaskModal({ task, onSave, onDelete, onClose, columns, defaultColumnId }) {
    const isEdit = !!task?.id;

    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState(task?.priority || 'medium');
    const [dueDate, setDueDate] = useState(task?.dueDate || '');
    const [subtasks, setSubtasks] = useState(task?.subtasks || []);
    const [newSubtask, setNewSubtask] = useState('');
    const [selectedLabels, setSelectedLabels] = useState(task?.labels || []);
    const [columnId, setColumnId] = useState(defaultColumnId || columns?.[0]?.id || '');

    const titleRef = useRef(null);

    useEffect(() => {
        titleRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSave({
            ...(task || {}),
            title: title.trim(),
            description: description.trim(),
            priority, dueDate, subtasks,
            labels: selectedLabels,
            columnId: isEdit ? undefined : columnId,
        });
    };

    const addSubtask = () => {
        const t = newSubtask.trim();
        if (!t) return;
        setSubtasks(prev => [...prev, { id: genId(), text: t, done: false }]);
        setNewSubtask('');
    };

    const toggleLabel = (id) =>
        setSelectedLabels(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);

    const currentColumnTitle = columns?.find(c => c.id === (task?.columnId || columnId))?.title;
    const doneSt = subtasks.filter(s => s.done).length;

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} id="modal-overlay">
            <form className="modal" onSubmit={handleSubmit} id="task-modal" onClick={(e) => e.stopPropagation()}>

                {/* ---- HEAD ---- */}
                <div className="modal__head">
                    <h2 className="modal__head-title">{isEdit ? 'Edit task' : 'New task'}</h2>
                    {currentColumnTitle && (
                        <p className="modal__head-sub">In "{currentColumnTitle}"</p>
                    )}
                    <button type="button" className="modal__close-abs" onClick={onClose} aria-label="Close" id="modal-close">✕</button>
                </div>

                {/* ---- BODY ---- */}
                <div className="modal__body">

                    {/* Column picker (new task only, when multiple columns exist) */}
                    {!isEdit && columns?.length > 1 && (
                        <div className="field">
                            <label className="field__label" htmlFor="tc-col">Column</label>
                            <select
                                id="tc-col"
                                className="field__select"
                                value={columnId}
                                onChange={e => setColumnId(e.target.value)}
                            >
                                {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Title */}
                    <div className="field">
                        <label className="field__label" htmlFor="tc-title">Title</label>
                        <input
                            ref={titleRef} id="tc-title" required
                            className="field__input"
                            value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                        />
                    </div>

                    {/* Description */}
                    <div className="field">
                        <label className="field__label" htmlFor="tc-desc">Description</label>
                        <textarea
                            id="tc-desc" className="field__textarea"
                            value={description} onChange={e => setDescription(e.target.value)}
                            placeholder="Add some details…"
                        />
                    </div>

                    {/* Priority */}
                    <div className="field">
                        <span className="field__label">Priority</span>
                        <div className="priority-row">
                            {PRIORITIES.map(p => (
                                <button
                                    key={p} type="button"
                                    className={`pri-btn pri-btn--${p}${priority === p ? ' pri-btn--active' : ''}`}
                                    onClick={() => setPriority(p)}
                                    id={`p-${p}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Due date */}
                    <div className="field">
                        <label className="field__label" htmlFor="tc-due">Due Date</label>
                        <input
                            type="date" id="tc-due"
                            className="field__input"
                            value={dueDate} onChange={e => setDueDate(e.target.value)}
                        />
                    </div>

                    {/* Labels */}
                    <div className="field">
                        <span className="field__label">Labels</span>
                        <div className="label-pills">
                            {LABELS.map(l => (
                                <button
                                    key={l.id} type="button"
                                    className={`lpill lpill--${l.color}${selectedLabels.includes(l.id) ? ' lpill--on' : ''}`}
                                    onClick={() => toggleLabel(l.id)}
                                    id={`lbl-${l.id}`}
                                >
                                    {l.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subtasks */}
                    <div className="field">
                        <span className="field__label">
                            Subtasks {subtasks.length > 0 && `(${doneSt}/${subtasks.length})`}
                        </span>
                        {subtasks.length > 0 && (
                            <ul className="subtask-list">
                                {subtasks.map(st => (
                                    <li key={st.id} className="subtask-item">
                                        <label className="subtask-item__lbl">
                                            <input
                                                type="checkbox" className="subtask-item__cb"
                                                checked={st.done}
                                                onChange={() =>
                                                    setSubtasks(prev =>
                                                        prev.map(s => s.id === st.id ? { ...s, done: !s.done } : s)
                                                    )
                                                }
                                            />
                                            <span className={`subtask-item__txt${st.done ? ' subtask-item__txt--done' : ''}`}>
                                                {st.text}
                                            </span>
                                        </label>
                                        <button
                                            type="button" className="subtask-item__del"
                                            onClick={() => setSubtasks(prev => prev.filter(s => s.id !== st.id))}
                                            aria-label="Remove"
                                        >✕</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="subtask-add-row">
                            <input
                                type="text" className="field__input"
                                placeholder="Add a subtask…"
                                value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
                                id="st-input"
                            />
                            <button type="button" className="subtask-add-plus" onClick={addSubtask} id="st-add">+</button>
                        </div>
                    </div>
                </div>

                {/* ---- FOOTER ---- */}
                <div className="modal__foot">
                    {/* Cancel row (small, only visible for spacing) */}
                    <div className="modal__foot-top">
                        <button type="button" className="modal-cancel-inline" onClick={onClose}>Cancel</button>
                    </div>

                    {/* Big primary save */}
                    {isEdit ? (
                        <button type="submit" className="modal-save-btn" id="save-btn">
                            Save changes
                        </button>
                    ) : (
                        <button type="submit" className="modal-new-save-btn" id="save-btn">
                            Create task
                        </button>
                    )}

                    {/* Big delete (edit only) */}
                    {isEdit && (
                        <button
                            type="button" className="modal-del-btn"
                            onClick={() => onDelete(task.id)} id="del-btn"
                        >
                            Delete task
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
