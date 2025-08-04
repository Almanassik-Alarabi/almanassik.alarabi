// دالة لجلب العروض من API
let allOffers = [];
let agencySet = new Set();
let airportSet = new Set();
async function fetchAndDisplayOffers(filteredOffers = null) {
    // تشخيص: طباعة بيانات العروض في الكونسول
    // إذا كان filteredOffers حدث (Event) تجاهله
    if (filteredOffers && typeof filteredOffers === 'object' && filteredOffers instanceof Event) {
        filteredOffers = null;
    }
    const offersContainer = document.querySelector('.offers-container');
    offersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center;">جاري التحميل...</div>';
    try {
        let offers = filteredOffers;
        if (!offers) {
            const response = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/user/offers');
            let apiResult = await response.json();
            // دعم الاستجابة كمصفوفة أو كائن فيه data
            offers = Array.isArray(apiResult) ? apiResult : apiResult.data || [];
            allOffers = offers;
            // جلب الوكالات من API منفصل
            fetchAgenciesAndAirports(offers);
        }
        // لعرض جميع العروض دائماً عند أول تحميل (بدون أي فلترة)
        if (!filteredOffers) {
            offers = allOffers;
        }
        // فلترة العروض حسب تاريخ الذهاب (العروض المستقبلية فقط)
        const now = new Date();
        offers = offers.filter(offer => {
            if (!offer.departure_date) return false;
            const depDate = new Date(offer.departure_date);
            // فقط العروض التي تاريخ الذهاب اليوم أو بعد اليوم
            return depDate >= now.setHours(0,0,0,0);
        });
// جلب الوكالات والمطارات من API وتعبئة القوائم
async function fetchAgenciesAndAirports(offers) {
    // جلب الوكالات والمطارات من API موحد
    try {
        const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/user/offers'); // <-- تعديل هنا
        const data = await res.json();
        agencySet = new Set();
        airportSet = new Set();
        // دعم الاستجابة كمصفوفة أو كائن فيه data
        const offersData = Array.isArray(data) ? data : data.data || [];
        // بناء قائمة الوكالات والمطارات من بيانات العروض
        offersData.forEach(offer => {
            if (offer.agencies && offer.agencies.name) agencySet.add(offer.agencies.name);
            if (offer.departure_airport) airportSet.add(offer.departure_airport);
            else if (offer.airport) airportSet.add(offer.airport);
        });
        airportSet.delete(undefined); airportSet.delete(null); airportSet.delete("");
        updateAgencyAndAirportLists();
    } catch (e) {
        // fallback: من بيانات العروض فقط
        agencySet = new Set();
        airportSet = new Set();
        offers.forEach(offer => {
            if (offer.agencies && offer.agencies.name) agencySet.add(offer.agencies.name);
            if (offer.departure_airport) airportSet.add(offer.departure_airport);
            else if (offer.airport) airportSet.add(offer.airport);
        });
        airportSet.delete(undefined); airportSet.delete(null); airportSet.delete("");
        updateAgencyAndAirportLists();
    }
}
        if (!Array.isArray(offers) || offers.length === 0) {
            offersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center;">لا توجد عروض متاحة حالياً</div>';
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
        const lang = localStorage.getItem('lang') || document.documentElement.lang || 'ar';
        const t = window.offersTexts && window.offersTexts[lang] ? window.offersTexts[lang] : window.offersTexts['ar'];
        offersContainer.innerHTML = offers.map(offer => {
            const agencyLogo = offer.agencies && offer.agencies.logo_url ? `<img src='${offer.agencies.logo_url}' alt='logo'>` : '';
            const price = Number(offer.price_quint) ? offer.price_quint + ' ' + (t.dzd || 'د.ج') : t.cardUnavailable;
            const dateFormatted = offer.departure_date ? new Date(offer.departure_date).toLocaleDateString('en-GB').split('/').reverse().join('-') : '';
            const distance = offer.hotel_distance ? `${offer.hotel_distance} M` : '';
            const showCrown = offer.type === 'golden' || offer.is_golden;
            const gpsBtn = (offer.agencies && (offer.agencies.latitude || offer.agencies.longitude)) ?
                `<a href='https://www.google.com/maps/search/?api=1&query=${offer.agencies.latitude},${offer.agencies.longitude}' target='_blank' class='location-btn' title='${t.cardLocation}'><i class='fas fa-map-marker-alt'></i></a>` : '';
            // عرض اسم الموقع من offer.agencies.location_name إذا كان موجوداً
            const locationName = offer.agencies && offer.agencies.location_name
                ? offer.agencies.location_name
                : (offer.location_name && offer.location_name !== t.cardUnavailable ? offer.location_name : `<span style=\"color:#d32f2f\">${t.cardUnavailable}</span>`);
            // بناء الكارت بدون زر التفاصيل
            return `
<div class="card_box" data-offer-id="${offer.id}">
  <div class="card_box__header-row">
    <div class="agency-logo">${agencyLogo}</div>
    ${showCrown ? '<span class="details-btn-crown"><i class="fas fa-crown"></i></span>' : ''}
  </div>
  <span class="charite" data-price="${price}"></span>
  <div class="card_box__body">
    <div class="date-box">
      <span class="date-value">${t.cardDate}: ${dateFormatted}</span>
    </div>
    <div class="distance"><i class="fas fa-hotel"></i> ${t.cardDistance}: ${distance}</div>
    <div class="details-btn-row">
      <a class="details-btn" href="offer-details.html?id=${offer.id}">${t.cardDetails}</a>
    </div>
    <div class="gps-btn-row">
      ${gpsBtn} <div class="location-name">${locationName}</div>
    </div>
  </div>
</div>
            `;
        }).join('');

        // إسناد حدث الضغط على زر التفاصيل بعد إنشاء العناصر
        document.querySelectorAll('.card_box .details-btn-row .details-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const card = btn.closest('.card_box');
                const offerId = card && card.getAttribute('data-offer-id');
                if (offerId) {
                    recordOfferView(e, offerId);
                }
            });
        });
    } catch (err) {
        offersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:red;">حدث خطأ أثناء جلب العروض</div>';
    }
}


