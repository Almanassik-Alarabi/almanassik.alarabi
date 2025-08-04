
// Update direction only for the main container, not the sidebar
  function updateDirection(lang) {
    if (window.preventContainerLangChange) return;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    // لا تغيّر اتجاه الشريط الجانبي إطلاقاً
  }

// languageSwitcher.js
// Unified language and sidebar handler (Arabic, English, French)
(function() {
  const supportedLangs = ['ar', 'en', 'fr'];
  // Use a single key for language in localStorage
  const LANG_KEY = 'lang';
  let currentLang = localStorage.getItem(LANG_KEY) || 'ar';

  // Update all elements with data-lang attributes
  function updateTexts(lang) {
    document.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(function(el) {
      if (el.hasAttribute('data-' + lang)) {
        el.textContent = el.getAttribute('data-' + lang);
      }
    });
    // Sidebar specific: also update .sidebar-text if present
    document.querySelectorAll('.sidebar-text').forEach(function(el) {
      if (el.dataset && el.dataset[lang]) {
        el.textContent = el.dataset[lang];
      }
    });
  }

  

  // Highlight active sidebar link
  function highlightActiveSidebarLink() {
    var current = window.location.pathname.split('/').pop();
    if (!current || current === '') current = 'dashboard.html';
    document.querySelectorAll('.sidebar-menu a').forEach(function(link) {
      link.classList.remove('active');
      var href = link.getAttribute('href');
      if (href && href !== '#' && current === href) {
        link.classList.add('active');
      }
    });
  }

  // Set language and update everything
  function setLang(lang) {
    if (!supportedLangs.includes(lang)) lang = 'ar';
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    updateTexts(lang);
    updateDirection(lang);
    highlightActiveSidebarLink();
  }

  // Refresh all language-dependent UI
  function refreshLanguage() {
    setLang(currentLang);
  }

  // Listen for language changes from other tabs
  window.addEventListener('storage', function(e) {
    if (e.key === LANG_KEY) {
      setLang(e.newValue || 'ar');
    }
  });

  // Observe sidebar DOM changes (for dynamic loads)
  function observeSidebar() {
    var sidebar = document.getElementById('sidebar');
    if (sidebar) {
      var observer = new MutationObserver(function() {
        updateTexts(currentLang);
      });
      observer.observe(sidebar, { childList: true, subtree: true });
    }
  }

  // Expose API
  window.languageSwitcher = {
    setLang,
    getLang: () => currentLang,
    supportedLangs,
    refreshLanguage
  };

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    setLang(currentLang);
    observeSidebar();
    // Fallback for dynamic sidebar loads

    setTimeout(() => updateTexts(currentLang), 1500);
    setTimeout(() => updateTexts(currentLang), 3500);
    // Language button click
    document.body.addEventListener('click', function(e) {
      if (e.target.classList && e.target.classList.contains('lang-btn')) {
        window.languageSwitcher.setLang(e.target.getAttribute('data-lang'));
      }
    });
  });

})();
