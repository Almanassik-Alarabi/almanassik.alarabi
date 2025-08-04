
// js/sidebar.js
// يعتمد فقط على languageSwitcher.js

function initSidebar() {
  if (window.languageSwitcher && typeof window.languageSwitcher.refreshLanguage === 'function') {
    window.languageSwitcher.refreshLanguage();
  }
}

// يمكن استدعاء initSidebar بعد تحميل الشريط الجانبي ديناميكياً
