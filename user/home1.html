let selectedType = null;
let selectedPrice = 0;
let discountApplied = false;
let offer = null; // تعريف المتغير خارج الدالة
async function fetchOfferDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        document.getElementById('dynamic-offer-details').innerHTML = '<div style="color:red">لم يتم تحديد العرض</div>';
        return;
    }
    try {
        const res = await fetch(`https://almanassik-alarabi-server-v-01.onrender.com/api/user/offers/${id}`);
        offer = await res.json(); // تعيين العرض للمتغير الخارجي
        if (offer.error) {
            document.getElementById('dynamic-offer-details').innerHTML = `<div style='color:red'>${offer.error}</div>`;
            return;
        }
        // --- دعم الترجمة ---
        const lang = localStorage.getItem('lang') || document.documentElement.lang || 'ar';
        const t = window.offerDetailsTexts && window.offerDetailsTexts[lang] ? window.offerDetailsTexts[lang] : window.offerDetailsTexts['ar'];
        document.getElementById('dynamic-offer-details').innerHTML = `
            <div class="header">
                <h1>🕌 ${offer.title || t.pageTitle} 🕌</h1>
                <p class="subtitle">${t.pageSubtitle || 'رحلة روحانية إلى بيت الله الحرام'}</p>
            </div>
            <div class="agency-info">
                <img src="${offer.agencies.logo_url}" alt="شعار الوكالة" class="agency-logo">
                <div class="agency-details">
                    <h2>${offer.agencies.name}</h2>
                    <p>${t.agencyDesc || 'وكالة سفر معتمدة لتنظيم رحلات العمرة والحج'}</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=${offer.agencies.latitude},${offer.agencies.longitude}" target="_blank" style="color:#1976d2;text-decoration:underline;">${t.agencyMap || 'موقع الوكالة على الخريطة'}</a>
                </div>
            </div>
            <div class="main-content">
                <div class="offer-image" id="offer-image-container">
                    <img src="${offer.main_image}" alt="${t.mainImageAlt || 'صورة العرض الرئيسية'}" id="offer-main-image" style="cursor:zoom-in;">
                </div>
                <div class="offer-details">
                    <div class="detail-item"><span class="detail-label">📅 ${t.departureDate || 'تاريخ الرحلة'}</span><span class="detail-value">${offer.departure_date}</span></div>
                    <div class="detail-item"><span class="detail-label">🏠 ${t.returnDate || 'تاريخ العودة'}</span><span class="detail-value">${offer.return_date}</span></div>
                                        <div class="detail-item"><span class="detail-label">🛫 ${t.flightType || 'نوع الرحلة'}</span><span class="detail-value">${offer.flight_type}</span></div>
                    <div class="detail-item"><span class="detail-label">⏰ ${t.duration || 'مدة الرحلة'}</span><span class="detail-value">${offer.duration_days} ${t.days || 'يوم'}</span></div>
                    <div class="detail-item"><span class="detail-label">📍 ${t.entry || 'نقطة الدخول'}</span><span class="detail-value">${offer.entry}</span></div>
                    <div class="detail-item"><span class="detail-label">📍 ${t.exit || 'نقطة الخروج'}</span><span class="detail-value">${offer.exit}</span></div>
                    <div class="detail-item"><span class="detail-label">🏨 ${t.hotelName || 'اسم الفندق'}</span><span class="detail-value">${offer.hotel_name}</span></div>
                    <div class="detail-item"><span class="detail-label">📏 ${t.hotelDistance || 'المسافة من الحرم'}</span><span class="detail-value">${offer.hotel_distance} ${t.km || 'كم'}</span></div>
                </div>
            </div>
            <div class="decorative-pattern"></div>
            <div class="services-section">
                <h2 class="services-title">${t.servicesTitle || 'الخدمات المشمولة في العرض'}</h2>
                <div class="services-grid">
                    ${offer.services.visa ? `<div class="service-card"><div class="service-icon">📋</div><h3>${t.serviceVisa || 'استخراج الفيزا'}</h3></div>` : ''}
                    ${offer.services.guide ? `<div class="service-card"><div class="service-icon">🧭</div><h3>${t.serviceGuide || 'مرشد ديني'}</h3></div>` : ''}
                    ${offer.services.meals ? `<div class="service-card"><div class="service-icon">🍽️</div><h3>${t.serviceMeals || 'الوجبات'}</h3></div>` : ''}
                    ${offer.services.flight ? `<div class="service-card"><div class="service-icon">✈️</div><h3>${t.serviceFlight || 'الطيران'}</h3></div>` : ''}
                    ${offer.services.transport ? `<div class="service-card"><div class="service-icon">🚌</div><h3>${t.serviceTransport || 'النقل'}</h3></div>` : ''}
                </div>
            </div>
            <div class="hotel-section">
                <h2 class="hotel-title">🏨 ${t.hotelTitle || 'الإقامة الفندقية'}</h2>
                ${offer.hotel_images && offer.hotel_images.length ? `<img src="${offer.hotel_images[0]}" alt="${t.hotelImageAlt || 'صورة الفندق'}" class="hotel-image">` : ''}
                <div class="detail-item"><span class="detail-label">${t.hotelName || 'اسم الفندق'}</span><span class="detail-value">${offer.hotel_name}</span></div>
                <div class="detail-item"><span class="detail-label">${t.hotelDistance2 || t.hotelDistance || 'المسافة من الحرم المكي'}</span><span class="detail-value">${offer.hotel_distance} ${t.km || 'كيلومتر'}</span></div>
            </div>
            <div class="pricing-section" id="interactive-pricing">
                <h2 class="pricing-title">💰 ${t.pricingTitle || 'أسعار الرحلة'}</h2>
                <div class="pricing-grid" id="room-type-grid">
                    <div class="price-card" data-type="double" data-price="${offer.price_double}">
                        <div class="price-icon">👤👤</div>
                        <div class="price-type">${t.doubleRoom || 'ثنائي'}</div>
                        <div class="price-amount">${offer.price_double} ${t.dzd || 'Dz'}</div>
                    </div>
                    <div class="price-card" data-type="triple" data-price="${offer.price_triple}">
                        <div class="price-icon">👤👤👤</div>
                        <div class="price-type">${t.tripleRoom || 'ثلاثي'}</div>
                        <div class="price-amount">${offer.price_triple} ${t.dzd || 'Dz'}</div>
                    </div>
                    <div class="price-card" data-type="quad" data-price="${offer.price_quad}">
                        <div class="price-icon">👤👤👤👤</div>
                        <div class="price-type">${t.quadRoom || 'رباعي'}</div>
                        <div class="price-amount">${offer.price_quad} ${t.dzd || 'Dz'}</div>
                    </div>
                    <div class="price-card" data-type="quint" data-price="${offer.price_quint}">
                        <div class="price-icon">👤👤👤👤👤</div>
                        <div class="price-type">${t.quintRoom || 'خماسي'}</div>
                        <div class="price-amount">${offer.price_quint} ${t.dzd || 'Dz'}</div>
                    </div>
                </div>
            </div>
            <div class="decorative-pattern"></div>
            <div id="total-price-box" style="margin:20px 0;font-size:1.3em;color:#2d5a2d;font-weight:bold;text-align:center;"></div>
            <div id="discount-msg" style="color:#d4af37;text-align:center;font-weight:bold;"></div>
            <div style="display:flex;justify-content:center;gap:20px;margin-bottom:20px;">
                <button id="discount-btn" class="cta-button gift-btn" style="background:rgba(212,175,55,0.12);color:#2d5a2d;position:relative;overflow:hidden;">
                    <span class="gift-icon">🎁</span> <span>${t.discountBtn || ' هدية المناسك بقيمة 10000 د.ج'}</span>
                    <span class="gift-anim" style="display:none;"></span>
                </button>
                <button id="booking-btn" class="cta-button">${t.bookNow || 'الحجز الآن'}</button>
            </div>
            <div id="booking-form-box" style="display:none;margin-top:20px;text-align:center;">
                <form id="booking-form" style="max-width:400px;margin:auto;background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 8px #ccc;">
                    <h3 style="margin-bottom:15px;color:#2d5a2d;">${t.bookingFormTitle || 'استمارة طلب الحجز'}</h3>
                    <input type="text" name="full_name" placeholder="${t.fullName || 'الاسم الكامل'}" required style="width:100%;margin-bottom:10px;padding:8px;border-radius:6px;border:1px solid #ccc;">
                    <input type="text" name="phone" placeholder="${t.phone || 'رقم الهاتف'}" required style="width:100%;margin-bottom:10px;padding:8px;border-radius:6px;border:1px solid #ccc;">

                    <div id="passport-image-preview" style="margin-top:10px;">
                    <p>${t.passportImage || 'صورة جواز السفر'} :</p>
                        <input type="file" id="passport-image-input" accept="image/*" placeholder="${t.passportImage || 'صورة جواز السفر'}" required style="width:100%;margin-bottom:10px;">
                    </div>
                    <button type="submit" class="cta-button" style="width:100%;margin-top:10px;">${t.confirmBooking || 'تأكيد طلب الحجز'}</button>
                    <div id="form-total-price" style="margin-top:10px;font-size:1.2em;color:#2d5a2d;"></div>
                </form>
                <div id="booking-result" style="margin-top:15px;"></div>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #2d5a2d; font-style: italic;">
                <p>"وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍ"</p>
                <p style="font-size: 0.9em; margin-top: 10px;">${t.ayahRef || 'سورة الحج - آية 27'}</p>
            </div>
        `; // إغلاق القالب النصي هنا بشكل صحيح
        // إضافة منطق تكبير الصورة بعد تحميل التفاصيل
        setTimeout(() => {
            const img = document.getElementById('offer-main-image');
            if (!img) return;
            let zoomed = false;
            img.addEventListener('click', function() {
                if (!zoomed) {
                    img.style.position = 'fixed';
                    img.style.top = '50%';
                    img.style.left = '50%';
                    img.style.transform = 'translate(-50%, -50%) scale(1.2)';
                    img.style.zIndex = '9999';
                    img.style.boxShadow = '0 0 40px #0008';
                    img.style.maxWidth = '90vw';
                    img.style.maxHeight = '90vh';
                    img.style.cursor = 'zoom-out';
                    img.style.background = '#fff';
                    document.body.style.overflow = 'hidden';
                    zoomed = true;
                } else {
                    img.style.position = '';
                    img.style.top = '';
                    img.style.left = '';
                    img.style.transform = '';
                    img.style.zIndex = '';
                    img.style.boxShadow = '';
                    img.style.maxWidth = '';
                    img.style.maxHeight = '';
                    img.style.cursor = 'zoom-in';
                    img.style.background = '';
                    document.body.style.overflow = '';
                    zoomed = false;
                }
            });
        }, 100);
        } catch (e) {
            document.getElementById('dynamic-offer-details').innerHTML = '<div style="color:red">حدث خطأ أثناء جلب التفاصيل: ' + e.message + '</div>';
            console.error('Fetch offer details error:', e);
        }
    }


