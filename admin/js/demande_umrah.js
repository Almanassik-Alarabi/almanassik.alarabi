// تحميل الشريط الجانبي تلقائياً
function loadSidebar() {
  fetch('sidebar.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('sidebar').innerHTML = html;
      // تمييز الصفحة الحالية
      var current = window.location.pathname.split('/').pop();
      if (!current || current === '') current = 'demande_umrah.html';
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
    });
}


document.addEventListener('DOMContentLoaded', function() {
  loadSidebar();
  renderOrdersTable().then(function() {
    // تطبيق اللغة مرة ثانية بعد جلب البيانات بالكامل
    var lang = localStorage.getItem('umrah_admin_lang') || 'ar';
    if (typeof applyLanguage === 'function') {
      applyLanguage(lang);
    }
  });
  // تفعيل نظام تغيير اللغة الموحد
  function applyLanguage(lang) {
    document.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(function(el) {
      if (el.tagName === 'OPTION') {
        if (lang === 'ar' && el.hasAttribute('data-ar')) {
          el.textContent = el.getAttribute('data-ar');
        } else if (lang === 'en' && el.hasAttribute('data-en')) {
          el.textContent = el.getAttribute('data-en');
        } else if (lang === 'fr' && el.hasAttribute('data-fr')) {
          el.textContent = el.getAttribute('data-fr');
        }
      } else if (el.tagName === 'BUTTON') {
        // تحديث جميع العناصر داخل الزر التي تحمل خصائص اللغة
        el.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(function(child) {
          if (lang === 'ar' && child.hasAttribute('data-ar')) {
            child.textContent = child.getAttribute('data-ar');
          } else if (lang === 'en' && child.hasAttribute('data-en')) {
            child.textContent = child.getAttribute('data-en');
          } else if (lang === 'fr' && child.hasAttribute('data-fr')) {
            child.textContent = child.getAttribute('data-fr');
          }
        });
        // دعم زر إضافة معتمر إذا كان النص مباشرة داخل الزر وليس داخل span
        if (!el.querySelector('[data-ar], [data-en], [data-fr]')) {
          if (lang === 'ar' && el.hasAttribute('data-ar')) {
            el.textContent = el.getAttribute('data-ar');
          } else if (lang === 'en' && el.hasAttribute('data-en')) {
            el.textContent = el.getAttribute('data-en');
          } else if (lang === 'fr' && el.hasAttribute('data-fr')) {
            el.textContent = el.getAttribute('data-fr');
          }
        }
      } else {
        if (lang === 'ar' && el.hasAttribute('data-ar')) {
          el.textContent = el.getAttribute('data-ar');
        } else if (lang === 'en' && el.hasAttribute('data-en')) {
          el.textContent = el.getAttribute('data-en');
        } else if (lang === 'fr' && el.hasAttribute('data-fr')) {
          el.textContent = el.getAttribute('data-fr');
        }
      }
      if (el.placeholder !== undefined) {
        if (lang === 'ar' && el.hasAttribute('data-ar-placeholder')) {
          el.placeholder = el.getAttribute('data-ar-placeholder');
        } else if (lang === 'en' && el.hasAttribute('data-en-placeholder')) {
          el.placeholder = el.getAttribute('data-en-placeholder');
        } else if (lang === 'fr' && el.hasAttribute('data-fr-placeholder')) {
          el.placeholder = el.getAttribute('data-fr-placeholder');
        }
      }
    });
    // تحديث زر إضافة معتمر بشكل صريح إذا لم يتغير نصه
    var addBtn = document.getElementById('addPilgrimSubmitBtn');
    if (addBtn) {
      var span = addBtn.querySelector('span[data-ar]');
      if (span) {
        if (lang === 'ar' && span.hasAttribute('data-ar')) {
          span.textContent = span.getAttribute('data-ar');
        } else if (lang === 'en' && span.hasAttribute('data-en')) {
          span.textContent = span.getAttribute('data-en');
        } else if (lang === 'fr' && span.hasAttribute('data-fr')) {
          span.textContent = span.getAttribute('data-fr');
        }
      }
    }
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    localStorage.setItem('umrah_admin_lang', lang);
  }

  // تفعيل أزرار اللغة
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.onclick = function() {
      var lang = btn.getAttribute('data-lang');
      if (lang) applyLanguage(lang);
    };
  });
  // تفعيل اللغة المحفوظة أو الافتراضية
  var lang = localStorage.getItem('umrah_admin_lang') || 'ar';
  applyLanguage(lang);
  // تحميل الوكالات عند فتح نافذة الإضافة
  document.getElementById('openAddPilgrimModalBtn').addEventListener('click', function() {
    document.getElementById('addPilgrimModal').style.display = 'flex';
    loadAgenciesForSelect();
  });
  // إغلاق النافذة
  document.getElementById('closeAddPilgrimModalBtn').addEventListener('click', function() {
    document.getElementById('addPilgrimModal').style.display = 'none';
    document.getElementById('addBookingForm').reset();
    document.getElementById('bookingFormMessage').textContent = '';
    document.getElementById('offerSelect').innerHTML = '<option value="" data-ar="اختر العرض" data-en="Select Offer" data-fr="Choisir l\'offre">اختر العرض</option>';
    document.getElementById('offerSelect').disabled = true;
  });

  // زر إلغاء في نافذة إضافة معتمر
  document.getElementById('cancelAddPilgrimBtn').addEventListener('click', function() {
    document.getElementById('addPilgrimModal').style.display = 'none';
    document.getElementById('addBookingForm').reset();
    document.getElementById('bookingFormMessage').textContent = '';
    document.getElementById('offerSelect').innerHTML = '<option value="" data-ar="اختر العرض" data-en="Select Offer" data-fr="Choisir l\'offre">اختر العرض</option>';
    document.getElementById('offerSelect').disabled = true;
  });
  // عند تغيير الوكالة، جلب عروضها
  document.getElementById('agencySelect').addEventListener('change', function() {
    var agencyId = this.value;
    if (agencyId) {
      loadOffersForAgency(agencyId);
    } else {
      document.getElementById('offerSelect').innerHTML = '<option value="" data-ar="اختر العرض" data-en="Select Offer" data-fr="Choisir l\'offre">اختر العرض</option>';
      document.getElementById('offerSelect').disabled = true;
    }
  });
  // معالجة إرسال النموذج
  document.getElementById('addBookingForm').addEventListener('submit', handleAddBookingFormSubmit);

  // فلترة الطلبات حسب الحالة
  document.getElementById('statusFilter').addEventListener('change', function() {
    renderOrdersTable();
  });
  // فلترة حسب البحث
  document.getElementById('searchRequests').addEventListener('input', function() {
    renderOrdersTable();
  });
});

