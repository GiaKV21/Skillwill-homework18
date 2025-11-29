// src/App.js
import React, { useEffect, useState, useContext } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";

/* ===================== CONFIG ===================== */
// TODO: put your real CRUD API key here
const API_KEY = "YOUR_REAL_CRUDAPI_KEY_HERE"; // <--- CHANGE THIS

// TODO: set to your collection name on crudapi.co.uk (e.g. "tasks" or "todo")
const DATA_TYPE = "tasks";

const BASE_URL = `/api/v1/${DATA_TYPE}`;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

/* ===================== TRANSLATIONS & CONTEXT ===================== */

const translations = {
  en: {
    appTitle: "TODO App (crudapi.co.uk)",
    navTasks: "Tasks",
    navAddTask: "Add Task",
    allTasks: "All Tasks",
    addNewTask: "Add New Task",
    editTask: "Edit Task",
    taskNameLabel: "Task name",
    taskNameRequired: "Task name *",
    nameRequiredError: "Name is required.",
    deadlineLabel: "Deadline",
    assigneeLabel: "Assignee (full name)",
    detailsLabel: "Details / notes",
    createTaskBtn: "Create Task",
    saveChangesBtn: "Save Changes",
    loading: "Loading...",
    saving: "Saving...",
    noTasks: "No tasks yet. Add one!",
    completedLabel: "Completed",
    deleteConfirm: "Delete this task?",
    deadlineMeta: "Deadline",
    assigneeMeta: "Assignee",
    notesPrefix: "Notes:",
  },
  ka: {
    appTitle: "თასქების აპლიკაცია (crudapi.co.uk)",
    navTasks: "თასქები",
    navAddTask: "ახალი თასქი",
    allTasks: "ყველა თასქი",
    addNewTask: "ახალი თასქის დამატება",
    editTask: "თასქის რედაქტირება",
    taskNameLabel: "თასქის სახელი",
    taskNameRequired: "თასქის სახელი *",
    nameRequiredError: "სახელის შეყვანა სავალდებულოა.",
    deadlineLabel: "ვადა",
    assigneeLabel: "შემსრულებლის სახელი და გვარი",
    detailsLabel: "დამატებითი ინფორმაცია",
    createTaskBtn: "თასქის შექმნა",
    saveChangesBtn: "ცვლილებების შენახვა",
    loading: "იტვირთება...",
    saving: "მონაცემების შენახვა...",
    noTasks: "ჯერ არცერთი თასქი არ გაქვს. დაამატე ახალი!",
    completedLabel: "დასრულებული",
    deleteConfirm: "წავშალო ეს თასქი?",
    deadlineMeta: "ვადა",
    assigneeMeta: "შემსრულებელი",
    notesPrefix: "შენიშვნები:",
  },
};

const LanguageContext = React.createContext(null);

function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  const value = { lang, setLang };
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  const { lang, setLang } = ctx;
  const t = (key) => (translations[lang] && translations[lang][key]) || key;
  return { t, lang, setLang };
}

/* ===================== API HELPERS ===================== */

async function apiGetTasks() {
  const res = await fetch(BASE_URL, { headers });
  const data = await res.json().catch(() => ({}));
  console.log("GET response:", res.status, data);

  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to load tasks");
  }
  return data.items || [];
}

// taskData: { name, isCompleted, deadline, assignee, details }
async function apiCreateTask(taskData) {
  const body = JSON.stringify([taskData]);
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers,
    body,
  });
  const data = await res.json().catch(() => ({}));
  console.log("POST response:", res.status, data);

  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to create task");
  }
  return data.items?.[0];
}

async function apiUpdateTask(uuid, updates) {
  const body = JSON.stringify([{ _uuid: uuid, ...updates }]);
  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers,
    body,
  });
  const data = await res.json().catch(() => ({}));
  console.log("PUT response:", res.status, data);

  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to update task");
  }
  return data.items?.[0];
}

async function apiDeleteTask(uuid) {
  const body = JSON.stringify([{ _uuid: uuid }]);
  const res = await fetch(BASE_URL, {
    method: "DELETE",
    headers,
    body,
  });
  const data = await res.json().catch(() => ({}));
  console.log("DELETE response:", res.status, data);

  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to delete task");
  }
}

async function apiGetTaskById(uuid) {
  const items = await apiGetTasks();
  return items.find((t) => t._uuid === uuid);
}

/* ===================== HEADER ===================== */