// إضافة منطق التفاعل بعد تحميل تفاصيل العرض
function setupOfferInteractions() {
    // اختيار نوع الغرفة
    const priceCards = document.querySelectorAll('.price-card');
    const totalPriceBox = document.getElementById('total-price-box');
    let finalPrice = 0;
    priceCards.forEach(card => {
        card.addEventListener('click', function() {
            priceCards.forEach(c => c.classList.remove('selected-room'));
            this.classList.add('selected-room');
            selectedType = this.getAttribute('data-type');
            selectedPrice = parseInt(this.getAttribute('data-price'));
            finalPrice = selectedPrice - (discountApplied ? 10000 : 0);
            if (discountApplied) {
                const discountValue = 10000;
                totalPriceBox.innerHTML = `<span style=\"color:#888;text-decoration:line-through;font-size:0.95em;\">${selectedPrice} د.ج</span> <span style=\"color:#2d5a2d;font-weight:bold;\">${finalPrice} د.ج</span> <span style=\"color:#bfa100;font-size:0.95em;\">(${discountValue * 1} د .ج)</span>`;
            } else {
                totalPriceBox.textContent = `السعر الإجمالي: ${finalPrice} د.ج`;
            }
        });
    });

    // زر هدية المناسك
    const discountBtn = document.getElementById('discount-btn');
    const discountMsg = document.getElementById('discount-msg');
    discountBtn.addEventListener('click', function() {
        if (!selectedType) {
            discountMsg.textContent = 'يرجى اختيار نوع الغرفة أولاً.';
            return;
        }
        if (!discountApplied) {
            discountApplied = true;
            finalPrice = selectedPrice - 10000;
            const discountValue = 10000;
            totalPriceBox.innerHTML = `<span style=\"color:#888;text-decoration:line-through;font-size:0.95em;\">${selectedPrice} د.ج</span> <span style=\"color:#2d5a2d;font-weight:bold;\">${finalPrice} د.ج</span> <span style=\"color:#bfa100;font-size:0.95em;\">(${discountValue * 1}- د.ج)</span>`;
            discountMsg.textContent = '🎁 لقد استفدت من  هدية المناسك!';
            discountBtn.classList.add('selected-discount');
        } else {
            discountMsg.textContent = 'تم تطبيق هدية المناسك مسبقاً.';
            discountBtn.classList.add('selected-discount');
        }
    });
    // إذا كان هدية المناسك مطبق بالفعل (مثلاً عند إعادة تحميل الصفحة)
    if (discountApplied) {
        discountBtn.classList.add('selected-discount');
    }

    // زر الحجز
    const bookingBtn = document.getElementById('booking-btn');
    const bookingFormBox = document.getElementById('booking-form-box');
    bookingBtn.addEventListener('click', function() {
        if (!selectedType) {
            discountMsg.textContent = 'يرجى اختيار نوع الغرفة أولاً.';
            return;
        }
        bookingFormBox.style.display = 'block';
        discountMsg.textContent = '';
        // تحديث المبلغ الإجمالي في الاستمارة
        document.getElementById('form-total-price').textContent = `المبلغ الإجمالي: ${finalPrice} د.ج`;
    });

    // إرسال الاستمارة
    const bookingForm = document.getElementById('booking-form');
    const bookingResult = document.getElementById('booking-result');
    const passportInput = document.getElementById('passport-image-input');
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        bookingResult.textContent = 'جاري إرسال الحجز...';
        const full_name = bookingForm.full_name.value;
        const phone = bookingForm.phone.value;
        const file = passportInput.files[0];
        const formData = new FormData();
        formData.append('offer_id', offer.id);
        formData.append('full_name', full_name);
        formData.append('phone', phone);
        formData.append('room_type', selectedType);
        formData.append('discount_applied', discountApplied); // إرسال قيمة منطقية مباشرة
        // إضافة السعر السابق وقيمة الهدية
        let priceBeforeDiscount = selectedPrice;
        let discountValue = discountApplied ? 10000 : 0;
        let finalPrice = discountApplied ? (selectedPrice - 10000) : selectedPrice;
        formData.append('price_before_discount', priceBeforeDiscount);
        formData.append('discount', discountValue);
        formData.append('final_price', finalPrice);
        if (file) {
            formData.append('passport_image', file, file.name); // إضافة صورة الجواز إذا وجدت
        }
        try {
            const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/user/offers/bookings', {
                method: 'POST',
                body: formData
            });
            // تحقق من حالة الاستجابة
            if (!res.ok) {
                const errorText = await res.text();
                bookingResult.textContent = `❌ خطأ في الاستجابة من الخادم: ${res.status} - ${errorText}`;
                return;
            }
            const result = await res.json();
            if (result.success) {
                let message = '<div style="color:#2d5a2d;font-size:1.2em;font-weight:bold;">';
                message += '<span style="font-size:2em;">🎉🎁</span><br>';
                message += '✅ تم إرسال الحجز بنجاح! سيتم الاتصال بك قريباً.';
                if (discountApplied) {
                    message += '<br><span style="color:#d4af37;font-size:1.1em;">🎁 لقد استفدت من هدية المناسك!</span>';
                }
                message += '</div>';
                bookingResult.innerHTML = message;
                bookingForm.reset();
                // تجهيز كائن الحجز بكافة الحقول المطلوبة
                const booking = result.booking;
                booking.offer_title = offer.title;
                booking.final_price = finalPrice;
                booking.price_before_discount = priceBeforeDiscount;
                booking.discount = discountValue;
                booking.persons = 1;
                // تنسيق التاريخ للعرض العربي
                if (booking.created_at) {
                    const dateObj = new Date(booking.created_at);
                    booking.bookingDate = dateObj.toLocaleDateString('ar-SA');
                }
                const bookingJson = JSON.stringify(booking);
                const encodedBooking = encodeURIComponent(bookingJson);
                setTimeout(function() {
                    window.location.href = `booking-success.html?booking=${encodedBooking}`;
                }, 2500);
            } else {
                bookingResult.textContent = `❌ خطأ أثناء إرسال الحجز: ${result.error || ''} ${(result.details || '')}`;
            }
        } catch (err) {
            bookingResult.textContent = `❌ خطأ في الاتصال بالخادم: ${err.message}`;
            console.error('تفاصيل الخطأ في الاتصال:', err);
        }
    });
}

