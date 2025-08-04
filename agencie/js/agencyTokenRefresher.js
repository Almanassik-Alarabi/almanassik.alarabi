// agencyTokenRefresher.js
// ملف مشترك لتجديد التوكن تلقائياً كل 50 دقيقة لجميع صفحات الوكالة

const AGENCY_REFRESH_INTERVAL_MINUTES = 50;
const API_REFRESH_URL = "https://almanassik-alarabi-server-v-01.onrender.com/api/agency/token/refresh-token";

function getAgencyTokens() {
  return {
    access_token: localStorage.getItem("agency_token"),
    refresh_token: localStorage.getItem("agency_refresh_token")
  };
}

function setAgencyTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem("agency_token", access_token);
  if (refresh_token) localStorage.setItem("agency_refresh_token", refresh_token);
}

async function refreshAgencyToken() {
  const { access_token, refresh_token } = getAgencyTokens();
  if (!access_token || !refresh_token) return;
  try {
    const res = await fetch(API_REFRESH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: access_token, refresh_token })
    });
    let data = {};
    try {
      data = await res.json();
    } catch(jsonErr) {
    }
    if (res.ok && data.access_token && data.refresh_token) {
      setAgencyTokens({ access_token: data.access_token, refresh_token: data.refresh_token });
    } else {
      // يمكن إضافة معالجة للأخطاء هنا
    }
  } catch (err) {
    // يمكن إضافة معالجة للأخطاء هنا
  }
}

// بدء المؤقت عند تحميل الملف
setInterval(refreshAgencyToken, AGENCY_REFRESH_INTERVAL_MINUTES * 60 * 1000); // كل 50 دقيقة

// يمكن استدعاء التجديد يدوياً عند الحاجة
window.refreshAgencyToken = refreshAgencyToken;
