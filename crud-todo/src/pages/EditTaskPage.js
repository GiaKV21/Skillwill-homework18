// src/pages/EditTaskPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskById, updateTask } from "../api";

function EditTaskPage() {
  const { id } = useParams(); // _uuid from URL
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignee, setAssignee] = useState("");
  const [details, setDetails] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTask = async () => {
      try {
        setLoading(true);
        setError("");
        const task = await getTaskById(id);
        if (!task) {
          setError("Task not found");
          return;
        }
        setName(task.name || "");
        setDeadline(task.deadline || "");
        setAssignee(task.assignee || "");
        setDetails(task.details || "");
        setIsCompleted(!!task.isCompleted);
      } catch (err) {
        setError(err.message || "Failed to load task");
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await updateTask(id, {
        name: trimmedName,
        isCompleted,
        deadline,
        assignee,
        details,
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="info">Loading task...</p>;
  if (error && !saving && !loading)
    return (
      <div>
        <p className="error">{error}</p>
      </div>
    );

  return (
    <div>
      <h2>Edit Task</h2>

      {error && <p className="error">{error}</p>}
      {saving && <p className="info">Saving...</p>}

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
          Completed
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
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

        <button type="submit" disabled={saving}>
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditTaskPage;