// استدعاء الدالة عند تحميل الصفحة
fetchOfferDetails();

// إضافة CSS ديناميكي لتأثير الزر عند تطبيق هدية المناسك وتحديد نوع الغرفة
function injectDynamicStyles() {
    if (document.getElementById('dynamic-offer-style')) return;
    const style = document.createElement('style');
    style.id = 'dynamic-offer-style';
    style.innerHTML = `
        #discount-btn.selected-discount, #discount-btn.selected-discount:focus {
            background: linear-gradient(90deg, #ffe082 0%, #fff8e1 100%) !important;
            color: #bfa100 !important;
            border: 2px solid #d4af37 !important;
            box-shadow: 0 0 10px #ffe08299;
            font-weight: bold;
            outline: none;
        }
        .price-card.selected-room {
            border: 2px solid #1976d2 !important;
            background: #e3f2fd !important;
            box-shadow: 0 0 8px #1976d255;
            font-weight: bold;
            color: #1976d2;
            position: relative;
        }
        .price-card.selected-room::after {
            content: "✓";
            position: absolute;
            top: 8px;
            left: 8px;
            color: #388e3c;
            font-size: 1.2em;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
}
injectDynamicStyles();

// بعد جلب التفاصيل، فعل التفاعلات
window.addEventListener('DOMContentLoaded', () => {
    // ننتظر قليلاً حتى يتم تحميل التفاصيل
    setTimeout(setupOfferInteractions, 700);
});

if (window.setLanguage) {
    const origSetLanguage = window.setLanguage;
    window.setLanguage = function(lang) {
        origSetLanguage(lang);
        // إعادة بناء تفاصيل العرض وتفعيل الأحداث بعد تغيير اللغة
        fetchOfferDetails();
        setTimeout(setupOfferInteractions, 700);
    };
}

window.offerDetailsTexts = {
  ar: {
    pageTitle: "تفاصيل العرض",
    pageSubtitle: "رحلة روحانية إلى بيت الله الحرام",
    flightType: "نوع الرحلة",
    departureDate: "تاريخ الرحلة",
    returnDate: "تاريخ العودة",
    duration: "مدة الرحلة",
    days: "يوم",
    entry: "نقطة الدخول",
    exit: "نقطة الخروج",
    hotelName: "اسم الفندق",
    hotelDistance: "المسافة من الحرم",
    km: "كم",
    doubleRoom: "ثنائي",
    tripleRoom: "ثلاثي",
    quadRoom: "رباعي",
    quintRoom: "خماسي",
    discountBtn: " هدية المناسك بقيمة 10000 د.ج",
    bookNow: "طلب الحجز",
    bookingFormTitle: "استمارة طلب الحجز",
    passportImage:"قم بتحميل صورة جواز السفر",
    fullName: "الاسم الكامل",
    phone: "رقم الهاتف",
    confirmBooking: "تأكيد طلب الحجز",
    pricingTitle: "أسعار الرحلة",
    servicesTitle: "الخدمات المشمولة في العرض",
    hotelTitle: "الإقامة الفندقية",
    ayahRef: "سورة الحج - آية 27",
    serviceVisa: "استخراج الفيزا",
    serviceVisaDesc: "خدمة استخراج التأشيرة",
    serviceGuide: "مرشد ديني",
    serviceGuideDesc: "مرشد متخصص للإرشاد",
    serviceMeals: "الوجبات",
    serviceMealsDesc: "وجبات متنوعة وشهية",
    serviceFlight: "الطيران",
    serviceFlightDesc: "تذاكر الطيران ذهاب وإياب",
    serviceTransport: "النقل",
    serviceTransportDesc: "النقل الداخلي المريح",
  },
  fr: {
    pageTitle: "Détails de l'offre",
    pageSubtitle: "Voyage spirituel à la Mecque",
    flightType: "Type de vol",
    departureDate: "Date de départ",
    returnDate: "Date de retour",
    duration: "Durée du voyage",
    days: "jour",
    entry: "Point d'entrée",
    exit: "Point de sortie",
    hotelName: "Nom de l'hôtel",
    hotelDistance: "Distance de la mosquée",
    km: "km",
    doubleRoom: "Double",
    tripleRoom: "Triple",
    quadRoom: "Quadruple",
    quintRoom: "Quintuple",
    discountBtn: "Cadeau de rites d'une valeur de 10000 DZD",
    bookNow: "Demander la réservation",
    bookingFormTitle: "Formulaire de réservation",
        passportImage:"Téléchargez une photo du passeport",

    fullName: "Nom complet",
    phone: "Numéro de téléphone",
    confirmBooking: "Confirmer la réservation",
    pricingTitle: "Prix du voyage",
    servicesTitle: "Services inclus dans l'offre",
    hotelTitle: "Hébergement à l'hôtel",
    ayahRef: "Sourate Al-Hajj - Verset 27",
    serviceVisa: "Obtention du visa",
    serviceVisaDesc: "Service d'obtention du visa",
    serviceGuide: "Guide religieux",
    serviceGuideDesc: "Guide spécialisé pour l'orientation",
    serviceMeals: "Repas",
    serviceMealsDesc: "Repas variés et délicieux",
    serviceFlight: "Vol",
    serviceFlightDesc: "Billets d'avion aller-retour",
    serviceTransport: "Transport",
    serviceTransportDesc: "Transport intérieur confortable",
  }
};