// جلب الوكالات المقبولة وملء القائمة
async function loadAgenciesForSelect() {
  var agencySelect = document.getElementById('agencySelect');
  agencySelect.innerHTML = '<option value="" data-ar="اختر الوكالة" data-en="Select Agency" data-fr="Choisir l\'agence">اختر الوكالة</option>';
  const token = localStorage.getItem('umrah_admin_token');
  if (!token || !token.trim()) {
    showBookingFormMessage('يرجى تسجيل الدخول أو إعادة تحميل الصفحة بعد تسجيل الدخول.', false);
    return;
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token.trim()
  };
  try {
    const response = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/admin/agencies/all', {
      headers
    });
    if (response.status === 401) {
      localStorage.removeItem('umrah_admin_token');
      showBookingFormMessage('انتهت صلاحية الجلسة، سيتم تحويلك لتسجيل الدخول...', false);
      setTimeout(function() {
        window.location.href = 'login_admin.html';
      }, 1500);
      return;
    }
    const result = await response.json();
    if (response.ok && result.agencies) {
      result.agencies.filter(a => a.is_approved).forEach(function(agency) {
        var opt = document.createElement('option');
        opt.value = agency.id;
        opt.textContent = agency.name;
        agencySelect.appendChild(opt);
      });
    } else if (result.error) {
      showBookingFormMessage(result.error, false);
    }
  } catch (err) {
    showBookingFormMessage('فشل الاتصال بالخادم أو التوكن غير صالح', false);
  }
  // تعطيل قائمة العروض حتى اختيار وكالة
  document.getElementById('offerSelect').innerHTML = '<option value="" data-ar="اختر العرض" data-en="Select Offer" data-fr="Choisir l\'offre">اختر العرض</option>';
  document.getElementById('offerSelect').disabled = true;
}

