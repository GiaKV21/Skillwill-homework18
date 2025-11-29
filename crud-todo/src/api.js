// src/api.js
const API_KEY = "YOUR_CRUDAPI_KEY_HERE"; // put your real key
const DATA_TYPE = "tasks"; // your collection name in crudapi
const BASE_URL = `https://crudapi.co.uk/api/v1/${DATA_TYPE}`;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_KEY}`,
};

export async function getTasks() {
  const res = await fetch(BASE_URL, { headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to load tasks");
  }
  return data.items || [];
}

// taskData: { name, isCompleted, deadline, assignee, details }
export async function createTask(taskData) {
  const body = JSON.stringify([taskData]); // crudapi expects an array

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers,
    body,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to create task");
  }

  return data.items?.[0]; // return the created item
}

export async function updateTask(uuid, updates) {
  const body = JSON.stringify([{ _uuid: uuid, ...updates }]);

  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers,
    body,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to update task");
  }

  return data.items?.[0];
}

export async function deleteTask(uuid) {
  const body = JSON.stringify([{ _uuid: uuid }]);

  const res = await fetch(BASE_URL, {
    method: "DELETE",
    headers,
    body,
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || data.error || "Failed to delete task");
  }
}

// Simple helper to get one task by id (loads all and finds it)
export async function getTaskById(uuid) {
  const items = await getTasks();
  return items.find((t) => t._uuid === uuid);
}