// تفعيل فلترة العروض
function applyFilters() {
    let filtered = [...allOffers];
    // فلترة باسم الوكالة
    const agencyName = document.getElementById('agencyName').value;
    if (agencyName) {
        filtered = filtered.filter(offer => {
            const name = offer.agencies && offer.agencies.name ? offer.agencies.name : '';
            return name === agencyName;
        });
    }
    // فلترة مطار الإقلاع (فلترة الوكالات أولاً ثم العروض)
    const airport = document.getElementById('airport').value;
    if (airport && window.lastAgenciesWithAirports) {
        // احصل على قائمة الوكالات التي تحتوي على هذا المطار
        const allowedAgencyIds = window.lastAgenciesWithAirports
            .filter(agency => Array.isArray(agency.airports) && agency.airports.some(ap => ap && ap.name === airport))
            .map(agency => agency.id);
        filtered = filtered.filter(offer => allowedAgencyIds.includes(offer.agency_id));
    }
    // ترتيب السعر
    const priceOrder = document.getElementById('priceOrder').value;
    if (priceOrder === 'asc') {
        filtered = filtered.sort((a, b) => Number(a.price_quint) - Number(b.price_quint));
    } else if (priceOrder === 'desc') {
        filtered = filtered.sort((a, b) => Number(b.price_quint) - Number(a.price_quint));
    }
    fetchAndDisplayOffers(filtered);
}

// تحديث قوائم الوكالات والمطارات
function updateAgencyAndAirportLists() {
    const agencySelect = document.getElementById('agencyName');
    const airportSelect = document.getElementById('airport');
    const wilayaSelect = document.getElementById('filter-wilaya');
    // بناء قائمة الولايات من العروض
    let wilayaSet = new Set();
    allOffers.forEach(offer => {
        // أضف الولاية من offer.wilaya إذا كانت موجودة
        if (offer.wilaya) wilayaSet.add(offer.wilaya);
        // أضف الولاية من offer.agencies.wilaya إذا كانت موجودة
        if (offer.agencies && offer.agencies.wilaya) wilayaSet.add(offer.agencies.wilaya);
    });
    if (wilayaSelect) {
        const selected = wilayaSelect.value;
        // استخدم الترجمة من window.offersTexts حسب اللغة
        const lang = localStorage.getItem('lang') || document.documentElement.lang || 'ar';
        const t = window.offersTexts && window.offersTexts[lang] ? window.offersTexts[lang] : window.offersTexts['ar'];
        wilayaSelect.innerHTML = `<option value="">${t.filterWilaya || 'الولاية'}</option>` +
            Array.from(wilayaSet).filter(Boolean).map(w => `<option value="${w}">${w}</option>`).join('');
        if (selected) wilayaSelect.value = selected;
    }
    if (agencySelect) {
        // احفظ القيمة المختارة
        const selected = agencySelect.value;
        agencySelect.innerHTML = '<option value="">كل الوكالات</option>' +
            Array.from(agencySet).map(name => `<option value="${name}">${name}</option>`).join('');
        if (selected) agencySelect.value = selected;
    }
    if (airportSelect) {
        const selected = airportSelect.value;
        airportSelect.innerHTML = '<option value="">كل المطارات</option>' +
            Array.from(airportSet).map(name => `<option value="${name}">${name}</option>`).join('');
        if (selected) airportSelect.value = selected;
    }
}

