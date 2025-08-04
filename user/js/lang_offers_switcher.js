// تبديل لغة صفحة العروض بناءً على اختيار المستخدم أو اللغة المحفوظة
(function() {
  // جلب اللغة من localStorage أو من اتجاه الصفحة
  function getCurrentLang() {
    return localStorage.getItem('lang') || document.documentElement.lang || 'ar';
  }

  function setLangTexts(lang) {
    if (!window.offersTexts) return;
    const t = window.offersTexts[lang] || window.offersTexts['ar'];
    // العنوان الرئيسي
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) pageTitle.textContent = t.pageTitle;
    // العنوان الفرعي
    const pageSubtitle = document.querySelector('.page-subtitle');
    if (pageSubtitle) pageSubtitle.textContent = t.pageSubtitle;
    // أزرار الفلترة
    const btnNearestTrips = document.getElementById('filter-nearest-trips');
    if (btnNearestTrips) btnNearestTrips.innerHTML = ' ' + t.filterNearestTrips;
    const btnNearestHaram = document.getElementById('filter-nearest-haram');
    if (btnNearestHaram) btnNearestHaram.innerHTML = ' ' + t.filterNearestHaram;
    const btnBestPrice = document.getElementById('filter-best-price');
    if (btnBestPrice) btnBestPrice.innerHTML = ' ' + t.filterBestPrice;
    const btnLocation = document.getElementById('filter-location');
    if (btnLocation) btnLocation.innerHTML = ' ' + t.filterLocation;
    // قائمة الولاية
    const selectWilaya = document.getElementById('filter-wilaya');
    if (selectWilaya) selectWilaya.options[0].textContent = t.filterWilaya;
    // نص التحميل
    const offersContainer = document.querySelector('.offers-container');
    if (offersContainer && offersContainer.innerHTML.includes('جاري التحميل')) {
      offersContainer.innerHTML = `<div style="grid-column: 1/-1; text-align:center;">${t.loading}</div>`;
    }
  }

  // مراقبة تغيير اللغة (مثلاً عند الضغط على زر تغيير اللغة في الشريط العلوي)
  window.setOffersLang = function(lang) {
    localStorage.setItem('lang', lang);
    setLangTexts(lang);
    document.documentElement.lang = lang;
  };

  // عند تحميل الصفحة
  document.addEventListener('DOMContentLoaded', function() {
    setLangTexts(getCurrentLang());
  });
})();
