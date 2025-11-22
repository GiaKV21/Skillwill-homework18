import React, { useEffect, useState } from "react";
import "./App.css";

const API_KEY = "YOUR_REAL_CRUDAPI_KEY_HERE"; // <<< IMPORTANT
const DATA_TYPE = "todo"; // <<< or "tasks", but be consistent
const BASE_URL = `https://crudapi.co.uk/api/v1/${DATA_TYPE}`;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===== FETCH TASKS =====
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(BASE_URL, { headers });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("Fetch tasks error:", res.status, data);
          throw new Error(data.message || data.error || `Status ${res.status}`);
        }

        setTasks(data.items || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load tasks: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // ===== CREATE TASK =====
  const handleAddTask = async (e) => {
    e.preventDefault();
    const name = newTaskName.trim();
    if (!name) return;

    try {
      setLoading(true);
      setError("");

      const body = JSON.stringify([{ name, isCompleted: false }]);

      const res = await fetch(BASE_URL, {
        method: "POST",
        headers,
        body,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error("Create task error:", res.status, data);
        throw new Error(data.message || data.error || `Status ${res.status}`);
      }

      const created = data.items || [];
      setTasks((prev) => [...prev, ...created]);
      setNewTaskName("");
    } catch (err) {
      console.error(err);
      setError("Failed to create task: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== UPDATE TASK =====
  const updateTask = async (uuid, updates) => {
    try {
      setLoading(true);
      setError("");

      const body = JSON.stringify([{ _uuid: uuid, ...updates }]);

      const res = await fetch(BASE_URL, {
        method: "PUT",
        headers,
        body,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Update task error:", res.status, data);
        throw new Error(data.message || data.error || `Status ${res.status}`);
      }

      const updatedItems = data.items || [];

      setTasks((prev) =>
        prev.map(
          (task) => updatedItems.find((u) => u._uuid === task._uuid) || task
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update task: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompleted = (task) => {
    updateTask(task._uuid, { isCompleted: !task.isCompleted });
  };

  const handleEditTask = (task) => {
    const newName = prompt("Edit task name:", task.name || "");
    if (!newName || !newName.trim()) return;
    updateTask(task._uuid, { name: newName.trim() });
  };

  // ===== DELETE TASK =====
  const handleDeleteTask = async (uuid) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      setLoading(true);
      setError("");

      const body = JSON.stringify([{ _uuid: uuid }]);

      const res = await fetch(BASE_URL, {
        method: "DELETE",
        headers,
        body,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Delete task error:", res.status, data);
        throw new Error(data.message || data.error || `Status ${res.status}`);
      }

      setTasks((prev) => prev.filter((t) => t._uuid !== uuid));
    } catch (err) {
      console.error(err);
      setError("Failed to delete task: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>TODOs (crudapi.co.uk)</h1>

      <form className="task-form" onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {loading && <p className="info">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._uuid} className="task-item">
            <div className="task-left">
              <input
                type="checkbox"
                checked={!!task.isCompleted}
                onChange={() => handleToggleCompleted(task)}
              />
              <span
                className={
                  "task-name" + (task.isCompleted ? " task-completed" : "")
                }
              >
                {task.name || "(no name)"}
              </span>
            </div>
            <div className="task-actions">
              <button onClick={() => handleEditTask(task)}>Edit</button>
              <button onClick={() => handleDeleteTask(task)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {!loading && tasks.length === 0 && !error && (
        <p className="info">No tasks yet. Add your first one! 🎯</p>
      )}
    </div>
  );
}

export default App;