function Header() {
  const { t, lang, setLang } = useI18n();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        {/* Brand */}
        <div className="app-brand">
          <div className="app-logo">✓</div>
          <div className="app-title-block">
            <span className="app-name">TaskBoard</span>
            <span className="app-subtitle">{t("appTitle")}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="app-nav">
          <NavLink
            to="/"
            className={({ isActive }) =>
              "app-nav-link" + (isActive ? " app-nav-link-active" : "")
            }
          >
            {t("navTasks")}
          </NavLink>
          <NavLink
            to="/new"
            className={({ isActive }) =>
              "app-nav-link" + (isActive ? " app-nav-link-active" : "")
            }
          >
            {t("navAddTask")}
          </NavLink>
        </nav>

        {/* Language switch */}
        <div className="lang-switch-wrapper">
          <span className="lang-label">Lang</span>
          <div className="lang-switch">
            <button
              type="button"
              className={lang === "ka" ? "lang-btn active" : "lang-btn"}
              onClick={() => setLang("ka")}
            >
              KA
            </button>
            <button
              type="button"
              className={lang === "en" ? "lang-btn active" : "lang-btn"}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ===================== PAGES ===================== */

// List page
function TaskListPage() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const items = await apiGetTasks();
      setTasks(items);
    } catch (err) {
      console.error("loadTasks error:", err);
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleDelete = async (uuid) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      setLoading(true);
      setError("");
      await apiDeleteTask(uuid);
      setTasks((prev) => prev.filter((t) => t._uuid !== uuid));
    } catch (err) {
      console.error("delete error:", err);
      setError(err.message || "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompleted = async (task) => {
    try {
      setLoading(true);
      setError("");
      const updated = await apiUpdateTask(task._uuid, {
        isCompleted: !task.isCompleted,
      });
      setTasks((prev) =>
        prev.map((t) => (t._uuid === updated._uuid ? updated : t))
      );
    } catch (err) {
      console.error("toggle error:", err);
      setError(err.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{t("allTasks")}</h2>

      {loading && <p className="info">{t("loading")}</p>}
      {error && <p className="error">{error}</p>}

      {tasks.length === 0 && !loading && !error && (
        <p className="info">{t("noTasks")}</p>
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
                  <span>
                    {t("deadlineMeta")}: {task.deadline || "—"}
                  </span>
                  <span>
                    {t("assigneeMeta")}: {task.assignee || "—"}
                  </span>
                </div>
                {task.details && (
                  <div className="task-details">
                    {t("notesPrefix")} {task.details}
                  </div>
                )}
              </div>
            </div>
            <div className="task-actions">
              <Link to={`/edit/${task._uuid}`}>{t("editTask")}</Link>
              <button onClick={() => handleDelete(task._uuid)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// New task page
function NewTaskPage() {
  const { t } = useI18n();
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
      setError(t("nameRequiredError"));
      return;
    }

    try {
      setLoading(true);
      setError("");
      await apiCreateTask({
        name: trimmedName,
        isCompleted: false,
        deadline,
        assignee,
        details,
      });
      navigate("/");
    } catch (err) {
      console.error("create error:", err);
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{t("addNewTask")}</h2>

      {error && <p className="error">{error}</p>}
      {loading && <p className="info">{t("saving")}</p>}

      <form className="task-form" onSubmit={handleSubmit}>
        <label>
          {t("taskNameRequired")}
          <input
            type="text"
            placeholder={t("taskNameLabel")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          {t("deadlineLabel")}
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <label>
          {t("assigneeLabel")}
          <input
            type="text"
            placeholder="John Smith"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
        </label>

        <label>
          {t("detailsLabel")}
          <textarea
            placeholder={t("detailsLabel")}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {t("createTaskBtn")}
        </button>
      </form>
    </div>
  );
}

// Edit task page
function EditTaskPage() {
  const { t } = useI18n();
  const { id } = useParams(); // _uuid
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
        const task = await apiGetTaskById(id);
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
        console.error("load single task error:", err);
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
      setError(t("nameRequiredError"));
      return;
    }

    try {
      setSaving(true);
      setError("");
      await apiUpdateTask(id, {
        name: trimmedName,
        isCompleted,
        deadline,
        assignee,
        details,
      });
      navigate("/");
    } catch (err) {
      console.error("update error:", err);
      setError(err.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="info">{t("loading")}</p>;

  return (
    <div>
      <h2>{t("editTask")}</h2>

      {error && <p className="error">{error}</p>}
      {saving && <p className="info">{t("saving")}</p>}

      <form className="task-form" onSubmit={handleSubmit}>
        <label>
          {t("taskNameRequired")}
          <input
            type="text"
            placeholder={t("taskNameLabel")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label>
          {t("completedLabel")}
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
          />
        </label>

        <label>
          {t("deadlineLabel")}
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <label>
          {t("assigneeLabel")}
          <input
            type="text"
            placeholder="John Smith"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />
        </label>

        <label>
          {t("detailsLabel")}
          <textarea
            placeholder={t("detailsLabel")}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </label>

        <button type="submit" disabled={saving}>
          {t("saveChangesBtn")}
        </button>
      </form>
    </div>
  );
}

/* ===================== MAIN APP ===================== */

function App() {
  return (
    <LanguageProvider>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<TaskListPage />} />
            <Route path="/new" element={<NewTaskPage />} />
            <Route path="/edit/:id" element={<EditTaskPage />} />
          </Routes>
        </main>
      </div>
    </LanguageProvider>
  );
}

export default App;
