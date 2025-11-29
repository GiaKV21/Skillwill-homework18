// src/pages/TaskListPage.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks, deleteTask, updateTask } from "../api";

function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const items = await getTasks();
      setTasks(items);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleDelete = async (uuid) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      setLoading(true);
      setError("");
      await deleteTask(uuid);
      setTasks((prev) => prev.filter((t) => t._uuid !== uuid));
    } catch (err) {
      setError(err.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompleted = async (task) => {
    try {
      setLoading(true);
      setError("");
      const updated = await updateTask(task._uuid, {
        isCompleted: !task.isCompleted,
      });
      setTasks((prev) =>
        prev.map((t) => (t._uuid === updated._uuid ? updated : t))
      );
    } catch (err) {
      setError(err.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>All Tasks</h2>

      {loading && <p className="info">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {tasks.length === 0 && !loading && (
        <p className="info">No tasks yet. Add one!</p>
      )}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._uuid} className="task-item">
            <div className="task-left">
              <input
                type="checkbox"
                checked={!!task.isCompleted}
                onChange={() => handleToggleCompleted(task)}
              />
              <div>
                <div
                  className={
                    "task-name" + (task.isCompleted ? " task-completed" : "")
                  }
                >
                  {task.name}
                </div>
                <div className="task-meta">
                  <span>Deadline: {task.deadline || "—"}</span>
                  <span>Assignee: {task.assignee || "—"}</span>
                </div>
                {task.details && (
                  <div className="task-details">Notes: {task.details}</div>
                )}
              </div>
            </div>
            <div className="task-actions">
              <Link to={`/edit/${task._uuid}`}>Edit</Link>
              <button onClick={() => handleDelete(task._uuid)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskListPage;
