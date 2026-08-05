const API_ROOT = `${import.meta.env.VITE_API_URL || ""}/api`;

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur API (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function register(email, password) {
  const res = await fetch(`${API_ROOT}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res);
}

export async function login(email, password) {
  const res = await fetch(`${API_ROOT}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res);
}

export async function fetchHistory() {
  const res = await fetch(`${API_ROOT}/checklists`, {
    headers: { ...authHeaders() },
  });
  return handle(res);
}

export async function getChecklist(id) {
  const res = await fetch(`${API_ROOT}/checklists/${id}`, {
    headers: { ...authHeaders() },
  });
  return handle(res);
}

export async function saveChecklist(payload) {
  const res = await fetch(`${API_ROOT}/checklists`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deleteChecklist(id) {
  const res = await fetch(`${API_ROOT}/checklists/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handle(res);
}
