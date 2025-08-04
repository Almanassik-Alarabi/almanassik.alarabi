

// ملف مسؤول عن إدارة اللغة وتصديرها لباقي الصفحات
window.langTexts = window.langTexts || {
  ar: {
    platform: "منصة المناسك العربي",
    search: "ابحث...",
    lang: "FR",
    home: "الرئيسية",
    agency: "الوكالة",
    learn: "تعلم  عمرتك",
    contact: "اتصل بنا"
  },
  fr: {
    platform: "Plateforme des rites arabes",
    search: "Rechercher...",
    lang: "AR",
    home: "Accueil",
    agency: "Agence",
    learn: "Découvrir",
    contact: "Contact"
  }
};


function getCurrentLang() {
  return localStorage.getItem('lang') || 'ar';
}

function setLang(lang) {
  localStorage.setItem('lang', lang);
}

function toggleLanguage() {
  const currentLang = getCurrentLang();
  const newLang = currentLang === 'ar' ? 'fr' : 'ar';
  setLang(newLang);
  location.reload();
}

// تصدير النصوص والدوال للاستخدام في بقية الصفحات
window.getCurrentLang = getCurrentLang;
window.setLang = setLang;
window.toggleLanguage = toggleLanguage;
