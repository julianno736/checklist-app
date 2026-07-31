const BASE = "/api/checklists";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur API (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(BASE);
  return handle(res);
}

export async function saveChecklist(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deleteChecklist(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return handle(res);
}
