// adminTokenRefresher.js
// ملف مشترك لتجديد التوكن تلقائياً كل 50 دقيقة لجميع صفحات الأدمن

const ADMIN_REFRESH_INTERVAL_MINUTES = 1;
const API_REFRESH_URL = "https://almanassik-alarabi-server-v-01.onrender.com/api/admin/token/refresh-token";

function getAdminTokens() {
  return {
    access_token: localStorage.getItem("umrah_admin_token"),
    refresh_token: localStorage.getItem("admin_refresh_token")
  };
}

function setAdminTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem("umrah_admin_token", access_token);
  if (refresh_token) localStorage.setItem("admin_refresh_token", refresh_token);
}

async function refreshAdminToken() {
  const { access_token, refresh_token } = getAdminTokens();
  if (!access_token || !refresh_token) return;
  try {
    console.log("[Token Refresher] محاولة تجديد التوكن...", { access_token, refresh_token });
    const res = await fetch(API_REFRESH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: access_token, refresh_token })
    });
    console.log("[Token Refresher] status:", res.status);
    let data = {};
    try {
      data = await res.json();
    } catch(jsonErr) {
      console.log("[Token Refresher] خطأ في قراءة JSON:", jsonErr);
    }
    console.log("[Token Refresher] response data:", data);
    if (res.ok && data.access_token && data.refresh_token) {
      setAdminTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
    } else {
    }
  } catch (err) {
  }
}

// بدء المؤقت عند تحميل الملف
setInterval(refreshAdminToken, 50 * 60 * 1000); // كل 50 دقيقة

// يمكن استدعاء التجديد يدوياً عند الحاجة
window.refreshAdminToken = refreshAdminToken;
// طباعة التوكن الحالي كل 3 ثواني لمراقبة تغيّره

