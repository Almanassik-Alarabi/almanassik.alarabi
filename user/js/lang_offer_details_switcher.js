// سويتشر لغة تفاصيل العرض
(function() {
  function setOfferDetailsLangTexts() {
    if (!window.offerDetailsTexts) return;
    var lang = localStorage.getItem('lang') || 'ar';
    var texts = window.offerDetailsTexts[lang] || window.offerDetailsTexts['ar'];
    // أمثلة: غيّر عناوين وأزرار حسب النصوص
    var pageTitle = document.getElementById('offer-details-title');
    if (pageTitle) pageTitle.textContent = texts.pageTitle;
    var selectRoom = document.getElementById('select-room-type-label');
    if (selectRoom) selectRoom.textContent = texts.selectRoomType;
    var totalPrice = document.getElementById('total-price-label');
    if (totalPrice) totalPrice.textContent = texts.totalPrice;
    var discountBtn = document.getElementById('discount-btn');
    if (discountBtn) discountBtn.textContent = texts.discount;
    var bookNowBtn = document.getElementById('booking-btn');
    if (bookNowBtn) bookNowBtn.textContent = texts.bookNow;
    var passportLabel = document.getElementById('passport-upload-label');
    if (passportLabel) passportLabel.textContent = texts.passportUpload;
    // ... أضف المزيد حسب الحاجة
  }
  document.addEventListener('DOMContentLoaded', setOfferDetailsLangTexts);
  window.setOfferDetailsLangTexts = setOfferDetailsLangTexts;
})();
