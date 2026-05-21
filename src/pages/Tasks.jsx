import { useState, useEffect } from 'react'
import { ClipboardList, CheckCircle2, ListTodo } from 'lucide-react'
import TaskItem from '../components/TaskItem'
import ProgressBar from '../components/ProgressBar'
import '../styles/Tasks.css'

const STORAGE_KEY = 'devdash_tasks'

function Tasks() {
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [taskText, setTaskText] = useState('')
  const [taskNote, setTaskNote] = useState('')
  const [filterTab, setFilterTab] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!taskText.trim()) return

    const task = {
      id: Date.now(),
      text: taskText.trim(),
      note: taskNote.trim() || null,
      done: false,
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [task, ...prev])
    setTaskText('')
    setTaskNote('')
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAddTask(e)
    }
  }

  const handleToggle = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : null }
          : t
      )
    )
  }

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const filteredTasks = tasks.filter((task) => {
    if (filterTab === 'active') return !task.done
    if (filterTab === 'completed') return task.done
    return true
  })

  const doneCount = tasks.filter((t) => t.done).length
  const activeCount = tasks.filter((t) => !t.done).length
  const allCount = tasks.length

  return (
    <div className="tasks-page">
      <h1 className="page-title">
        <ClipboardList size={22} className="page-title-icon" />
        Task Manager
      </h1>

      <form className="task-entry-card" onSubmit={handleAddTask} onKeyDown={handleKeyDown}>
        <input
          type="text"
          className="task-entry-title"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="What do you need to get done?"
          autoFocus
        />
        <input
          type="text"
          className="task-entry-note"
          value={taskNote}
          onChange={(e) => setTaskNote(e.target.value.slice(0, 120))}
          placeholder="Add a short note (optional)"
          maxLength={120}
        />
        <div className="task-entry-footer">
          <span className="task-entry-hint">Ctrl + Enter to submit</span>
          <button
            type="submit"
            className="task-add-btn"
            disabled={!taskText.trim()}
          >
            Add Task
          </button>
        </div>
      </form>

      {allCount > 0 && <ProgressBar done={doneCount} total={allCount} />}

      <div className="task-filters">
        {[
          { key: 'all', label: 'All', count: allCount },
          { key: 'active', label: 'Active', count: activeCount },
          { key: 'completed', label: 'Completed', count: doneCount },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`filter-btn ${filterTab === tab.key ? 'active' : ''}`}
            onClick={() => setFilterTab(tab.key)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="task-empty">
            {filterTab === 'all' && (
              <>
                <ListTodo size={40} className="empty-icon" />
                <p>No tasks yet. Add one above!</p>
              </>
            )}
            {filterTab === 'active' && (
              <>
                <CheckCircle2 size={40} className="empty-icon" />
                <p>No active tasks. Great job!</p>
              </>
            )}
            {filterTab === 'completed' && (
              <>
                <ClipboardList size={40} className="empty-icon" />
                <p>No completed tasks yet.</p>
              </>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Tasks