export async function fetchInspect(id) {
  const r = await fetch(`/api/inspect?id=${id}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
