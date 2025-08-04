// جلب الوكالات من API وتخزينها في متغير عام
let allAgencies = [];
async function loadAgencies() {
    const grid = document.getElementById('agencies-grid');
    grid.innerHTML = '<div style="text-align:center;padding:30px;">جاري التحميل...</div>';
    try {
        const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/user/agencies');
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
function renderAgencies(agencies, lang) {
    lang = lang || localStorage.getItem('preferredLang') || document.documentElement.lang || 'ar';
    let t = window.agenciesTranslations ? window.agenciesTranslations[lang] : {};
    const grid = document.getElementById('agencies-grid');
    grid.innerHTML = '';
    if (!agencies.length) {
        grid.innerHTML = `<div style="text-align:center;padding:40px;">${t.noData || 'لا توجد وكالات مطابقة.'}</div>`;
        return;
    }
    agencies.forEach(agency => {
        const template = document.getElementById('agency-card-template').content.cloneNode(true);
        template.querySelector('.agency-logo img').src = agency.logo_url || 'img/default-logo.png';
        template.querySelector('.omra-label').textContent = agency.name;
        template.querySelector('.date-value').textContent = `${t.license || 'ترخيص'} ${agency.license_number || '-'}`;
        template.querySelector('.location-name').textContent = agency.location_name || agency.wilaya || t.notSet || 'غير محدد';
        // زر الموقع
        const locationBtn = template.querySelector('.location-btn');
        if (agency.latitude && agency.longitude) {
            locationBtn.href = `https://www.google.com/maps/search/?api=1&query=${agency.latitude},${agency.longitude}`;
            locationBtn.style.display = 'block';
            locationBtn.title = t.gps || 'GPS';
            locationBtn.querySelector('span') && (locationBtn.querySelector('span').textContent = t.gps || 'GPS');
        } else {
            locationBtn.style.display = 'none';
        }
        // زر التفاصيل
        const detailsBtn = template.querySelector('.details-btn');
        if (detailsBtn) {
            detailsBtn.href = `agency-details.html?id=${agency.id}`;
            detailsBtn.textContent = t.details || 'تفاصيل الوكالة';
        }
        grid.appendChild(template);
    });
}

// تعبئة قائمة الولايات
function fillWilayaFilter(agencies) {
    const select = document.querySelector('.wilaya-filter');
    if (!select) return;
    // استخدم الترجمة من lang_agencies.js إذا كانت متوفرة
    let lang = localStorage.getItem('preferredLang') || document.documentElement.lang || 'ar';
    let t = window.agenciesTranslations ? window.agenciesTranslations[lang] : { allWilayas: 'كل الولايات' };
    const wilayas = Array.from(new Set(agencies.map(a => a.wilaya).filter(Boolean)));
    select.innerHTML = `<option value="">${t.allWilayas || 'كل الولايات'}</option>` + wilayas.map(w => `<option value="${w}">${w}</option>`).join('');
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
        // مرر اللغة الحالية لدالة البطاقات
        let lang = localStorage.getItem('preferredLang') || document.documentElement.lang || 'ar';
        renderAgencies(filtered, lang);
    }

    if (searchInput) searchInput.addEventListener('input', filterAndRender);
    if (wilayaSelect) wilayaSelect.addEventListener('change', filterAndRender);

    // زر الأقرب
    if (nearbyBtn) {
        nearbyBtn.addEventListener('click', function() {
            if (!navigator.geolocation) {
                alert('المتصفح لا يدعم تحديد الموقع الجغرافي');
                return;
            }
            nearbyBtn.disabled = true;
            let lang = localStorage.getItem('preferredLang') || document.documentElement.lang || 'ar';
            let t = window.agenciesTranslations ? window.agenciesTranslations[lang] : {};
            // تحديث فقط نص الـ span الداخلي وليس كل الزر
            const span = nearbyBtn.querySelector('.nearby-btn-text');
            if (span) {
                span.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${t.findingNearest || 'جاري تحديد الأقرب...'}`;
            }
            navigator.geolocation.getCurrentPosition(function(pos) {
                const { latitude, longitude } = pos.coords;
                let agenciesWithDist = allAgencies.map(a => {
                    let dist = (a.latitude && a.longitude) ? calcDistance(latitude, longitude, a.latitude, a.longitude) : Infinity;
                    return { ...a, _distance: dist };
                });
                agenciesWithDist = agenciesWithDist.filter(a => a._distance !== Infinity);
                agenciesWithDist.sort((a, b) => a._distance - b._distance);
                renderAgencies(agenciesWithDist, lang);
                nearbyBtn.disabled = false;
                // إعادة النص الافتراضي عبر updateRegisterBtnLang
                updateRegisterBtnLang();
            }, function() {
                alert('تعذر الحصول على موقعك');
                nearbyBtn.disabled = false;
                updateRegisterBtnLang();
            });
        });
    }
}

// دالة حساب المسافة بين نقطتين (Haversine)
function calcDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// تحديث زر سجل وكالتك مع اللغة
function updateRegisterBtnLang() {
    let lang = localStorage.getItem('preferredLang') || document.documentElement.lang || 'ar';
    let t = window.agenciesTranslations ? window.agenciesTranslations[lang] : {};
    // زر سجل وكالتك (جميع العناصر)
    document.querySelectorAll('.register-agency-text').forEach(span => {
        span.textContent = t.registerAgency || (lang === 'fr' ? 'Enregistrez votre agence' : 'سجل وكالتك');
    });
    // زر الأقرب إليك (جميع العناصر)
    document.querySelectorAll('.nearby-btn-text').forEach(span => {
        span.textContent = t.nearestBtn || 'الأقرب إليك';
    });
    // حقل البحث (جميع العناصر)
    document.querySelectorAll('.search-input').forEach(searchInput => {
        searchInput.placeholder = t.searchPlaceholder || 'ابحث عن وكالتك';
    });
}

// عند تغيير اللغة من أي مكان
window.addEventListener('storage', updateRegisterBtnLang);

// دعم التغيير الفوري عند تغيير اللغة من السويتشر
if (window.setLanguage) {
    const origSetLanguage = window.setLanguage;
    window.setLanguage = function(lang) {
        origSetLanguage(lang);
        updateRegisterBtnLang();
        // لا تعيد setupAgencyFilters حتى لا تعيد النصوص للثابت
    };
}

// تحميل العروض عند بدء الصفحة



document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    // أضف عناصر الفلاتر والبحث مرة واحدة فقط في الأعلى
    if (container) {
        // ترتيب موحد: سجل وكالتك - البحث - الفلاتر في صف واحد مرن
        let lang = localStorage.getItem('preferredLang') || document.documentElement.lang || 'ar';
        if (!container.querySelector('.actions-bar')) {
            const actionsBar = document.createElement('div');
            actionsBar.className = 'actions-bar';
            actionsBar.style.display = 'flex';
            actionsBar.style.flexWrap = 'wrap';
            actionsBar.style.alignItems = 'center';
            actionsBar.style.gap = '12px';
            actionsBar.style.marginBottom = '18px';
            actionsBar.style.justifyContent = 'center';
            // زر سجل وكالتك
            const loginDiv = document.createElement('div');
            loginDiv.className = 'login-agencie';
            loginDiv.innerHTML = `<a href="/public/agencie/login_agencie.html" class="register-agency-btn"><span class="register-agency-text"></span></a>`;
            // البحث
            const searchForm = document.createElement('form');
            searchForm.className = 'search-bar1';
            searchForm.setAttribute('onsubmit', 'return false;');
            searchForm.innerHTML = `
                <span class="icon"><i class="fa fa-search"></i></span>
                <input type="text" class="search-input" />
            `;
            // الفلاتر
            const filtersDiv = document.createElement('div');
            filtersDiv.className = 'filters';
            filtersDiv.innerHTML = `
                <select class="wilaya-filter filter-btn"></select>
                <button type="button" class="filter-btn nearby-btn"><i class="fas fa-map-marker-alt"></i> <span class="nearby-btn-text"></span></button>
            `;
            // الترتيب حسب اللغة
            if (lang === 'ar') {
                actionsBar.appendChild(loginDiv);
                actionsBar.appendChild(searchForm);
                actionsBar.appendChild(filtersDiv);
            } else {
                actionsBar.appendChild(filtersDiv);
                actionsBar.appendChild(searchForm);
                actionsBar.appendChild(loginDiv);
            }
            // أضف الشريط الموحد قبل شبكة الوكالات
            const grid = container.querySelector('#agencies-grid');
            if (grid) {
                container.insertBefore(actionsBar, grid);
            } else {
                container.appendChild(actionsBar);
            }
        }
    }
    loadAgencies();
    setupAgencyFilters();
    // تأكد من تحديث نص زر الأقرب إليك بعد تحميل الصفحة مباشرة
    setTimeout(updateRegisterBtnLang, 100);
});

