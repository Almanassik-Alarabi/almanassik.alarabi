// بيانات الطلبيات
let bookings = [];
let agencies = [];
let offersByAgency = {};
// جلب الحجوزات من API الجديد (pending ثم accepted)
async function fetchBookings() {
  let token = localStorage.getItem('agency_token');
  let agency = null;
  try {
    agency = JSON.parse(localStorage.getItem('agency_data'));
  } catch(e) {}
  if (!token || !agency || !agency.id) {
    alert('يرجى تسجيل الدخول كوكالة وليس كمدير عام.');
    bookings = [];
    return;
  }
  let pending = [], accepted = [];
  try {
    // جلب الطلبات بانتظار الموافقة
    const resPending = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/agency/bookings/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataPending = await resPending.json();
    pending = Array.isArray(dataPending.bookings) ? dataPending.bookings : [];
    // تأكد من وجود الحقل status لكل طلب
    pending = pending.map(b => ({ ...b, status: b.status || 'بانتظار موافقة الوكالة' }));
  } catch(e) { pending = []; }
  try {
    // جلب الطلبات المقبولة
    const resAccepted = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/agency/bookings/accepted', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dataAccepted = await resAccepted.json();
    accepted = Array.isArray(dataAccepted.bookings) ? dataAccepted.bookings : [];
    // تأكد من وجود الحقل status لكل طلب مقبول
    accepted = accepted.map(b => ({ ...b, status: b.status || 'مقبول' }));
  } catch(e) { accepted = []; }
  // دمج القائمتين: بانتظار الموافقة أولاً ثم المقبولة
  bookings = [...pending, ...accepted];
}

// جلب الوكالات والعروض
async function fetchAgenciesAndOffers() {
  // نفترض وجود endpoint لجلب الوكالات والعروض
  try {
    let token = localStorage.getItem('agency_token');
    const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/agency/offers', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    agencies = Array.isArray(data.agencies) ? data.agencies : [];
    offersByAgency = data.offersByAgency || {};
  } catch(e) { agencies = []; offersByAgency = {}; }
}

// عرض الحجوزات في الجدول
function renderBookingsTable() {
  const tbody = document.querySelector('#ordersTable tbody');
  if (!tbody) return;
  // تصفية حسب البحث والحالة
  const searchVal = document.getElementById('searchRequests').value.trim();
  const statusVal = document.getElementById('statusFilter').value;
  let filtered = bookings.filter(b => {
    // استبعاد الحجوزات التي حالتها "قيد الانتظار"
    if (b.status === 'قيد الانتظار') return false;
    let match = true;
    if (searchVal) {
      // البحث حسب اسم المعتمر أو رقم الهاتف أو اسم العرض
      match = (b.full_name?.includes(searchVal) || b.phone?.includes(searchVal) || b.offer_title?.includes(searchVal));
    }
    if (statusVal) {
      match = match && b.status === statusVal;
    }
    return match;
  });
  // ترتيب: بانتظار الموافقة أولاً ثم المقبولة
  filtered = filtered.sort((a, b) => {
    if (a.status === 'بانتظار موافقة الوكالة' && b.status !== 'بانتظار موافقة الوكالة') return -1;
    if (a.status !== 'بانتظار موافقة الوكالة' && b.status === 'بانتظار موافقة الوكالة') return 1;
    return 0;
  });
  tbody.innerHTML = filtered.map(b => {
    const offerTitle = b.offer_title || '-';
    // اسم المعتمر ورقم الهاتف يظهران فقط إذا كان الطلب مقبولاً، وإلا يتم إخفاؤهما
    let fullName = (b.full_name || '-')
    let phone = (b.phone || '-')
    if (b.status !== 'مقبول') {
      fullName = '--';
      phone = '--';
    }
    let actions = '';
    if (b.status === 'مقبول') {
      actions = `<div class="action-btns" style="gap:0;justify-content:center;align-items:center;">
        <button class="btn-action btn-details" style="background:linear-gradient(120deg,#36b9cc,#1cc88a);color:#fff;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:1.3em;box-shadow:0 2px 8px #36b9cc22;" title="تفاصيل" onclick="showBookingDetails('${b.id}')">
          <i class="fas fa-eye"></i>
        </button>
      </div>`;
    } else if (b.status === 'بانتظار موافقة الوكالة') {
      actions = `<div class="action-btns" style="gap:10px;justify-content:center;align-items:center;">
        <button class="btn-action btn-send" style="background:linear-gradient(120deg,#2ca87f,#176a3d);color:#fff;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:1.3em;box-shadow:0 2px 8px #2ca87f22;" title="موافقة" onclick="acceptBooking('${b.id}')">
          <i class="fas fa-check"></i>
        </button>
        <button class="btn-action btn-delete" style="background:linear-gradient(120deg,#c0392b,#e74a3b);color:#fff;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:1.3em;box-shadow:0 2px 8px #c0392b22;" title="رفض" onclick="deleteBooking('${b.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>`;
    } else {
      actions = `<div class="action-btns" style="gap:0;justify-content:center;align-items:center;">
        <button class="btn-action btn-delete" style="background:linear-gradient(120deg,#c0392b,#e74a3b);color:#fff;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:1.3em;box-shadow:0 2px 8px #c0392b22;" title="رفض" onclick="deleteBooking('${b.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>`;
    }
    return `
      <tr>
        <td>${fullName}</td>
        <td>${phone}</td>
        <td>${offerTitle}</td>
        <td>${formatDate(b.created_at)}</td>
        <td>${actions}</td>
      </tr>
    `;
  }).join('');
}

