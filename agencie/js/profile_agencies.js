// ولايات الجزائر (للمطابقة مع نتائج Nominatim)
const DZ_WILAYAS = [
    'أدرار','الشلف','الأغواط','أم البواقي','باتنة','بجاية','بسكرة','بشار','البليدة','البويرة','تمنراست','تبسة','تلمسان','تيارت','تيزي وزو','الجزائر','الجلفة','جيجل','سطيف','سعيدة','سكيكدة','سيدي بلعباس','عنابة','قالمة','قسنطينة','المدية','مستغانم','المسيلة','معسكر','ورقلة','وهران','البيض','إليزي','برج بوعريريج','بومرداس','الطارف','تندوف','تيسمسيلت','الوادي','خنشلة','سوق أهراس','تيبازة','ميلة','عين الدفلى','النعامة','عين تموشنت','غرداية','غليزان'
];

// دالة جلب اقتراحات الموقع عبر Nominatim (يفضل عبر البروكسي إذا كان متاحاً)
async function fetchLocationSuggestions(query) {
    // const url = `/api/proxy/nominatim?q=${encodeURIComponent(query)}`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=dz&format=json&addressdetails=1&limit=7`;
    const res = await fetch(url, {
        headers: {
            'Accept-Language': 'ar,en',
            'User-Agent': 'umrah-agency-frontend/1.0'
        }
    });
    return res.json();
}

// ربط الاقتراحات بحقل الموقع
document.addEventListener('DOMContentLoaded', function() {
    const locationInput = document.getElementById('location_name');
    const suggestionsBox = document.getElementById('location-suggestions');
    let debounceTimeout;
    if (locationInput && suggestionsBox) {
        locationInput.addEventListener('input', function() {
            clearTimeout(debounceTimeout);
            const value = this.value.trim();
            if (value.length < 2) {
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
                return;
            }
            debounceTimeout = setTimeout(async () => {
                suggestionsBox.innerHTML = '<div class="loading">جاري البحث ...</div>';
                suggestionsBox.style.display = 'block';
                let results = await fetchLocationSuggestions(value);
                // تصفية النتائج للجزائر فقط
                results = results.filter(place => {
                    if (place.address && place.address.country) {
                        return place.address.country.includes('Algeria') || place.address.country.includes('الجزائر');
                    }
                    return place.display_name.includes('Algeria') || place.display_name.includes('الجزائر');
                });
                if (!results.length) {
                    suggestionsBox.innerHTML = '<div class="no-result">لا توجد نتائج</div>';
                    return;
                }
                suggestionsBox.innerHTML = results.map(r => `<div class="suggestion-item" data-lat="${r.lat}" data-lon="${r.lon}" data-display="${r.display_name.replace(/"/g, '&quot;')}" data-wilaya="${(r.address.state||'').replace(/"/g, '&quot;')}">${r.display_name}</div>`).join('');
            }, 350);
        });
        // عند اختيار اقتراح
        suggestionsBox.addEventListener('click', function(e) {
            const item = e.target.closest('.suggestion-item');
            if (!item) return;
            locationInput.value = item.getAttribute('data-display');
            document.getElementById('latitude').value = item.getAttribute('data-lat');
            document.getElementById('longitude').value = item.getAttribute('data-lon');
            // محاولة تعيين الولاية تلقائياً
            let wilaya = item.getAttribute('data-wilaya') || '';
            if (wilaya) {
                const match = DZ_WILAYAS.find(w => wilaya.includes(w) || w.includes(wilaya));
                if (match) document.getElementById('wilaya').value = match;
                else document.getElementById('wilaya').value = wilaya;
            }
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
        });
        // إخفاء الاقتراحات عند فقدان التركيز
        document.addEventListener('click', function(e) {
            if (!suggestionsBox.contains(e.target) && e.target !== locationInput) {
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
            }
        });
    }
});
// إعداد المتغيرات
// استخراج معرف الوكالة من بيانات تسجيل الدخول المخزنة في localStorage
let agencyId = JSON.parse(localStorage.getItem('agency_data'));

