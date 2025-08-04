// جلب فروع الوكالة الحالية (حسب التوكن)
export async function fetchAgencyBranches(token) {
  const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/agency/branches', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.branches) ? data.branches : [];
}
