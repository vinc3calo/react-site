export function saveProgress(mission) {
  fetch('http://localhost:5000/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mission)
  });
}

export async function getDashboard() {
  const res = await fetch('http://localhost:5000/api/dashboard');
  return res.json();
}