const API_URL = `https://almanassik-alarabi-server-v-01.onrender.com/api/agency/profile/${agencyId.id}`;
const TOKEN = localStorage.getItem('agency_token') || '';

document.addEventListener("DOMContentLoaded", () => {
    fetchProfile();
    document.getElementById("agencyProfileForm").addEventListener("submit", handleSubmit);
    document.getElementById("logo_url").addEventListener("change", handleLogoPreview);
    document.getElementById("background_url").addEventListener("change", handleBackgroundPreview);
    // زر إظهار/إخفاء كلمة السر
    const passwordInput = document.getElementById("password");
    const togglePassword = document.querySelector(".toggle-password");
    if (passwordInput && togglePassword) {
        togglePassword.addEventListener("click", function() {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassword.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = "password";
                togglePassword.innerHTML = '<i class="fas fa-key"></i>';
            }
        });
    }
});

function fetchProfile() {
    fetch(API_URL, {
        headers: {
            "Authorization": `Bearer ${TOKEN}`
        }
    })
    .then(res => res.json())
    .then(data => fillForm(data))
    .catch(() => showMessage("تعذر جلب البيانات", true));
}

function fillForm(data) {
    document.getElementById("name").value = data.name || "";
    document.getElementById("wilaya").value = data.wilaya || "";
    document.getElementById("license_number").value = data.license_number || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("bank_account").value = data.bank_account || "";
    document.getElementById("location_name").value = data.location_name || "";
    document.getElementById("latitude").value = data.latitude || "";
    document.getElementById("longitude").value = data.longitude || "";
    document.getElementById("logoPreview").src = data.logo_url || "";
    document.getElementById("backgroundPreview").src = data.background_url || "";
    // حفظ آخر روابط الصور الحالية
    document.getElementById("logoPreview").setAttribute('data-current', data.logo_url || "");
    document.getElementById("backgroundPreview").setAttribute('data-current', data.background_url || "");
    // حفظ معرفات المطارات المرتبطة في متغير عام
    window.currentAgencyAirports = Array.isArray(data.airport_ids) ? data.airport_ids.map(String) : [];
    // إذا كانت المطارات محملة بالفعل، أعد تفعيل الشيكبوكسات
    if (window.allAirports && Array.isArray(window.allAirports)) {
        renderAirportsCheckboxes();
    }
}

function handleLogoPreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            document.getElementById("logoPreview").src = ev.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // إذا أزال المستخدم الصورة، أعد الصورة الأصلية
        document.getElementById("logoPreview").src = document.getElementById("logoPreview").getAttribute('data-current') || "";
    }
}

function handleBackgroundPreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            document.getElementById("backgroundPreview").src = ev.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById("backgroundPreview").src = document.getElementById("backgroundPreview").getAttribute('data-current') || "";
    }
}

