// src/pages/NewTaskPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask } from "../api";

function NewTaskPage() {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignee, setAssignee] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createTask({
        name: trimmedName,
        isCompleted: false,
        deadline,
        assignee,
        details,
      });

      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add New Task</h2>

      {error && <p className="error">{error}</p>}
      {loading && <p className="info">Saving...</p>}

      <form className="task-form" onSubmit={handleSubmit}>
        <label>
          Task name *
          <input
            type="text"
            placeholder="Task name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          Deadline
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <label>
          Assignee (full name)
          <input
            type="text"
            placeholder="John Smith"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
        </label>

        <label>
          Details / notes
          <textarea
            placeholder="Additional info..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          Create Task
        </button>
      </form>
    </div>
  );
}

export default NewTaskPage;
