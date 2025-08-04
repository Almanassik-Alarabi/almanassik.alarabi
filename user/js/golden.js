// دالة لجلب وعرض العروض الذهبية فقط
let allOffers = [];
let agencySet = new Set();
let airportSet = new Set();

async function fetchAndDisplayOffers(filteredOffers = null) {
    const offersContainer = document.querySelector('.offers-container');
    offersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center;">جاري التحميل...</div>';
    try {
        let offers = filteredOffers;
        if (!offers) {
            // جلب فقط العروض الذهبية من API
            const response = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/user/offers/golden');
            let apiResult = await response.json();
            offers = Array.isArray(apiResult) ? apiResult : apiResult.data || [];
            // لا داعي للفلترة هنا لأن الـ API يرجع فقط العروض الذهبية
            allOffers = offers;
            fetchAgenciesAndAirports(offers);
        }
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
        // استخراج الولايات من العروض وتعبئة قائمة الفلترة (مرة واحدة فقط)
        if (!fetchAndDisplayOffers.wilayasSet) {
            const wilayaSelect = document.getElementById('filter-wilaya');
            if (wilayaSelect) {
                let wilayaArr = [];
                allOffers.forEach(o => {
                    // اجمع من o.wilaya إذا كانت موجودة وصحيحة
                    if (o.wilaya && o.wilaya !== "" && o.wilaya !== null && o.wilaya !== undefined)
                        wilayaArr.push(o.wilaya);
                    // اجمع من o.agencies.wilaya إذا كانت موجودة وصحيحة
                    if (o.agencies && o.agencies.wilaya && o.agencies.wilaya !== "" && o.agencies.wilaya !== null && o.agencies.wilaya !== undefined)
                        wilayaArr.push(o.agencies.wilaya);
                });
                // إزالة التكرار والقيم الفارغة
                const wilayas = Array.from(new Set(wilayaArr.filter(w => w && w !== "" && w !== null && w !== undefined)));
                wilayaSelect.innerHTML = '<option value="">الولاية</option>' + wilayas.map(w => `<option value="${w}">${w}</option>`).join('');
                fetchAndDisplayOffers.wilayasSet = true;
            }
        }
        if (!Array.isArray(offers) || offers.length === 0) {
            offersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#bfa13a;">لا توجد عروض ذهبية متاحة حالياً</div>';
            return;
        }
           const lang = localStorage.getItem('lang') || document.documentElement.lang || 'ar';
        const t = window.offersTexts && window.offersTexts[lang] ? window.offersTexts[lang] : window.offersTexts['ar'];
     
        offersContainer.innerHTML = offers.map(offer => {
            const agencyLogo = offer.agencies && offer.agencies.logo_url ? `<img src='${offer.agencies.logo_url}' alt='logo'>` : '';
            const price = Number(offer.price_quint) ? offer.price_quint : 'غير متوفر';
            const dateFormatted = offer.departure_date ? new Date(offer.departure_date).toLocaleDateString('en-GB').split('/').reverse().join('-') : '';
            const distance = offer.hotel_distance ? `${offer.hotel_distance} M` : '';
            const showCrown = offer.type === 'golden' || offer.is_golden;
            const gpsBtn = (offer.agencies && (offer.agencies.latitude || offer.agencies.longitude)) ?
                `<a href='https://www.google.com/maps/search/?api=1&query=${offer.agencies.latitude},${offer.agencies.longitude}' target='_blank' class='location-btn' title='الموقع على الخريطة'><i class='fas fa-map-marker-alt'></i></a>` : '';
            // عرض اسم الموقع من offer.agencies.location_name إذا كان موجوداً
            const locationName = offer.agencies && offer.agencies.location_name
                ? offer.agencies.location_name
                : (offer.location_name && offer.location_name !== 'غير متوفر' ? offer.location_name : '<span style="color:#d32f2f">غير متوفر</span>');
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
                    recordGoldenOfferView(e, offerId);
                }
            });
        });
// دالة لتسجيل زيارة العرض الذهبي عند الضغط على التفاصيل
function recordGoldenOfferView(event, offerId) {
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
        window.location.href = `offer-details.html?id=${offerId}`;
    });
}
    } catch (err) {
        offersContainer.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:red;">حدث خطأ أثناء جلب العروض<br>${err.message}</div>`;
        console.error('خطأ جلب العروض الذهبية:', err);
    }
}

// جلب الوكالات والمطارات من API وتعبئة القوائم
async function fetchAgenciesAndAirports(offers) {
    try {
        const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/user/with-offers-and-airports');
        const data = await res.json();
        agencySet = new Set();
        airportSet = new Set();
        if (data && data.status === 'ok' && Array.isArray(data.agencies)) {
            window.lastAgenciesWithAirports = data.agencies;
            data.agencies.forEach(agency => {
                if (agency.name) agencySet.add(agency.name);
                if (Array.isArray(agency.airports)) {
                    agency.airports.forEach(ap => {
                        if (ap && ap.name) airportSet.add(ap.name);
                    });
                }
            });
        }
        airportSet.delete(undefined); airportSet.delete(null); airportSet.delete("");
        // إذا كان لديك دالة updateAgencyAndAirportLists يمكنك استدعاؤها هنا
    } catch (e) {
        agencySet = new Set();
        airportSet = new Set();
        offers.forEach(offer => {
            if (offer.agencies && offer.agencies.name) agencySet.add(offer.agencies.name);
            if (offer.departure_airport) airportSet.add(offer.departure_airport);
            else if (offer.airport) airportSet.add(offer.airport);
        });
        airportSet.delete(undefined); airportSet.delete(null); airportSet.delete("");
        // إذا كان لديك دالة updateAgencyAndAirportLists يمكنك استدعاؤها هنا
    }
}

// جميع الفلاتر تعمل فقط على العروض الذهبية (allOffers)
document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayOffers();
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