// جلب عروض وكالة محددة وملء القائمة
async function loadOffersForAgency(agencyId) {
  var offerSelect = document.getElementById('offerSelect');
  offerSelect.innerHTML = '<option value="" data-ar="جاري التحميل..." data-en="Loading..." data-fr="Chargement...">جاري التحميل...</option>';
  offerSelect.disabled = true;
  const token = localStorage.getItem('umrah_admin_token');
  if (!token || !token.trim()) {
    offerSelect.innerHTML = '<option value="" data-ar="يرجى تسجيل الدخول" data-en="Please login" data-fr="Veuillez vous connecter">يرجى تسجيل الدخول</option>';
    offerSelect.disabled = true;
    return;
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token.trim()
  };
  try {
    const response = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/admin/offers/all', {
      headers
    });
    if (response.status === 401) {
      localStorage.removeItem('umrah_admin_token');
      offerSelect.innerHTML = '<option value="" data-ar="انتهت الجلسة، سيتم تحويلك لتسجيل الدخول..." data-en="Session expired, redirecting to login..." data-fr="Session expirée, redirection vers la connexion...">انتهت الجلسة، سيتم تحويلك لتسجيل الدخول...</option>';
      offerSelect.disabled = true;
      setTimeout(function() {
        window.location.href = 'login_admin.html';
      }, 1500);
      return;
    }
    const result = await response.json();
    if (response.ok && result.offers) {
      var offers = result.offers.filter(o => o.agency_id === agencyId);
      if (offers.length) {
        offerSelect.innerHTML = '<option value="" data-ar="اختر العرض" data-en="Select Offer" data-fr="Choisir l\'offre">اختر العرض</option>';
        offers.forEach(function(offer) {
          var opt = document.createElement('option');
          opt.value = offer.id;
          opt.textContent = offer.title;
          offerSelect.appendChild(opt);
        });
        offerSelect.disabled = false;
      } else {
        offerSelect.innerHTML = '<option value="" data-ar="لا توجد عروض متاحة" data-en="No offers available" data-fr="Aucune offre disponible">لا توجد عروض متاحة</option>';
        offerSelect.disabled = true;
      }
    } else if (result.error) {
      offerSelect.innerHTML = '<option value="">' + result.error + '</option>';
      offerSelect.disabled = true;
    }
  } catch (err) {
    offerSelect.innerHTML = '<option value="" data-ar="فشل التحميل" data-en="Failed to load" data-fr="Échec du chargement">فشل التحميل</option>';
    offerSelect.disabled = true;
  }
}

// دالة إرسال بيانات إضافة معتمر إلى API
async function handleAddBookingFormSubmit(e) {
  e.preventDefault();
  var form = e.target;
  var fullName = form.fullName ? form.fullName.value.trim() : '';
  var phone = form.phone ? form.phone.value.trim() : '';
  var roomType = form.roomType ? form.roomType.value : '';
  var agencyId = form.agencySelect ? form.agencySelect.value : '';
  var offerId = form.offerSelect ? form.offerSelect.value : '';
  var passportImageFile = form.passportImageFile ? form.passportImageFile.files[0] : null;
  if (!fullName || !phone || !roomType || !agencyId || !offerId || !passportImageFile) {
    showBookingFormMessage('يرجى ملء جميع الحقول واختيار صورة الجواز', false);
    return;
  }
  // إظهار مؤشر الانتظار وتعطيل زر الإضافة
  document.getElementById('bookingFormLoader').style.display = 'block';
  var addBtn = document.getElementById('addPilgrimSubmitBtn');
  addBtn.disabled = true;
  addBtn.style.opacity = '0.6';
  addBtn.style.cursor = 'not-allowed';
  var passportImageUrl = '';
  try {
    document.getElementById('passportImageUploadStatus').textContent = 'جاري رفع صورة الجواز...';
    passportImageUrl = await uploadPassportImage(passportImageFile);
    if (!passportImageUrl) {
      showBookingFormMessage('فشل رفع صورة الجواز. يرجى المحاولة مرة أخرى.', false);
      document.getElementById('passportImageUploadStatus').textContent = '';
      document.getElementById('bookingFormLoader').style.display = 'none';
      return;
    }
    document.getElementById('passportImageUploadStatus').textContent = 'تم رفع الصورة بنجاح';
  } catch (err) {
    showBookingFormMessage('حدث خطأ أثناء رفع صورة الجواز', false);
    document.getElementById('passportImageUploadStatus').textContent = '';
    document.getElementById('bookingFormLoader').style.display = 'none';
    return;
  }
  // تجهيز البيانات
  var bookingData = {
    full_name: fullName,
    phone: phone,
    room_type: roomType,
    offer_id: offerId,
    passport_image_url: passportImageUrl
  };
  // إرسال الطلب إلى API مع التوكن
  const token = localStorage.getItem('umrah_admin_token');
  if (!token || !token.trim()) {
    showBookingFormMessage('يرجى تسجيل الدخول أو إعادة تحميل الصفحة بعد تسجيل الدخول.', false);
    return;
  }
  try {
    const response = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/admin/bookings/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token.trim()
      },
      body: JSON.stringify(bookingData)
    });
    const result = await response.json();
    if (response.ok) {
      showBookingFormMessage('تمت إضافة المعتمر بنجاح', true);
      form.reset();
      document.getElementById('passportImageUploadStatus').textContent = '';
      // إغلاق النافذة بعد ثانيتين وتحديث الجدول
      setTimeout(function() {
        document.getElementById('addPilgrimModal').style.display = 'none';
        renderOrdersTable();
      }, 1500);
    } else {
      showBookingFormMessage(result.error || 'حدث خطأ أثناء الإضافة', false);
    }
  } catch (err) {
    showBookingFormMessage('فشل الاتصال بالخادم', false);
  }
  // إخفاء مؤشر الانتظار وتمكين زر الإضافة
  document.getElementById('bookingFormLoader').style.display = 'none';
  addBtn.disabled = false;
  addBtn.style.opacity = '';
  addBtn.style.cursor = '';

}