// زر التفاصيل (سيتم تحديد عمله لاحقاً)
window.showBookingDetails = function(id) {
  // جلب تفاصيل الحجز من الـ API وعرضها في مودال
  let token = localStorage.getItem('agency_token');
  if (!token) {
    alert('يرجى تسجيل الدخول كوكالة.');
    return;
  }
  // إظهار لودر بسيط
  const modalContent = document.getElementById('bookingDetailsContent');
  modalContent.innerHTML = '<div style="text-align:center;padding:2rem;"><span class="loader" style="display:inline-block;width:32px;height:32px;border:4px solid #eee;border-top:4px solid #176a3d;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;"></span> جاري تحميل التفاصيل...</div>';
  // فتح المودال
  const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
  modal.show();
  fetch(`https://almanassik-alarabi-server-v-01.onrender.com/api/agency/bookings/${id}/details`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'ok' && data.details) {
        const b = data.details;
        // بناء تفاصيل الطلب بشكل عرضي (صف واحد) وصورة الجواز بجانب البيانات
        // ترجمة نوع الغرفة
        function getRoomTypeText(roomType) {
          if (!roomType) return '-';
          const map = {
            'single': { ar: 'فردي', en: 'Single', fr: 'Simple' },
            'double': { ar: 'ثنائي', en: 'Double', fr: 'Double' },
            'triple': { ar: 'ثلاثي', en: 'Triple', fr: 'Triple' },
            'quad': { ar: 'رباعي', en: 'Quad', fr: 'Quadruple' },
            'quint': { ar: 'خماسي', en: 'Quint', fr: 'Quintuple' },
            'sext': { ar: 'سداسي', en: 'Sext', fr: 'Sextuple' }
          };
          let key = String(roomType).toLowerCase();
          return map[key] || { ar: roomType, en: roomType, fr: roomType };
        }
        const roomTypeObj = getRoomTypeText(b.room_type);
        modalContent.innerHTML = `
          <div style="display:flex;flex-direction:row;gap:32px;align-items:flex-start;min-width:700px;">
            <div style="flex:1;display:flex;flex-direction:row;flex-wrap:wrap;gap:1.2rem 2.5rem;">
              <div style="background:#f8f9fa;border-radius:7px;padding:0.7rem 1rem;box-shadow:0 1px 6px #eee;"><strong><span data-ar="اسم المعتمر:" data-en="Pilgrim Name:" data-fr="Nom du pèlerin :">اسم المعتمر:</span></strong> ${b.full_name || '-'} </div>
              <div style="background:#f8f9fa;border-radius:7px;padding:0.7rem 1rem;box-shadow:0 1px 6px #eee;"><strong><span data-ar="رقم الهاتف:" data-en="Phone Number:" data-fr="Téléphone :">رقم الهاتف:</span></strong> ${b.phone || '-'} </div>
              <div style="background:#f8f9fa;border-radius:7px;padding:0.7rem 1rem;box-shadow:0 1px 6px #eee;"><strong><span data-ar="العرض:" data-en="Offer:" data-fr="Offre :">العرض:</span></strong> ${b.offers?.title || '-'} </div>
              <div style="background:#f8f9fa;border-radius:7px;padding:0.7rem 1rem;box-shadow:0 1px 6px #eee;">
                <strong><span data-ar="نوع الغرفة:" data-en="Room Type:" data-fr="Type de chambre :">نوع الغرفة:</span></strong> 
                <span data-ar="${roomTypeObj.ar || '-'}" data-en="${roomTypeObj.en || '-'}" data-fr="${roomTypeObj.fr || '-'}">${roomTypeObj.ar || '-'}</span>
              </div>
              <div style="background:#f8f9fa;border-radius:7px;padding:0.7rem 1rem;box-shadow:0 1px 6px #eee;"><strong><span data-ar="تاريخ الطلب:" data-en="Request Date:" data-fr="Date de la demande :">تاريخ الطلب:</span></strong> ${formatDate(b.created_at)} </div>
              <div style="background:#f8f9fa;border-radius:7px;padding:0.7rem 1rem;box-shadow:0 1px 6px #eee;"><strong><span data-ar="الحالة:" data-en="Status:" data-fr="Statut :">الحالة:</span></strong> ${b.status || '-'} </div>
              <div style="background:#f8f9fa;border-radius:7px;padding:0.7rem 1rem;box-shadow:0 1px 6px #eee;"><strong><span data-ar="ملاحظات:" data-en="Notes:" data-fr="Remarques :">ملاحظات:</span></strong> ${b.notes || '-'} </div>
            </div>
            <div style="text-align:center;min-width:220px;max-width:320px;">
              ${b.passport_image_url ? `<a href="${b.passport_image_url}" target="_blank"><img src="${b.passport_image_url}" alt="صورة الجواز" style="width:220px;max-width:100%;max-height:320px;border-radius:12px;border:2px solid #36b9cc;box-shadow:0 4px 16px #36b9cc22;margin:4px;object-fit:cover;" /></a>` : '<span style="color:#c0392b;">لا توجد صورة</span>'}
              <div style="margin-top:8px;font-size:0.95em;color:#888;"><span data-ar="صورة الجواز" data-en="Passport Image" data-fr="Image du passeport">صورة الجواز</span></div>
            </div>
          </div>
        `;
        // Apply language to modal content immediately after rendering
        var lang = localStorage.getItem('umrah_admin_lang') || 'ar';
        document.querySelectorAll('#bookingDetailsContent [data-ar], #bookingDetailsContent [data-en], #bookingDetailsContent [data-fr]').forEach(function(el) {
          if (el.dataset[lang]) {
            el.textContent = el.dataset[lang];
          }
        });
      } else {
        modalContent.innerHTML = `<div style=\"color:#c0392b;text-align:center;padding:2rem;\">${data.error || 'تعذر جلب التفاصيل.'}</div>`;
      }
    })
    .catch(() => {
      modalContent.innerHTML = `<div style="color:#c0392b;text-align:center;padding:2rem;">تعذر الاتصال بالخادم.</div>`;
    });
}

