// languageSwitcher.js - موحد لجميع صفحات الإدارة
function applyLanguage(lang) {
  // غيّر النصوص لكل العناصر التي تحمل data-ar/data-en/data-fr
  document.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(function(el) {
    // دعم <option> داخل <select>
    if (el.tagName === 'OPTION') {
      if (lang === 'ar' && el.hasAttribute('data-ar')) {
        el.textContent = el.getAttribute('data-ar');
      } else if (lang === 'en' && el.hasAttribute('data-en')) {
        el.textContent = el.getAttribute('data-en');
      } else if (lang === 'fr' && el.hasAttribute('data-fr')) {
        el.textContent = el.getAttribute('data-fr');
      }
    } else if (el.tagName === 'BUTTON') {
      // غيّر نصوص جميع العناصر الفرعية داخل الزر (وليس فقط span)
      el.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(function(child) {
        if (lang === 'ar' && child.hasAttribute('data-ar')) {
          child.textContent = child.getAttribute('data-ar');
        } else if (lang === 'en' && child.hasAttribute('data-en')) {
          child.textContent = child.getAttribute('data-en');
        } else if (lang === 'fr' && child.hasAttribute('data-fr')) {
          child.textContent = child.getAttribute('data-fr');
        }
      });
      // إذا لم يوجد عنصر فرعي، غيّر نص الزر نفسه
      if (!el.querySelector('[data-ar], [data-en], [data-fr]')) {
        if (lang === 'ar' && el.hasAttribute('data-ar')) {
          el.textContent = el.getAttribute('data-ar');
        } else if (lang === 'en' && el.hasAttribute('data-en')) {
          el.textContent = el.getAttribute('data-en');
        } else if (lang === 'fr' && el.hasAttribute('data-fr')) {
          el.textContent = el.getAttribute('data-fr');
        }
      }
    } else {
      // باقي العناصر
      if (lang === 'ar' && el.hasAttribute('data-ar')) {
        el.textContent = el.getAttribute('data-ar');
      } else if (lang === 'en' && el.hasAttribute('data-en')) {
        el.textContent = el.getAttribute('data-en');
      } else if (lang === 'fr' && el.hasAttribute('data-fr')) {
        el.textContent = el.getAttribute('data-fr');
      }
    }
    // للـ placeholder
    if (el.placeholder !== undefined) {
      if (lang === 'ar' && el.hasAttribute('data-ar-placeholder')) {
        el.placeholder = el.getAttribute('data-ar-placeholder');
      } else if (lang === 'en' && el.hasAttribute('data-en-placeholder')) {
        el.placeholder = el.getAttribute('data-en-placeholder');
      } else if (lang === 'fr' && el.hasAttribute('data-fr-placeholder')) {
        el.placeholder = el.getAttribute('data-fr-placeholder');
      }
    }
  });
  // تفعيل الزر النشط
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
  localStorage.setItem('umrah_admin_lang', lang);
}