// زر الأقرب للحرم

// فلاتر الأزرار الجديدة
document.addEventListener('DOMContentLoaded', function() {
    const bestPriceBtn = document.getElementById('filter-best-price');
    if (bestPriceBtn) {
        bestPriceBtn.onclick = function() {
            let filtered = [...allOffers].sort((a, b) => Number(a.price_quint) - Number(b.price_quint));
            fetchAndDisplayOffers(filtered);
        };
    }
    const nearestHaramBtn = document.getElementById('filter-nearest-haram');
    if (nearestHaramBtn) {
        nearestHaramBtn.onclick = function() {
            let filtered = [...allOffers].filter(o => o.hotel_distance !== undefined && o.hotel_distance !== null);
            filtered.sort((a, b) => Number(a.hotel_distance) - Number(b.hotel_distance));
            fetchAndDisplayOffers(filtered);
        };
    }
    const nearestTripsBtn = document.getElementById('filter-nearest-trips');
    if (nearestTripsBtn) {
        nearestTripsBtn.onclick = function() {
            let filtered = [...allOffers].sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
            fetchAndDisplayOffers(filtered);
        };
    }
    const locationBtn = document.getElementById('filter-location');
    if (locationBtn) {
        locationBtn.onclick = function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(pos) {
                    let userLat = pos.coords.latitude, userLng = pos.coords.longitude;
                    let filtered = [...allOffers].map(o => {
                        if (o.hotel_lat && o.hotel_lng) {
                            o._distance = Math.sqrt(Math.pow(o.hotel_lat - userLat, 2) + Math.pow(o.hotel_lng - userLng, 2));
                        } else {
                            o._distance = Infinity;
                        }
                        return o;
                    });
                    filtered.sort((a, b) => a._distance - b._distance);
                    fetchAndDisplayOffers(filtered);
                });
            }
        };
    }
    const wilayaSelect = document.getElementById('filter-wilaya');
    if (wilayaSelect) {
        wilayaSelect.onchange = function(e) {
            let wilaya = e.target.value;
            let filtered = wilaya
                ? allOffers.filter(o =>
                    (o.wilaya === wilaya) ||
                    (o.agencies && o.agencies.wilaya === wilaya)
                  )
                : [...allOffers];
            fetchAndDisplayOffers(filtered);
        };
    }
});

// زر تصفية العروض (زر يدوي فقط)
const filterBtn = document.getElementById('applyFilters');
if (filterBtn) {
    filterBtn.addEventListener('click', applyFilters);
}

// تفعيل الفلترة الآنية عند تغيير أي فلتر
function enableInstantFilters() {
    const agencySelect = document.getElementById('agencyName');
    const airportSelect = document.getElementById('airport');
    const priceOrder = document.getElementById('priceOrder');
    if (agencySelect) agencySelect.addEventListener('change', applyFilters);
    if (airportSelect) airportSelect.addEventListener('change', applyFilters);
    if (priceOrder) priceOrder.addEventListener('change', applyFilters);
}

// تفعيل الفلترة الآنية بعد تحديث القوائم
const origUpdateAgencyAndAirportLists = updateAgencyAndAirportLists;
updateAgencyAndAirportLists = function() {
    origUpdateAgencyAndAirportLists();
    enableInstantFilters();
};

// تحميل العروض عند بدء الصفحة فقط
document.addEventListener('DOMContentLoaded', function() { fetchAndDisplayOffers(); });

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