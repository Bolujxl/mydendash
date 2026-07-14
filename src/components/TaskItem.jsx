import { getRelativeTime } from '../utils/time'
import '../styles/Tasks.css'

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`task-item ${task.done ? 'done' : ''}`}>
      <label className="task-checkbox-label">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />
        <span className="task-checkmark" />
      </label>
      <div className="task-content">
        <span className="task-text">{task.text}</span>
        {task.note && <span className="task-note">{task.note}</span>}
        <span className="task-time">Added {getRelativeTime(task.createdAt)}</span>
      </div>
      <button
        className="task-delete"
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
      >
        ×
      </button>
    </div>
  )
}

export default TaskItem