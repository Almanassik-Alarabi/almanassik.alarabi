document.addEventListener('DOMContentLoaded', function() {
    // دالة لإظهار إشعار Toast عائم
    function showToast(message, type = 'info') {
        let toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.top = '32px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = type === 'success' ? '#388e3c' : (type === 'error' ? '#d32f2f' : '#333');
        toast.style.color = '#fff';
        toast.style.padding = '12px 32px';
        toast.style.borderRadius = '6px';
        toast.style.fontSize = '16px';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '1'; }, 50);
        setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 2200);
    }

    // تعبئة قائمة ولايات الجزائر تلقائياً
    const DZ_WILAYAS = [
        'أدرار','الشلف','الأغواط','أم البواقي','باتنة','بجاية','بسكرة','بشار','البليدة','البويرة','تمنراست','تبسة','تلمسان','تيارت','تيزي وزو','الجزائر','الجلفة','جيجل','سطيف','سعيدة','سكيكدة','سيدي بلعباس','عنابة','قالمة','قسنطينة','المدية','مستغانم','المسيلة','معسكر','ورقلة','وهران','البيض','إليزي','برج بوعريريج','بومرداس','الطارف','تندوف','تيسمسيلت','الوادي','خنشلة','سوق أهراس','تيبازة','ميلة','عين الدفلى','النعامة','عين تموشنت','غرداية','غليزان'
    ];
    const wilayaSelect = document.getElementById('registerWilaya');
    if (wilayaSelect) {
        wilayaSelect.innerHTML = '<option value="">اختر الولاية</option>' +
            DZ_WILAYAS.map(w => `<option value="${w}">${w}</option>`).join('');
    }

    // تعبئة قائمة المطارات تلقائياً
    async function fillAirportsCheckboxes() {
        const airportsDiv = document.getElementById('airportsCheckboxes');
        if (airportsDiv) {
            airportsDiv.innerHTML = '<span style="color:#ffeba7;font-size:13px;">جاري تحميل المطارات...</span>';
            try {
                const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/agency/airports');
                const data = await res.json();
                airportsDiv.innerHTML = '';
                data.forEach(airport => {
                    const label = document.createElement('label');
                    label.style.display = 'flex';
                    label.style.alignItems = 'center';
                    label.style.gap = '4px';
                    label.style.background = '#23243a';
                    label.style.color = '#ffeba7';
                    label.style.fontSize = '13px';
                    label.style.padding = '2px 8px';
                    label.style.borderRadius = '4px';
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = 'airports[]';
                    checkbox.value = airport.id;
                    checkbox.style.width = '16px';
                    checkbox.style.height = '16px';
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(` ${airport.name} (${airport.code})`));
                    airportsDiv.appendChild(label);
                });
            } catch (e) {
                airportsDiv.innerHTML = '<span style="color:#d32f2f;font-size:13px;">تعذر تحميل المطارات</span>';
            }
        }
    }
    fillAirportsCheckboxes();

    // دالة resetForm لمسح الحقول
    function resetForm(form) {
        if (!form) return;
        form.reset();
        const msg = form.querySelector('.login-message');
        if (msg) msg.textContent = '';
        // إزالة معاينة الصور
        const previews = form.querySelectorAll('.img-preview');
        previews.forEach(p => p.remove());
    }

    // تحقق فوري للحقول
    document.querySelectorAll('.form-style').forEach(input => {
        input.addEventListener('input', function() {
            this.style.borderColor = this.value.trim() !== '' ? '#ffeba7' : '#d32f2f';
            // إذا كان input من نوع file أظهر معاينة
            if (this.type === 'file' && this.files && this.files[0]) {
                let preview = this.parentElement.querySelector('.img-preview');
                if (!preview) {
                    preview = document.createElement('img');
                    preview.className = 'img-preview';
                    preview.style.maxWidth = '60px';
                    preview.style.maxHeight = '60px';
                    preview.style.margin = '8px 0 0 0';
                    preview.style.display = 'block';
                    this.parentElement.appendChild(preview);
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            } else if (this.type === 'file') {
                let preview = this.parentElement.querySelector('.img-preview');
                if (preview) preview.remove();
            }
        });
    });

    // تلميحات Tooltips للأيقونات
    document.querySelectorAll('.input-icon').forEach(icon => {
        icon.style.cursor = 'help';
    });

    // تحقق من صحة البريد
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    // تحقق من رقم الهاتف (جزائري)
    function isValidPhone(phone) {
        return /^0[5-7][0-9]{8}$/.test(phone);
    }

    // مؤشّر تحميل
    function showLoading(msgElem) {
        if (msgElem) {
            msgElem.innerHTML = '<span class="spinner" style="display:inline-block;width:18px;height:18px;border:2px solid #ffeba7;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;"></span> جارٍ المعالجة...';
        }
    }

    // حركة spinner
    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`;
    document.head.appendChild(style);

    // Toggle بين login وregister

    const card3dWrap = document.querySelector('.card-3d-wrap');
    let isLogin = true;
    // تعريف أحداث زر التبديل مرة واحدة فقط
    const toggleToRegisterBtn = document.getElementById('toggleToRegisterBtn');
    const toggleToLoginBtn = document.getElementById('toggleToLoginBtn');
    if (toggleToRegisterBtn) {
        toggleToRegisterBtn.addEventListener('click', function() {
            isLogin = false;
            updateAuthView();
        });
    }
    if (toggleToLoginBtn) {
        toggleToLoginBtn.addEventListener('click', function() {
            isLogin = true;
            updateAuthView();
        });
    }
    function updateAuthView() {
        if (!card3dWrap) return;
        if (isLogin) {
            card3dWrap.classList.remove('signup-mode');
        } else {
            card3dWrap.classList.add('signup-mode');
        }
    }
    // عند تحميل الصفحة، حدث العرض الأولي
    updateAuthView();

    // Login logic
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            loginMessage.textContent = '';
            const email = document.getElementById('agencyEmail').value.trim();
            const password = document.getElementById('agencyPassword').value;
            if (!email || !password) {
                showToast('يرجى إدخال البريد الإلكتروني وكلمة المرور.', 'error');
                return;
            }
            if (!isValidEmail(email)) {
                showToast('صيغة البريد الإلكتروني غير صحيحة.', 'error');
                return;
            }
            showLoading(loginMessage);
            try {
                const response = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/agency/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok && data.token && data.agency) {
                    showToast('تم تسجيل الدخول بنجاح!', 'success');
                    resetForm(loginForm);
                    // حفظ التوكن وبيانات الوكالة وrefresh_token في localStorage
                    localStorage.setItem('agency_token', data.token);
                    if (data.refresh_token) localStorage.setItem('agency_refresh_token', data.refresh_token);
                    localStorage.setItem('agency_info', JSON.stringify(data.agency));
                    // الجديد: حفظ بيانات الوكالة مع id في agency_data
                    localStorage.setItem('agency_data', JSON.stringify({ id: data.agency.id, name: data.agency.name, email: data.agency.email }));
                    setTimeout(() => {
                        window.location.href = '../agencie/dashboard.html';
                    }, 1200);
                } else {
                    showToast(data.error || 'فشل تسجيل الدخول', 'error');
                }
            } catch (err) {
                showToast('حدث خطأ في الاتصال بالخادم', 'error');
            }
        });
    }

    // Register logic
    const registerForm = document.getElementById('registerForm');
    const registerMessage = document.getElementById('registerMessage');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            registerMessage.textContent = '';
            // جلب جميع الحقول المطلوبة
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const password = document.getElementById('registerPassword').value;
            const wilayaElem = document.getElementById('registerWilaya');
            const wilaya = wilayaElem && wilayaElem.value ? wilayaElem.value : '';
            let airports = [];
            document.querySelectorAll('#airportsCheckboxes input[type="checkbox"]:checked').forEach(cb => {
                airports.push(cb.value);
            });
            const license_number = document.getElementById('registerLicense').value.trim();
            const phone = document.getElementById('registerPhone').value.trim();
            const bank_account = document.getElementById('registerBankAccount').value.trim();
            const location_name = document.getElementById('registerLocationName').value.trim();
            const latitude = document.getElementById('registerLatitude').value.trim();
            const longitude = document.getElementById('registerLongitude').value.trim();
            const logo = document.getElementById('registerLogo').files[0];
            const background = document.getElementById('registerBackground').files[0];
            // التحقق من الموافقة على الشروط
            const acceptPolicy = document.getElementById('acceptPolicy');
            if (!acceptPolicy || !acceptPolicy.checked) {
                showToast('يجب الموافقة على سياسة الشروط والخصوصية قبل إنشاء الحساب.', 'error');
                return;
            }
            // bank_account لم يعد إجباريًا
            if (!name || !email || !password || !wilaya || !airports.length || !license_number || !phone || !location_name || !latitude || !longitude) {
                showToast('يرجى تعبئة جميع الحقول.', 'error');
                return;
            }
            if (!isValidEmail(email)) {
                showToast('صيغة البريد الإلكتروني غير صحيحة.', 'error');
                return;
            }
            if (!isValidPhone(phone)) {
                showToast('رقم الهاتف غير صحيح (مثال: 0555123456)', 'error');
                return;
            }
            showLoading(registerMessage);
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('wilaya', wilaya);
            airports.forEach(a => formData.append('airports[]', a));
            formData.append('license_number', license_number);
            formData.append('phone', phone);
            if (bank_account) formData.append('bank_account', bank_account);
            formData.append('location_name', location_name);
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);
            if (logo) formData.append('logo', logo);
            if (background) formData.append('background', background);
            try {
                const response = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/agency/register', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (response.ok) {
                    showToast(data.message || 'تم إنشاء الحساب بنجاح!', 'success');
                    resetForm(registerForm);

                    setTimeout(() => {
                        isLogin = true;
                        updateAuthView();
                    }, 1200);
                } else {
                    showToast(data.error || 'فشل إنشاء الحساب', 'error');
                }
            } catch (err) {
                showToast('حدث خطأ في الاتصال بالخادم', 'error');
            }
        });
    }

    // زر إظهار/إخفاء المطارات
    const toggleAirportsBtn = document.getElementById('toggleAirportsBtn');
    const airportsDiv = document.getElementById('airportsCheckboxes');
    if (toggleAirportsBtn && airportsDiv) {
        toggleAirportsBtn.addEventListener('click', function() {
            if (airportsDiv.style.display === 'none' || airportsDiv.style.display === '') {
                airportsDiv.style.display = 'block';
                toggleAirportsBtn.textContent = 'إخفاء المطارات';
            } else {
                airportsDiv.style.display = 'none';
                toggleAirportsBtn.textContent = 'اختر المطارات';
            }
        });
    }

    // اقتراح العنوان عبر Nominatim
    const locationInput = document.getElementById('registerLocationName');
    const addressSuggestionsList = document.getElementById('addressSuggestionsList');
    if (locationInput) {
        locationInput.setAttribute('placeholder', 'اتركه فارغ إذا أردت تحديد الموقع من الخريطة');
    }
    if (locationInput && addressSuggestionsList) {
        let addressTimeout;
        const locationFormGroup = locationInput.closest('.form-group');
        let lastResults = [];
        locationInput.addEventListener('input', function() {
            clearTimeout(addressTimeout);
            const val = locationInput.value.trim();
            if (!val) {
                addressSuggestionsList.innerHTML = '';
                addressSuggestionsList.style.display = 'none';
                if (locationFormGroup) locationFormGroup.classList.remove('suggestions-visible');
                return;
            }
            addressTimeout = setTimeout(async () => {
                try {
                    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(val)}`;
                    const response = await fetch(url, { headers: { 'Accept-Language': 'ar,en' } });
                    let results = await response.json();
                    // تصفية النتائج للجزائر فقط
                    results = results.filter(place => {
                        if (place.address && place.address.country) {
                            return place.address.country.includes('Algeria') || place.address.country.includes('الجزائر');
                        }
                        // fallback: تحقق من display_name
                        return place.display_name.includes('Algeria') || place.display_name.includes('الجزائر');
                    });
                    lastResults = results;
                    if (results && results.length > 0) {
                        const list = results.slice(0, 5).map((place, idx) =>
                            `<div class=\"suggestion-item\" style=\"padding:8px;cursor:pointer;\" onclick=\"window.selectAddressSuggestion && window.selectAddressSuggestion(${idx})\">${place.display_name}</div>`
                        ).join('');
                        addressSuggestionsList.innerHTML = list;
                        addressSuggestionsList.style.display = 'block';
                        if (locationFormGroup) locationFormGroup.classList.add('suggestions-visible');
                    } else {
                        addressSuggestionsList.innerHTML = '';
                        addressSuggestionsList.style.display = 'none';
                        if (locationFormGroup) locationFormGroup.classList.remove('suggestions-visible');
                    }
                } catch (err) {
                    addressSuggestionsList.innerHTML = '';
                    addressSuggestionsList.style.display = 'none';
                    if (locationFormGroup) locationFormGroup.classList.remove('suggestions-visible');
                }
            }, 300);
        });
        window.selectAddressSuggestion = function(idx) {
            const place = lastResults[idx];
            if (!place) return;
            locationInput.value = place.display_name;
            addressSuggestionsList.innerHTML = '';
            addressSuggestionsList.style.display = 'none';
            if (locationFormGroup) locationFormGroup.classList.remove('suggestions-visible');
            // تعبئة خطوط الطول والعرض
            if (place.lat && place.lon) {
                document.getElementById('registerLatitude').value = place.lat;
                document.getElementById('registerLongitude').value = place.lon;
            }
            // تعبئة الولاية إذا وجدت
            if (place.address) {
                let wilaya = '';
                if (place.address.state) wilaya = place.address.state;
                else if (place.address.county) wilaya = place.address.county;
                else if (place.address.region) wilaya = place.address.region;
                const wilayaSelect = document.getElementById('registerWilaya');
                if (wilayaSelect && wilaya) {
                    for (let i = 0; i < wilayaSelect.options.length; i++) {
                        if (wilayaSelect.options[i].value === wilaya || wilayaSelect.options[i].text === wilaya) {
                            wilayaSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        };
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#registerLocationName') && !e.target.closest('#addressSuggestionsList')) {
                addressSuggestionsList.style.display = 'none';
                if (locationFormGroup) locationFormGroup.classList.remove('suggestions-visible');
            }
        });
    }

    // تحديد الموقع تلقائياً من المتصفح
    const getLocationBtn = document.getElementById('getLocationBtn');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', function() {
            if (!navigator.geolocation) {
                showToast('المتصفح لا يدعم تحديد الموقع الجغرافي', 'error');
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async function(pos) {
                    const lat = pos.coords.latitude;
                    const lon = pos.coords.longitude;
                    document.getElementById('registerLatitude').value = lat;
                    document.getElementById('registerLongitude').value = lon;
                    // جلب العنوان الكامل والولاية عبر reverse geocoding
                    try {
                        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar,en`;
                        const response = await fetch(url);
                        const data = await response.json();
                        if (data && data.display_name) {
                            document.getElementById('registerLocationName').value = data.display_name;
                        }
                        // تعبئة الولاية إذا وجدت
                        if (data && data.address) {
                            let wilaya = '';
                            if (data.address.state) wilaya = data.address.state;
                            else if (data.address.county) wilaya = data.address.county;
                            else if (data.address.region) wilaya = data.address.region;
                            const wilayaSelect = document.getElementById('registerWilaya');
                            if (wilayaSelect && wilaya) {
                                for (let i = 0; i < wilayaSelect.options.length; i++) {
                                    if (wilayaSelect.options[i].value === wilaya || wilayaSelect.options[i].text === wilaya) {
                                        wilayaSelect.selectedIndex = i;
                                        break;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        // لا شيء
                    }
                },
                function() {
                    showToast('تعذر الحصول على الموقع تلقائياً', 'error');
                },
                { enableHighAccuracy: true }
            );
        });
    }

    // نافذة الخريطة
    let map, marker;
    const openMapBtn = document.getElementById('openMapBtn');
    const mapModal = document.getElementById('mapModal');
    const closeMapBtn = document.getElementById('closeMapBtn');
    const confirmMapBtn = document.getElementById('confirmMapBtn');
    if (openMapBtn && mapModal) {
        openMapBtn.addEventListener('click', function() {
            mapModal.style.display = 'flex';
            mapModal.style.zIndex = '10000'; // أعلى من كل شيء
            mapModal.style.background = 'rgba(0,0,0,0.35)'; // تعتيم الخلفية
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                if (!window.L) return;
                if (!map) {
                    map = L.map('map').setView([28.0339, 1.6596], 5);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(map);
                    map.on('click', function(e) {
                        if (marker) marker.setLatLng(e.latlng);
                        else marker = L.marker(e.latlng, { draggable: true }).addTo(map);
                    });
                } else {
                    map.invalidateSize();
                }
            }, 200);
        });
    }
    if (closeMapBtn && mapModal) {
        closeMapBtn.addEventListener('click', function() {
            mapModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    if (confirmMapBtn) {
        confirmMapBtn.addEventListener('click', async function() {
            if (!marker) {
                showToast('اختر موقعاً من الخريطة أولاً', 'error');
                return;
            }
            const latlng = marker.getLatLng();
            document.getElementById('registerLatitude').value = latlng.lat;
            document.getElementById('registerLongitude').value = latlng.lng;
            // إذا كان حقل اسم الموقع فارغاً، جلب اسم الموقع عبر reverse geocoding
            const locationInput = document.getElementById('registerLocationName');
            if (locationInput && !locationInput.value.trim()) {
                try {
                    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&accept-language=ar,en`;
                    const response = await fetch(url);
                    const data = await response.json();
                    if (data && data.display_name) {
                        locationInput.value = data.display_name;
                    } else {
                        locationInput.value = 'الموقع المحدد على الخريطة';
                    }
                } catch (err) {
                    locationInput.value = 'الموقع المحدد على الخريطة';
                }
            }
            mapModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // إخفاء حقول وخانات وخطوط الطول والعرض واللابل المرتبط بهم
    const latitudeInput = document.getElementById('registerLatitude');
    const longitudeInput = document.getElementById('registerLongitude');
    if (latitudeInput) latitudeInput.style.display = 'none';
    if (longitudeInput) longitudeInput.style.display = 'none';
    // إخفاء جميع اللابل في الصفحة التي تحتوي على "خط العرض" أو "latitude"
    Array.from(document.querySelectorAll('label')).forEach(label => {
        if (label.textContent.includes('خط العرض') || label.textContent.toLowerCase().includes('latitude')) {
            label.style.display = 'none';
        }
        if (label.textContent.includes('خط الطول') || label.textContent.toLowerCase().includes('longitude')) {
            label.style.display = 'none';
        }
    });
});
