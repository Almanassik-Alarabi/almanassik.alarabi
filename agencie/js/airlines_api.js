// جلب شركات الطيران
export async function fetchAirlines() {
  const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/airlines');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.airlines) ? data.airlines : [];
}
