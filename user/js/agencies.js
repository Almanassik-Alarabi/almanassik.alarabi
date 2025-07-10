// جلب الوكالات من API وتخزينها في متغير عام
let allAgencies = [];
async function loadAgencies() {
    const grid = document.getElementById('agencies-grid');
    grid.innerHTML = '<div style="text-align:center;padding:30px;">جاري التحميل...</div>';
    try {
        const res = await fetch('https://almanassik-alarabis-v0-4.onrender.com/api/user/agencies');
        const data = await res.json();
        if (data.status === 'ok' && Array.isArray(data.agencies)) {
            allAgencies = data.agencies;
            renderAgencies(allAgencies);
            fillWilayaFilter(allAgencies);
        } else {
            grid.innerHTML = '<div style="text-align:center;width:100%;color:#c00;">حدث خطأ أثناء جلب البيانات.</div>';
        }
    } catch (e) {
        grid.innerHTML = '<div style="text-align:center;width:100%;color:#c00;">تعذر الاتصال بالخادم.</div>';
    }
}

// عرض الوكالات في الشبكة
function renderAgencies(agencies) {
    const grid = document.getElementById('agencies-grid');
    grid.innerHTML = '';
    if (!agencies.length) {
        grid.innerHTML = '<div style="text-align:center;padding:40px;">لا توجد وكالات مطابقة.</div>';
        return;
    }
    agencies.forEach(agency => {
        const card = createAgencyCard(agency);
        card.classList.add('agency-card-clickable'); // بدلاً من style.cursor
        card.onclick = () => {
            // إرسال بيانات الوكالة إلى الصفحة الأخرى عبر localStorage
            localStorage.setItem('selectedAgency', JSON.stringify(agency));
            window.location.href = 'agency-details.html';
        };
        grid.appendChild(card);
    });
}

// تعبئة قائمة الولايات
function fillWilayaFilter(agencies) {
    const select = document.querySelector('.wilaya-filter');
    if (!select) return;
    const wilayas = Array.from(new Set(agencies.map(a => a.wilaya).filter(Boolean)));
    select.innerHTML = '<option value="">كل الولايات</option>' + wilayas.map(w => `<option value="${w}">${w}</option>`).join('');
}

// إنشاء بطاقة وكالة بنفس تنسيق العروض
function createAgencyCard(agency) {
    const card = document.createElement('div');
    card.className = 'agency-card';

    // شارة الاعتماد (تمت إزالتها لأن جميع الوكالات معتمدة)
    // if (agency.is_approved) {
    //     const badge = document.createElement('span');
    //     badge.className = 'card-badge approved-badge';
    //     badge.innerHTML = '<i class="fas fa-check-circle"></i> <span>معتمدة</span>';
    //     card.appendChild(badge);
    // }

    // صورة الغلاف
    const bg = document.createElement('img');
    bg.className = 'agency-image';
    bg.src = agency.background_url || 'img/images123.jpg';
    bg.alt = agency.name;
    card.appendChild(bg);

    // الشعار بشكل دائري صغير وقابل للنقر
    if (agency.logo_url) {
        const logoWrapper = document.createElement('div');
        logoWrapper.className = 'agency-logo-wrapper';
        // إزالة جميع الأنماط المدمجة، فقط الكلاسات
        logoWrapper.title = 'تفاصيل الوكالة';
        logoWrapper.onclick = () => {
            window.location.href = `agency-details.html?id=${agency.id}`;
        };
        const logo = document.createElement('img');
        logo.src = agency.logo_url;
        logo.alt = agency.name + ' logo';
        logo.className = 'agency-logo-img'; // بدلاً من الأنماط المدمجة
        logoWrapper.appendChild(logo);
        card.appendChild(logoWrapper);
    }

    // محتوى البطاقة
    const content = document.createElement('div');
    content.className = 'agency-content';

    // العنوان فقط
    const title = document.createElement('div');
    title.className = 'agency-title';
    const h3 = document.createElement('h3');
    h3.textContent = agency.name;
    title.appendChild(h3);
    content.appendChild(title);

    // الموقع
    const meta = document.createElement('div');
    meta.className = 'agency-meta';
    meta.innerHTML = '<i class="fas fa-map-marker-alt"></i> <span>' + (agency.location_name || '-') + '</span>';
    content.appendChild(meta);

    // عدد العروض
    const offersCount = document.createElement('div');
    offersCount.className = 'agency-offers-count';
    // إزالة الأنماط المدمجة
    offersCount.textContent = 'عدد العروض: ...';
    content.appendChild(offersCount);
    // جلب عدد العروض
    fetch(`https://almanassik-alarabis-v0-4.onrender.com/api/user/agency/${agency.id}/active-offers`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok' && Array.isArray(data.offers)) {
                offersCount.textContent = `عدد العروض: ${data.offers.length}`;
            } else {
                offersCount.textContent = 'عدد العروض: 0';
            }
        })
        .catch(() => {
            offersCount.textContent = 'عدد العروض: ؟';
        });

    card.appendChild(content);
    return card;
}


// البحث والفلاتر
function setupAgencyFilters() {
    const searchInput = document.querySelector('.search-input');
    const wilayaSelect = document.querySelector('.wilaya-filter');
    const nearbyBtn = document.querySelector('.nearby-btn');

    function filterAndRender() {
        let filtered = allAgencies;
        const searchVal = searchInput.value.trim().toLowerCase();
        const wilayaVal = wilayaSelect.value;
        if (searchVal) {
            filtered = filtered.filter(a =>
                (a.name && a.name.toLowerCase().includes(searchVal)) ||
                (a.location_name && a.location_name.toLowerCase().includes(searchVal)) ||
                (a.wilaya && a.wilaya.toLowerCase().includes(searchVal))
            );
        }
        if (wilayaVal) {
            filtered = filtered.filter(a => a.wilaya === wilayaVal);
        }
        renderAgencies(filtered);
    }

    searchInput.addEventListener('input', filterAndRender);
    wilayaSelect.addEventListener('change', filterAndRender);

    // زر الأقرب
    nearbyBtn.addEventListener('click', function() {
        if (!navigator.geolocation) {
            alert('المتصفح لا يدعم تحديد الموقع الجغرافي');
            return;
        }
        nearbyBtn.disabled = true;
        nearbyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تحديد الأقرب...';
        navigator.geolocation.getCurrentPosition(function(pos) {
            const { latitude, longitude } = pos.coords;
            // حساب المسافة لكل وكالة
            let agenciesWithDist = allAgencies.map(a => {
                let dist = (a.latitude && a.longitude) ? calcDistance(latitude, longitude, a.latitude, a.longitude) : Infinity;
                return { ...a, _distance: dist };
            });
            agenciesWithDist = agenciesWithDist.filter(a => a._distance !== Infinity);
            agenciesWithDist.sort((a, b) => a._distance - b._distance);
            renderAgencies(agenciesWithDist);
            nearbyBtn.disabled = false;
            nearbyBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> الأقرب إليك';
        }, function() {
            alert('تعذر الحصول على موقعك');
            nearbyBtn.disabled = false;
            nearbyBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> الأقرب إليك';
        });
    });
}

// دالة حساب المسافة بين نقطتين (Haversine)
function calcDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371; // نصف قطر الأرض كم
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

document.addEventListener('DOMContentLoaded', () => {
    loadAgencies();
    setupAgencyFilters();
});
