// دالة لتسجيل زيارة العرض عند الضغط على التفاصيل
window.recordOfferView = function(event, offerId) {
    // منع الانتقال الفوري
    if (event) {
        event.preventDefault();
        // تعطيل الزر حتى لا يتكرر الطلب
        if (event.target) {
            event.target.disabled = true;
            event.target.classList.add('disabled');
        }
    }
    // منع التكرار عبر متغير عام
    if (window.__offerViewSent && window.__offerViewSent[offerId]) return;
    if (!window.__offerViewSent) window.__offerViewSent = {};
    window.__offerViewSent[offerId] = true;
    fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/site-stats/offer-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId })
    }).catch(()=>{}).finally(() => {
        // الانتقال بعد الإرسال
        window.location.href = `offer-details.html?id=${offerId}`;
    });
};
// جلب تفاصيل الوكالة وعروضها وعرضها في الصفحة
document.addEventListener('DOMContentLoaded', async function() {
  // استخراج ID من الرابط
  function getAgencyId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  const agencyId = getAgencyId();
  if (!agencyId) {
    document.getElementById('agency-info-card').innerHTML = '<div style="color:#c00;text-align:center;">لم يتم تحديد الوكالة.</div>';
    document.getElementById('offers-grid').innerHTML = '';
    return;
  }

  // جلب البيانات من API
  try {
    const res = await fetch(`https://almanassik-alarabi-server-v-01.onrender.com/api/user/${agencyId}/details-with-offers`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(data.error || 'خطأ في جلب البيانات');
    const agency = data.agency;
    const offers = data.offers || [];

    // تعبئة بيانات الوكالة
    // اسم الوكالة: إذا اللغة فرنسي ضع الاسم بالفرنسي إذا توفر (يمكنك تعديل ذلك حسب قاعدة البيانات)
    const lang = window.getCurrentLang ? window.getCurrentLang() : 'ar';
    document.getElementById('agency-name').textContent = agency.name || '-';
    document.getElementById('agency-license').textContent = agency.license_number || '-';
    document.getElementById('agency-wilaya').textContent = agency.wilaya || '-';
    document.getElementById('agency-location').textContent = agency.location_name || '-';
    // إخفاء البريد الإلكتروني إذا غير موجود
    if (document.getElementById('agency-email')) {
      document.getElementById('agency-email').textContent = agency.email || '-';
    }

    // صورة الخلفية والشعار
    document.getElementById('agency-bg-img').src = agency.background_url || 'img/diwane.jpeg';
    document.getElementById('agency-logo-main').src = agency.logo_url || 'img/diwane.jpeg';

    // رابط الخريطة
    const mapLink = document.getElementById('agency-map-link');
    if (agency.latitude && agency.longitude) {
      mapLink.href = `https://www.google.com/maps/search/?api=1&query=${agency.latitude},${agency.longitude}`;
      mapLink.style.display = 'inline-block';
    } else {
      mapLink.style.display = 'none';
    }

    // العروض (تصميم صفحة العروض)
    const offersGrid = document.getElementById('offers-grid');
    offersGrid.innerHTML = '';
    if (!Array.isArray(offers) || offers.length === 0) {
      offersGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#888;">لا توجد عروض متاحة حالياً</div>';
      return;
    }
    // تحديد أقل سعر quint متوفر
    let minPrice = Infinity;
    let bestOfferId = null;
    offers.forEach(offer => {
      if (Number(offer.price_quint) && Number(offer.price_quint) < minPrice) {
        minPrice = Number(offer.price_quint);
        bestOfferId = offer.id;
      }
    });
    // الترجمة
    const lang2 = localStorage.getItem('lang') || document.documentElement.lang || 'ar';
    const t = window.offersTexts && window.offersTexts[lang2] ? window.offersTexts[lang2] : (window.offersTexts ? window.offersTexts['ar'] : {
      dzd: 'د.ج',
      cardUnavailable: '-',
      cardDate: 'تاريخ',
      cardDistance: 'المسافة',
      cardDetails: 'تفاصيل',
      cardLocation: 'الموقع'
    });
    offersGrid.innerHTML = offers.map(offer => {
      const mainImage = offer.main_image ? `<div class='offer-main-img'><img src='${offer.main_image}' alt='offer' style='width:100%;height:160px;object-fit:cover;border-radius:8px 8px 0 0;'></div>` : '';
      const price = Number(offer.price_quint) ? offer.price_quint + ' ' + (t.dzd || 'د.ج') : t.cardUnavailable;
      const dateFormatted = offer.departure_date ? new Date(offer.departure_date).toLocaleDateString('en-GB').split('/').reverse().join('-') : '';
      const distance = offer.hotel_distance ? `${offer.hotel_distance} M` : '';
      const showCrown = offer.type === 'golden' || offer.is_golden;
      const gpsBtn = (offer.agencies && (offer.agencies.latitude || offer.agencies.longitude))
        ? `<a href='https://www.google.com/maps/search/?api=1&query=${offer.agencies.latitude},${offer.agencies.longitude}' target='_blank' class='location-btn' title='${t.cardLocation}'><i class='fas fa-map-marker-alt'></i></a>`
        : (agency.latitude && agency.longitude
            ? `<a href='https://www.google.com/maps/search/?api=1&query=${agency.latitude},${agency.longitude}' target='_blank' class='location-btn' title='${t.cardLocation}'><i class='fas fa-map-marker-alt'></i></a>`
            : '');

      const locationName = (offer.agencies && offer.agencies.location_name)
        ? offer.agencies.location_name
        : (agency.location_name
            ? agency.location_name
            : (offer.location_name && offer.location_name !== t.cardUnavailable ? offer.location_name : `<span style=\"color:#d32f2f\">${t.cardUnavailable}</span>`));
      return `
<div class="card_box" data-offer-id="${offer.id}">

  <div class="card_box__header-row">
    <div class="agency-logo">${mainImage}</div>
    ${showCrown ? '<span class="details-btn-crown"><i class="fas fa-crown"></i></span>' : ''}
  </div>
  <span class="charite" data-price="${price}"></span>
  <div class="card_box__body">
    <div class="date-box">
      <span class="date-value">${t.cardDate}: ${dateFormatted}</span>
    </div>
    <div class="distance"><i class="fas fa-hotel"></i> ${t.cardDistance}: ${distance}</div>
    <div class="details-btn-row">
      <a class="details-btn" href="offer-details.html?id=${offer.id}" onclick="window.recordOfferView(event, '${offer.id}')">${t.cardDetails}</a>
    </div>
    <div class="gps-btn-row">
      ${gpsBtn} <div class="location-name">${locationName}</div>
    </div>
  </div>
</div>
      `;
    }).join('');
    // لم يعد هناك حاجة لإسناد الحدث هنا لأننا أضفناه مباشرة في الزر
  } catch (e) {
    document.getElementById('agency-info-card').innerHTML = `<div style='color:#c00;text-align:center;'>${e.message || 'تعذر جلب البيانات'}</div>`;
    document.getElementById('offers-grid').innerHTML = '';
  }
});
