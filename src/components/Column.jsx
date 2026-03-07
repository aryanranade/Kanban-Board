import { useState, useRef } from 'react';
import TaskCard from './TaskCard';

export default function Column({
    column,
    tasks,
    isDefault,
    onAddTask,
    onEditTask,
    onDeleteColumn,
    onUpdateTitle,
    onMoveTask,
    searchQuery,
}) {
    const [isDragOver, setIsDragOver] = useState(false);
    const dragCounter = useRef(0);

    // Filter tasks by search query
    const filteredTaskIds = column.taskIds.filter((id) => {
        if (!searchQuery) return true;
        const task = tasks[id];
        if (!task) return false;
        const q = searchQuery.toLowerCase();
        return (
            task.title.toLowerCase().includes(q) ||
            (task.description && task.description.toLowerCase().includes(q)) ||
            task.priority.toLowerCase().includes(q)
        );
    });

    const handleDragEnter = (e) => {
        e.preventDefault();
        dragCounter.current++;
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragOver(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragOver(false);

        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            const { taskId, sourceColId } = data;

            // Determine drop index based on mouse position
            const columnBody = e.currentTarget.querySelector('.column__body');
            const cards = columnBody ? Array.from(columnBody.querySelectorAll('.task-card')) : [];
            let destIndex = filteredTaskIds.length;

            for (let i = 0; i < cards.length; i++) {
                const rect = cards[i].getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                if (e.clientY < midY) {
                    destIndex = i;
                    break;
                }
            }

            onMoveTask(taskId, sourceColId, column.id, destIndex);
        } catch (err) {
            console.warn('Drop failed:', err);
        }
    };

    const handleTitleBlur = (e) => {
        const newTitle = e.target.value.trim();
        if (newTitle && newTitle !== column.title) {
            onUpdateTitle(column.id, newTitle);
        } else {
            e.target.value = column.title;
        }
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') e.target.blur();
    };

    return (
        <div
            className={`column${isDragOver ? ' column--drag-over' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            id={`column-${column.id}`}
        >
            <div className="column__header">
                <div className="column__header-left">
                    <span className="column__count">{filteredTaskIds.length}</span>
                    <input
                        className="column__title"
                        defaultValue={column.title}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleTitleKeyDown}
                        aria-label={`Column title: ${column.title}`}
                    />
                </div>
                {!isDefault && (
                    <button
                        className="btn btn--icon btn--ghost column__delete-btn"
                        onClick={() => onDeleteColumn(column.id)}
                        aria-label="Delete column"
                        title="Delete column"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="column__body">
                {filteredTaskIds.length === 0 ? (
                    <div className="column__empty">
                        {searchQuery ? 'No matching tasks' : 'Drop tasks here'}
                    </div>
                ) : (
                    filteredTaskIds.map((taskId) => {
                        const task = tasks[taskId];
                        if (!task) return null;
                        return (
                            <TaskCard
                                key={taskId}
                                task={task}
                                columnId={column.id}
                                onEdit={onEditTask}
                            />
                        );
                    })
                )}
            </div>

            <div className="column__footer">
                <button
                    className="column__add-btn"
                    onClick={() => onAddTask(column.id)}
                    id={`add-task-${column.id}`}
                >
                    <span>＋</span> Add Task
                </button>
            </div>
        </div>
    );
}