// رفع صورة الجواز إلى imgur (أو خدمة صور مجانية)
async function uploadPassportImage(file) {
  // رفع الصورة إلى السيرفر المحلي
  const formData = new FormData();
  formData.append('passport', file);
  try {
    const response = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/admin/bookings/upload/passport', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (response.ok && data.url) {
      return data.url;
    }
    return '';
  } catch (err) {
    return '';
  }
}

function showBookingFormMessage(msg, success) {
  var el = document.getElementById('bookingFormMessage');
  el.textContent = msg;
  el.style.color = success ? 'green' : 'red';
}

// جلب بيانات المعتمرين من قاعدة البيانات عبر API
async function getOrdersData() {
  const token = localStorage.getItem('umrah_admin_token');
  if (!token || !token.trim()) {
    window.location.href = '';
    return [];
  }
  try {
    const response = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/bookings/all', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token.trim()
      }
    });
    if (response.status === 401) {
      localStorage.removeItem('umrah_admin_token');
      setTimeout(function() {
        window.location.href = '';
      }, 500);
      return [];
    }
    if (!response.ok) return [];
    const result = await response.json();
    if (result.bookings && Array.isArray(result.bookings)) {
      return result.bookings;
    }
    return [];
  } catch (err) {
    return [];
  }
}