// قبول الحجز وتغيير حالته إلى "مقبول"
window.acceptBooking = async function(id) {
  let token = localStorage.getItem('agency_token');
  try {
    const res = await fetch(`https://almanassik-alarabi-server-v-01.onrender.com/api/agency/bookings/${id}/accept`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.status === 'ok') {
      // تحديث حالة الحجز محلياً مع اسم العرض
      const idx = bookings.findIndex(b => b.id === id);
      if (idx !== -1 && data.booking) {
        // إذا لم يوجد offer_title أضفه من offers.title أو من الطلب القديم أو من دالة getOfferTitle
        if (!data.booking.offer_title) {
          if (data.booking.offers && data.booking.offers.title) {
            data.booking.offer_title = data.booking.offers.title;
          } else if (bookings[idx].offer_title) {
            data.booking.offer_title = bookings[idx].offer_title;
          } else {
            data.booking.offer_title = getOfferTitle(data.booking.offer_id);
          }
        }
        bookings[idx] = data.booking;
      }
      renderBookingsTable();
    } else {
      alert(data.error || 'فشل في قبول الطلب');
    }
  } catch(e) { alert('خطأ في الاتصال'); }
}


function getAgencyName(offer_id) {
  for (let ag of agencies) {
    if (offersByAgency[ag.id]?.find(o => o.id === offer_id)) return ag.name;
  }
  return '-';
}
function getOfferTitle(offer_id) {
  for (let ag of agencies) {
    let offer = offersByAgency[ag.id]?.find(o => o.id === offer_id);
    if (offer) return offer.title;
  }
  return '-';
}
function formatDate(dt) {
  if (!dt) return '-';
  let d = new Date(dt);
  // صيغة التاريخ: يوم/شهر/سنة بالأرقام العادية
  let day = d.getDate().toString().padStart(2, '0');
  let month = (d.getMonth() + 1).toString().padStart(2, '0');
  let year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// حذف حجز
async function deleteBooking(id) {
  if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
  let token = localStorage.getItem('agency_token');
  try {
    const res = await fetch(`https://almanassik-alarabi-server-v-01.onrender.com/api/agency/bookings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.status === 'ok') {
      bookings = bookings.filter(b => b.id !== id);
      renderBookingsTable();
    } else {
      alert(data.error || 'فشل في حذف الطلب');
    }
  } catch(e) { alert('خطأ في الاتصال'); }
}

// تعبئة قائمة الوكالات والعروض في النموذج
function fillAgenciesOffersForm() {
  const agencySelect = document.getElementById('agencySelect');
  const offerSelect = document.getElementById('offerSelect');
  if (!agencySelect || !offerSelect) return;
  agencySelect.innerHTML = '<option value="">اختر الوكالة</option>' + agencies.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  offerSelect.innerHTML = '<option value="">اختر العرض</option>';
  offerSelect.disabled = true;
  agencySelect.onchange = function() {
    let agId = agencySelect.value;
    if (offersByAgency[agId]) {
      offerSelect.innerHTML = '<option value="">اختر العرض</option>' + offersByAgency[agId].map(o => `<option value="${o.id}">${o.title}</option>`).join('');
      offerSelect.disabled = false;
    } else {
      offerSelect.innerHTML = '<option value="">اختر العرض</option>';
      offerSelect.disabled = true;
    }
  };
}

// إضافة معتمر جديد وجميع وظائف المودال محذوفة

// البحث والتصفية
document.getElementById('searchRequests').oninput = renderBookingsTable;
document.getElementById('statusFilter').onchange = renderBookingsTable;

// دعم تغيير اللغة للعناوين والـ placeholder
function setupLanguageSwitcher() {
  const btns = document.querySelectorAll('.lang-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const lang = btn.getAttribute('data-lang');
      document.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(el => {
        el.textContent = el.getAttribute('data-' + lang);
      });
      // تغيير الـ placeholder
      const searchInput = document.getElementById('searchRequests');
      searchInput.placeholder = searchInput.getAttribute('data-' + lang + '-placeholder');
    });
  });
}

// تحميل الشريط الجانبي المشترك ديناميكيًا
function loadSidebar() {
  const sidebarDiv = document.getElementById('sidebar');
  if (sidebarDiv) {
    fetch('sidebar.html')
      .then(res => res.text())
      .then(html => {
        sidebarDiv.innerHTML = html;
      });
  }
}

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', async function() {
  loadSidebar();
  await fetchAgenciesAndOffers();
  fillAgenciesOffersForm();
  await fetchBookings();
  renderBookingsTable();
  setupLanguageSwitcher();
});




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
      if (!current || current === '') current = 'demande_umrah.html';
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