function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();
    formData.append("name", form.name.value);
    formData.append("wilaya", form.wilaya.value);
    formData.append("license_number", form.license_number.value);
    formData.append("phone", form.phone.value);
    formData.append("bank_account", form.bank_account.value);
    formData.append("location_name", form.location_name.value);
    formData.append("latitude", form.latitude.value);
    formData.append("longitude", form.longitude.value);
    if (form.logo_url.files && form.logo_url.files[0]) {
        formData.append("logo_url", form.logo_url.files[0]);
    }
    if (form.background_url.files && form.background_url.files[0]) {
        formData.append("background_url", form.background_url.files[0]);
    }
    // إضافة كلمة السر الجديدة إذا تم إدخالها
    if (form.password && form.password.value && form.password.value.length >= 6) {
        formData.append("password", form.password.value);
    }
    // إضافة المطارات المختارة
    let selectedAirports = Array.from(document.querySelectorAll('input[name="agency_airports"]:checked')).map(cb => cb.value);
    selectedAirports = selectedAirports.filter(id => id !== undefined && id !== null && id !== '').map(id => Number(id));
    // تحقق من وجود مطارات مختارة وصحيحة
    if (!selectedAirports.length || selectedAirports.some(isNaN)) {
        showMessage("يرجى اختيار مطار واحد على الأقل بشكل صحيح", true);
        return;
    }
    formData.append("airports", JSON.stringify(selectedAirports));

    showMessage("جاري تعديل المعلومات ...", false);
    const saveBtn = form.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = '... جاري الحفظ';
    }

    fetch(API_URL, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${TOKEN}`
        },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            showMessage("حدث خطأ: " + data.error, true);
        } else {
            showMessage("تم تحديث البيانات بنجاح");
            fillForm(data);
            form.logo_url.value = "";
            form.background_url.value = "";
        }
    })
    .catch(() => showMessage("حدث خطأ أثناء التحديث", true))
    .finally(() => {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'حفظ التعديلات';
        }
    });
}

function showMessage(msg, isError = false) {
    const el = document.getElementById("message");
    el.textContent = msg;
    el.style.color = isError ? "red" : "green";
}

// زر عرض جميع المطارات
const showAirportsBtn = document.getElementById('show-airports-btn');
if (showAirportsBtn) {
    showAirportsBtn.addEventListener('click', function() {
        // جلب المطارات من الـ API إذا لم تكن محملة
        if (!window.allAirports) {
            fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/agency/airports')
              .then(res => res.json())
              .then(data => {
                window.allAirports = data || [];
                renderAirportsCheckboxes();
              })
              .catch(() => showMessage('تعذر جلب المطارات', true));
        } else {
            renderAirportsCheckboxes();
        }
    });
}

function renderAirportsCheckboxes() {
    const container = document.getElementById("agency-airports-list");
    if (!container) return;
    if (!window.allAirports || !Array.isArray(window.allAirports)) {
        container.innerHTML = '<div class="loading">جاري تحميل المطارات ...</div>';
        return;
    }
    if (!window.allAirports.length) {
        container.innerHTML = '<div class="no-result">لا توجد مطارات متاحة</div>';
        return;
    }
    const selected = Array.isArray(window.currentAgencyAirports) ? window.currentAgencyAirports.map(String) : [];
    // ترتيب المطارات أبجدياً حسب الاسم
    const sortedAirports = window.allAirports.slice().sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
    container.innerHTML = sortedAirports.map(airport => {
        const checked = selected.includes(String(airport.id)) ? 'checked' : '';
        return `<div class="airport-checkbox-block"><label class="airport-checkbox-item"><input type="checkbox" name="agency_airports" value="${airport.id}" ${checked}> ${airport.name} (${airport.code})</label></div>`;
    }).join('');
}

// Unified sidebar loader
function applyLanguage(lang) {
  // Update all elements with data-ar, data-en, data-fr
  document.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(function(el) {
    if (el.dataset[lang]) {
      el.textContent = el.dataset[lang];
    }
  });
  // Update language button active state
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  // Save language to localStorage
  localStorage.setItem('umrah_admin_lang', lang);
}
function setupLanguageSwitcher() {
  // Set initial language from localStorage or default to 'ar'
  var lang = localStorage.getItem('umrah_admin_lang') || 'ar';
  applyLanguage(lang);
  // Add event listeners
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      applyLanguage(btn.dataset.lang);
    });
  });
}
document.addEventListener('DOMContentLoaded', function() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('sidebar').innerHTML = html;
      // Highlight the active sidebar link based on current page
      var current = window.location.pathname.split('/').pop();
      if (!current || current === '') current = 'profile_agencies.html';
      // Wait for sidebar to be in DOM before selecting
      var interval = setInterval(function() {
        var links = document.querySelectorAll('.sidebar-menu a');
        if (links.length) {
          links.forEach(function(link) {
            link.classList.remove('active');
            var href = link.getAttribute('href');
            if (href && href !== '#' && current === href) {
              link.classList.add('active');
            }
          });
          clearInterval(interval);
        }
      }, 10);
      setupLanguageSwitcher();
    });
  // If sidebar loads after DOMContentLoaded, also run language switcher for main content
  setupLanguageSwitcher();
});