async function renderOrdersTable() {
  var orders = await getOrdersData();
  // فلترة حسب الحالة
  var status = document.getElementById('statusFilter').value;
  var search = document.getElementById('searchRequests').value.trim().toLowerCase();
  if (status) {
    orders = orders.filter(function(order) {
      return order.status === status;
    });
  }
  if (search) {
    orders = orders.filter(function(order) {
      // بحث بالاسم مع تجاهل المسافات الزائدة والهمزات والرموز
      function normalize(str) {
        return (str || '')
          .replace(/[\s\-_'"،.]/g, '')
          .replace(/[إأآا]/g, 'ا')
          .replace(/[يى]/g, 'ي')
          .replace(/[ةه]/g, 'ه')
          .toLowerCase();
      }
      var name = normalize(order.full_name);
      var searchName = normalize(search);
      return (
        (name && name.includes(searchName)) ||
        (order.phone && order.phone.replace(/\D/g, '').includes(search.replace(/\D/g, '')))
      );
    });
  }
  // ترتيب الطلبات: قيد الانتظار أولاً، ثم بانتظار موافقة الوكالة، ثم البقية إذا لم يكن هناك فلترة أو بحث
  if (!status && !search) {
    orders.sort(function(a, b) {
      // قيد الانتظار أولاً
      if (a.status === 'قيد الانتظار' && b.status !== 'قيد الانتظار') return -1;
      if (a.status !== 'قيد الانتظار' && b.status === 'قيد الانتظار') return 1;
      // بانتظار موافقة الوكالة ثانياً
      if (a.status === 'بانتظار موافقة الوكالة' && b.status !== 'بانتظار موافقة الوكالة') return -1;
      if (a.status !== 'بانتظار موافقة الوكالة' && b.status === 'بانتظار موافقة الوكالة') return 1;
      // البقية حسب الترتيب الأصلي
      return 0;
    });
  }
  var tbody = document.querySelector('#ordersTable tbody');
  tbody.innerHTML = '';
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="6">لا توجد طلبات حالياً.</td></tr>';
    return;
  }
  orders.forEach(function(order) {
    // إعداد متغيرات زر الإرسال حسب حالة الطلب
    let sendBtnClass = 'btn-action btn-send';
    let sendBtnSpan = '';
    let sendBtnDisabled = '';
    let sendBtnStyle = '';
    let sendBtnIcon = '';
    if (order.status === 'قيد الانتظار') {
      sendBtnClass += ' gold';
      sendBtnIcon = '<i class="fas fa-paper-plane"></i> ';
      sendBtnSpan = `<span data-ar="إرسال إلى الوكالة" data-en="Send to Agency" data-fr="Envoyer à l'agence">إرسال إلى الوكالة</span>`;
      sendBtnDisabled = '';
      sendBtnStyle = '';
    } else if (order.status === 'بانتظار موافقة الوكالة') {
      sendBtnClass += ' pending';
      sendBtnIcon = '<i class="fas fa-clock"></i> ';
      sendBtnSpan = `<span data-ar="بانتظار موافقة الوكالة" data-en="Pending Agency Approval" data-fr="En attente de l'approbation de l'agence">بانتظار موافقة الوكالة</span>`;
      sendBtnDisabled = 'disabled style="pointer-events:none; background:#bbb; color:#fff;"';
      sendBtnStyle = '';
    } else if (order.status === 'مقبول') {
      sendBtnClass += ' accepted';
      sendBtnIcon = '<i class="fas fa-check-circle"></i> ';
      sendBtnSpan = `<span data-ar="تم قبول الطلب" data-en="Request Accepted" data-fr="Demande acceptée">تم قبول الطلب</span>`;
      sendBtnDisabled = 'disabled style="pointer-events:none; background:#27ae60; color:#fff;"';
      sendBtnStyle = '';
    } else {
      sendBtnIcon = '<i class="fas fa-paper-plane"></i> ';
      sendBtnSpan = `<span data-ar="إرسال إلى الوكالة" data-en="Send to Agency" data-fr="Envoyer à l'agence">إرسال إلى الوكالة</span>`;
    }
    
    var tr = document.createElement('tr');
    tr.setAttribute('data-passport-url', order.passport_image_url || '');
    tr.innerHTML = `
      <td>${order.full_name || ''}</td>
      <td>${order.phone || ''}</td>
      <td>${order.agency_name || ''}</td>
      <td>${order.offer_title || ''}</td>
      <td>${order.created_at ? order.created_at.split('T')[0] : ''}</td>
      <td>
        <div class="action-btns" style="display:flex; gap:7px; justify-content:center; align-items:center;">
          <button class="btn-action btn-delete" title="حذف" data-id="${order.id}" ${order.status!=='قيد الانتظار' ? 'style="display:none;width:44px;min-width:44px;max-width:44px;height:44px;min-height:44px;max-height:44px;padding:0 6px;background:linear-gradient(120deg,#e74c3c,#c0392b 90%);color:#fff;border:2.5px solid #b71c1c;font-weight:bold;box-shadow:0 2px 8px #e74c3c55;letter-spacing:1px;font-size:18px;transition:0.2s;"' : 'style="width:44px;min-width:44px;max-width:44px;height:44px;min-height:44px;max-height:44px;padding:0 6px;background:linear-gradient(120deg,#e74c3c,#c0392b 90%);color:#fff;border:2.5px solid #b71c1c;font-weight:bold;box-shadow:0 2px 8px #e74c3c55;letter-spacing:1px;font-size:18px;transition:0.2s;"'}>
            <i class="fas fa-trash-alt"></i>
          </button>
          <button class="btn-action btn-details" title="تفاصيل" data-id="${order.id}" style="min-width:44px;max-width:44px;background:#2980b9;color:#fff;border:1.5px solid #2471a3;font-weight:bold;">
            <i class="fas fa-eye"></i>
          </button>
          <button class="${sendBtnClass}" title="" data-id="${order.id}" ${sendBtnDisabled} style="${sendBtnStyle}min-width:150px;max-width:180px;font-weight:bold;border:1.5px solid #b7950b;${order.status==='قيد الانتظار' ? 'background:#f1c40f;color:#333;' : ''}">
            ${sendBtnIcon}${sendBtnSpan}
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  addOrderActions();
}

function addOrderActions() {
  // زر الإرسال إلى الوكالة
  document.querySelectorAll('.btn-send').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      if (btn.classList.contains('gold')) {
        var bookingId = btn.dataset.id;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        try {
          const token = localStorage.getItem('umrah_admin_token');
          const response = await fetch(`https://almanassik-alarabi-server-v-01.onrender.com/api/bookings/approve-by-admin/${bookingId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            }
          });
          const result = await response.json();
          if (response.ok) {
            // إعادة تحميل الجدول بالكامل ليتم تحديث الألوان والحالات بشكل متزامن مع قاعدة البيانات
            await renderOrdersTable();
          } else {
            alert(result.error || 'حدث خطأ أثناء الإرسال');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال إلى الوكالة';
          }
        } catch (err) {
          alert('فشل الاتصال بالخادم');
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane"></i> إرسال إلى الوكالة';
        }
      }
    });
  });
  // زر الحذف
  document.querySelectorAll('.btn-delete').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      var tr = btn.closest('tr');
      var bookingId = btn.dataset.id;
      if (!confirm('هل أنت متأكد أنك تريد حذف هذا الطلب نهائياً؟')) return;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      try {
        const token = localStorage.getItem('umrah_admin_token');
        const response = await fetch(`https://almanassik-alarabi-server-v-01.onrender.com/api/bookings/reject/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        });
        const result = await response.json();
        if (response.ok) {
          tr.remove();
        } else {
          alert(result.error || 'حدث خطأ أثناء الحذف');
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        }
      } catch (err) {
        alert('فشل الاتصال بالخادم');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
      }
    });
  });
  // زر التفاصيل: عرض نافذة منبثقة بمعلومات الطلب
  document.querySelectorAll('.btn-details').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const bookingId = btn.dataset.id;
      // جلب بيانات الطلب من الجدول الحالي (DOM)
      const tr = btn.closest('tr');
      const tds = tr.querySelectorAll('td');
      const passportImageUrl = tr.getAttribute('data-passport-url') || '';
      const details = {
        full_name: tds[0]?.textContent || '',
        phone: tds[1]?.textContent || '',
        agency_name: tds[2]?.textContent || '',
        offer_title: tds[3]?.textContent || '',
        created_at: tds[4]?.textContent || '',
        passport_image_url: passportImageUrl
      };
      // بناء محتوى التفاصيل
      const html = `
        <div style="display:flex;flex-direction:row;gap:24px;direction:rtl;text-align:right;padding:18px 10px 10px 10px;min-width:420px;max-width:700px;align-items:flex-start;">
          <div style="flex:1;min-width:220px;">
            <h3 style='margin-bottom:10px;font-size:1.2em;color:#176a3d;'>تفاصيل الطلب</h3>
            <div><b>الاسم:</b> ${details.full_name}</div>
            <div><b>الجوال:</b> ${details.phone}</div>
            <div><b>الوكالة:</b> ${details.agency_name}</div>
            <div><b>العرض:</b> ${details.offer_title}</div>
            <div><b>تاريخ الطلب:</b> ${details.created_at}</div>
          </div>
          ${details.passport_image_url ? `<div style='flex:1;min-width:220px;max-width:340px;'><b>صورة الجواز:</b><br><img src='${details.passport_image_url}' alt='صورة الجواز' style='width:100%;max-width:320px;max-height:420px;object-fit:contain;border:2px solid #176a3d;border-radius:10px;box-shadow:0 2px 8px #0002;margin-top:6px;'></div>` : ''}
        </div>
      `;
      // نافذة منبثقة بسيطة
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.background = 'rgba(0,0,0,0.25)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '9999';
      modal.innerHTML = `<div style='background:#fff;border-radius:10px;box-shadow:0 2px 16px #0002;position:relative;'>${html}<button style='position:absolute;top:7px;left:7px;background:#e74c3c;color:#fff;border:none;border-radius:50%;width:28px;height:28px;font-size:18px;cursor:pointer;' title='إغلاق'>&times;</button></div>`;
      document.body.appendChild(modal);
      modal.querySelector('button').onclick = function() {
        modal.remove();
      };
      modal.onclick = function(e) {
        if (e.target === modal) modal.remove();
      };
    });
  });
}

// تم حذف دالة فلترة الحجوزات التي تستبعد الطلبات المرفوضة بناءً على طلبك
// إذا كان هناك استخدام لها في مكان آخر بالواجهة، احذف السطر أو تجاهله
