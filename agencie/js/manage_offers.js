// إعداد عنوان الـ API (عدّل حسب مسارك الفعلي)
const API_BASE = 'https://almanassik-alarabi-server-v-01.onrender.com/api/agency/offers';
const AUTH_TOKEN = localStorage.getItem('agency_token') || '';

// عناصر DOM
const offersGrid = document.getElementById('offersGrid');
const addOfferModal = document.getElementById('addOfferModal');
const addOfferForm = document.getElementById('addOfferForm');
const openAddOfferModalBtn = document.getElementById('openAddOfferModalBtn');
const closeAddOfferModalBtn = document.getElementById('closeAddOfferModalBtn');
const cancelAddOfferBtn = document.getElementById('cancelAddOfferBtn');
const searchOffers = document.getElementById('searchOffers');

// عنصر قائمة الفروع (سيتم إنشاؤه ديناميكياً)
const branchesListBox = document.getElementById('branchesListBox');


// جلب الفروع وشركات الطيران وملء القوائم عند فتح المودال
async function fillBranchesAndAirlines(offer = undefined) {
  // الفروع (قائمة اختيارية)
  if (branchesListBox) {
    branchesListBox.innerHTML = '<div style="color:#888;padding:7px 0;">جاري تحميل الفروع...</div>';
    try {
      const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/agency/branches', {
        headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN }
      });
      const data = await res.json();
      let html = '';
      // خيار الوكالة فقط
      html += `<label style="display:block;margin-bottom:5px;cursor:pointer;" data-ar="انسب إلى وكالتي فقط (بدون فروع)" data-en="Assign to my agency only (no branches)" data-fr="Attribuer uniquement à mon agence (sans agences)">
        <input type="checkbox" name="branchesBox" value="main" style="margin-left:6px;">
        <span class="branch-main-label" data-ar="انسب إلى وكالتي فقط (بدون فروع)" data-en="Assign to my agency only (no branches)" data-fr="Attribuer uniquement à mon agence (sans agences)">انسب إلى وكالتي فقط (بدون فروع)</span>
      </label>`;
      if (res.ok && Array.isArray(data.branches) && data.branches.length) {
        html += `<div 
          style="margin-bottom:3px;font-weight:600;color:#176a3d;" 
          data-ar="الفروع التابعة لوكالتك:" 
          data-en="Your agency branches:" 
          data-fr="Les agences affiliées à votre agence :"
        >الفروع التابعة لوكالتك:</div>`;
        data.branches.forEach(branch => {
          html += `<label style="display:block;margin-bottom:4px;cursor:pointer;">
            <input type="checkbox" name="branchesBox" value="${branch.id}" style="margin-left:6px;">
            ${branch.name || 'فرع بدون اسم'}${branch.city ? ' - ' + branch.city : ''}
          </label>`;
        });
      }
      branchesListBox.innerHTML = html;
      // طباعة عدد عناصر الفروع بعد الحقن
      const allBranchCheckboxes = branchesListBox.querySelectorAll('input[type=checkbox][name=branchesBox]');
      // عند التعديل: حدد الفروع المنسوبة مسبقاً
      if (offer && Array.isArray(offer.branches)) {
        setTimeout(() => {
          const ids = offer.branches.map(b => b.id ? String(b.id) : String(b));
          allBranchCheckboxes.forEach(chk => {
            if (ids.includes(chk.value)) chk.checked = true;
          });
          // ...existing code...
        }, 100);
      }
      // إضافة منطق: إذا تم تحديد "انسب إلى وكالتي فقط"، يتم نزع تحديد الفروع الأخرى
      const mainAgencyCheckbox = branchesListBox.querySelector('input[type=checkbox][name=branchesBox][value="main"]');
      if (mainAgencyCheckbox) {
        mainAgencyCheckbox.addEventListener('change', function() {
          if (this.checked) {
            allBranchCheckboxes.forEach(chk => {
              if (chk.value !== 'main') chk.checked = false;
            });
          }
        });
      }
      // إذا تم تحديد أي فرع آخر، يتم نزع تحديد "انسب إلى وكالتي فقط"
      allBranchCheckboxes.forEach(chk => {
        if (chk.value !== 'main') {
          chk.addEventListener('change', function() {
            if (this.checked) {
              if (mainAgencyCheckbox) mainAgencyCheckbox.checked = false;
            }
          });
        }
      });
    } catch (e) {
      branchesListBox.innerHTML = '<div style="color:red;">تعذر جلب الفروع</div>';
    }
  }
  // شركات الطيران
  const airlineSelect = document.getElementById('airlineSelect');
  if (airlineSelect) {
    airlineSelect.innerHTML = '<option value="">جاري التحميل...</option>';
    try {
      const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/airlines');
      const data = await res.json();
      let options = '<option value="">بدون</option>';
      if (res.ok && Array.isArray(data.airlines) && data.airlines.length) {
        data.airlines.forEach(airline => {
          options += `<option value="${airline.id}">${airline.name}</option>`;
        });
      } else {
        options += '<option disabled>لا توجد شركات طيران متاحة</option>';
      }
      airlineSelect.innerHTML = options;
      // إذا كان هناك عرض للتعديل، حدد شركة الطيران المختارة
      if (offer && offer.airline_id) {
        setTimeout(() => {
          airlineSelect.value = offer.airline_id;
        }, 100);
      }
    } catch (e) {
      airlineSelect.innerHTML = '<option value="">بدون</option><option disabled>تعذر جلب شركات الطيران</option>';
    }
  }
}


// عند فتح المودال: جلب الفروع وشركات الطيران
if (addOfferModal) {
  addOfferModal.addEventListener('show', () => fillBranchesAndAirlines());
}

if (openAddOfferModalBtn) openAddOfferModalBtn.onclick = async () => {
  if (addOfferForm) addOfferForm.reset(); // إعادة تعيين النموذج
  await fillBranchesAndAirlines();
  showModal(addOfferModal);
};


// عرض/إخفاء المودال مع إعادة onsubmit للوضع الافتراضي عند الإغلاق
function showModal(modal) { modal.classList.add('show'); }
function hideModal(modal) {
  modal.classList.remove('show');
  // إعادة onsubmit للوضع الافتراضي (إضافة) عند إغلاق المودال
  if (addOfferForm) addOfferForm.onsubmit = defaultAddOfferSubmit;
}


if (closeAddOfferModalBtn) closeAddOfferModalBtn.onclick = () => hideModal(addOfferModal);
if (cancelAddOfferBtn) cancelAddOfferBtn.onclick = () => hideModal(addOfferModal);

// جلب العروض
async function fetchOffers() {
  offersGrid.innerHTML = '<div style="text-align:center;padding:30px;">جاري التحميل...</div>';
  try {
    const res = await fetch(API_BASE, {
      headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN }
    });
    const data = await res.json();
    if (res.ok && data.offers) renderOffers(data.offers);
    else offersGrid.innerHTML = '<div style="color:red;text-align:center;">' + (data.error || 'فشل التحميل') + '</div>';
  } catch (e) {
    offersGrid.innerHTML = '<div style="color:red;text-align:center;">خطأ في الاتصال بالخادم</div>';
  }
}

// عرض العروض في الشبكة
function renderOffers(offers) {
  if (!offers.length) {
    offersGrid.innerHTML = '<div style="text-align:center;color:#888;">لا توجد عروض حالياً</div>';
    return;
  }
  // Get language labels from template
  function getActionLabel(id) {
    const tpl = document.getElementById('offer-action-labels');
    if (!tpl) return { ar: '', en: '', fr: '' };
    const span = tpl.content.querySelector(`#${id}`);
    return span ? {
      ar: span.getAttribute('data-ar'),
      en: span.getAttribute('data-en'),
      fr: span.getAttribute('data-fr')
    } : { ar: '', en: '', fr: '' };
  }
  const detailsLabel = getActionLabel('details-label');
  const editLabel = getActionLabel('edit-label');
  const deleteLabel = getActionLabel('delete-label');
  offersGrid.innerHTML = offers.map(offer => `
    <div class="offer-card">
      <img src="${offer.main_image || ''}" alt="صورة العرض" class="offer-main-img"/>
      <div class="offer-info">
        <h3>${offer.title || ''}</h3>
        <div>
          <span data-ar="من" data-en="From" data-fr="De">من</span>
          ${offer.departure_date || ''}
          <span data-ar="إلى" data-en="to" data-fr="à">إلى</span>
          ${offer.return_date || ''}
        </div>
        <div>السعر: ${offer.price_double || '-'} <span data-ar="دينار" data-en="Dinar" data-fr="Dinar">دينار</span></div>
        <div class="offer-actions">
          <button class="btn btn-secondary" onclick="showOfferDetails('${offer.id}')">
            <span data-ar="${detailsLabel.ar}" data-en="${detailsLabel.en}" data-fr="${detailsLabel.fr}">${detailsLabel.ar}</span>
          </button>
          <button class="btn btn-primary" onclick="editOffer('${offer.id}')">
            <span data-ar="${editLabel.ar}" data-en="${editLabel.en}" data-fr="${editLabel.fr}">${editLabel.ar}</span>
          </button>
          <button class="btn btn-danger" onclick="deleteOffer('${offer.id}')">
            <span data-ar="${deleteLabel.ar}" data-en="${deleteLabel.en}" data-fr="${deleteLabel.fr}">${deleteLabel.ar}</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
  // Apply language to action buttons after rendering
  var lang = localStorage.getItem('umrah_admin_lang') || 'ar';
  offersGrid.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(function(el) {
    if (el.dataset[lang]) {
      el.textContent = el.dataset[lang];
    }
  });
}

// إضافة عرض جديد
if (addOfferForm) {
  var defaultAddOfferSubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(addOfferForm);
    // تحويل صور الفندق والصورة الرئيسية للأسماء الصحيحة
    if (formData.get('main_image_file')) {
      formData.append('main_image', formData.get('main_image_file'));
      formData.delete('main_image_file');
    }
    if (formData.getAll('hotel_images_file').length) {
      for (const file of formData.getAll('hotel_images_file')) {
        formData.append('hotel_images', file);
      }
      formData.delete('hotel_images_file');
    }
    // جمع الفروع المختارة من قائمة checkboxes
    // طباعة عدد عناصر الفروع في DOM قبل الجمع (إضافة)
    const branchCheckboxes = document.querySelectorAll('#branchesListBox input[type=checkbox][name=branchesBox]');
    let selectedBranches = Array.from(branchCheckboxes).filter(chk => chk.checked).map(chk => chk.value);
    if (!selectedBranches.length) selectedBranches = ['main'];
    formData.delete('agency_id'); // لم يعد مستخدمًا
    // إرسال branch_ids كمصفوفة وليس كـ JSON string
    selectedBranches.forEach(branchId => formData.append('branch_ids', branchId));
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        showShortMessage('تمت إضافة العرض بنجاح', 'success');
        hideModal(addOfferModal);
        addOfferForm.reset();
        fetchOffers();
      } else {
        showShortMessage(data.error || 'فشل الإضافة', 'error');
      }
    } catch (e) {
      showShortMessage('خطأ في الاتصال بالخادم', 'error');
    }
  };
  addOfferForm.onsubmit = defaultAddOfferSubmit;
}

// حذف عرض
window.deleteOffer = async function(id) {
  if (!confirm('هل أنت متأكد من حذف العرض؟')) return;
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN }
    });
    const data = await res.json();
    if (res.ok) {
      showShortMessage('تم حذف العرض بنجاح', 'success');
      fetchOffers();
    } else {
      showShortMessage(data.error || 'فشل الحذف', 'error');
    }
  } catch (e) {
    showShortMessage('خطأ في الاتصال بالخادم', 'error');
  }
}


// تفاصيل العرض

window.showOfferDetails = async function(id) {
  try {
    // جلب تفاصيل العرض
    const res = await fetch(`${API_BASE}?id=${id}`, {
      headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN }
    });
    const data = await res.json();
    let offer = null;
    if (res.ok && data.offers) {
      offer = Array.isArray(data.offers) ? data.offers.find(o => o.id == id) : data.offers;
    }
    if (!offer) {
      showShortMessage('العرض غير موجود', 'error');
      return;
    }
    // جلب شركات الطيران فقط
    const airlinesRes = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/airlines');
    const airlinesData = await airlinesRes.json();
    // اسم شركة الطيران
    let airlineName = '-';
    if (offer.airline_id && Array.isArray(airlinesData.airlines)) {
      const found = airlinesData.airlines.find(a => a.id == offer.airline_id);
      if (found) airlineName = found.name;
    }
    // أسماء الفروع المنسوبة (من data.branches)
    let branchesNames = '';
    if (Array.isArray(data.branches) && data.branches.length > 0) {
      branchesNames = data.branches.map(b => b.name + (b.city ? ' - ' + b.city : '')).join(', ');
    } else {
      branchesNames = 'الوكالة الرئيسية';
    }
    // الخدمات (عرضها بشكل جميل)
    let servicesHtml = '-';
    if (offer.services && typeof offer.services === 'object') {
      servicesHtml = Object.entries(offer.services).map(([k, v]) => v ? `<span style='color:#176a3d;font-weight:700;'>${k}</span>` : '').filter(Boolean).join(', ');
      if (!servicesHtml) servicesHtml = '-';
    } else if (typeof offer.services === 'string') {
      servicesHtml = offer.services;
    }
    // صور الفندق
    let hotelImgsHtml = '';
    if (Array.isArray(offer.hotel_images) && offer.hotel_images.length) {
      hotelImgsHtml = offer.hotel_images.map(img => `<img src="${img}" alt="صورة فندق" style="width:70px;height:70px;object-fit:cover;border-radius:7px;margin:2px 4px 2px 0;border:1.5px solid #eaeaea;">`).join('');
    }
    // بناء نافذة التفاصيل مع شبكة مزدوجة
    let html = `<div style="direction:rtl;">
      <img src="${offer.main_image || ''}" alt="صورة العرض" style="width:100%;border-radius:12px;object-fit:cover;max-height:220px;">
      <h2 style="margin:12px 0 7px 0;color:var(--primary);font-weight:800;">${offer.title || ''}</h2>
      <div style="color:#555;margin-bottom:7px;">${offer.description || ''}</div>
      <div class="details-grid">
        <div class="details-item"><span class="details-label" data-ar="الفروع المنسوبة:" data-en="Assigned Branches:" data-fr="Agences attribuées :">الفروع المنسوبة:</span><span class="details-value">${branchesNames}</span></div>
        <div class="details-item"><span class="details-label" data-ar="الفترة:" data-en="Period:" data-fr="Période :">الفترة:</span><span class="details-value">${offer.departure_date || ''} - ${offer.return_date || ''} (<span data-ar="يوم" data-en="days" data-fr="jours">${offer.duration_days || '-'}</span>)</span></div>
        <div class="details-item"><span class="details-label" data-ar="نوع الرحلة:" data-en="Flight Type:" data-fr="Type de vol :">نوع الرحلة:</span><span class="details-value">${offer.flight_type || '-'}</span></div>
        <div class="details-item"><span class="details-label" data-ar="شركة الطيران:" data-en="Airline:" data-fr="Compagnie aérienne :">شركة الطيران:</span><span class="details-value">${airlineName}</span></div>
        <div class="details-item"><span class="details-label" data-ar="الدخول/الخروج:" data-en="Entry/Exit:" data-fr="Entrée/Sortie :">الدخول/الخروج:</span><span class="details-value">${offer.entry || '-'} / ${offer.exit || '-'}</span></div>
        <div class="details-item"><span class="details-label" data-ar="الفندق:" data-en="Hotel:" data-fr="Hôtel :">الفندق:</span><span class="details-value">${offer.hotel_name || '-'} (${offer.hotel_distance || '-'} <span data-ar="متر" data-en="m" data-fr="m">متر</span>)</span></div>
        <div class="details-item"><span class="details-label" data-ar="الخدمات:" data-en="Services:" data-fr="Services :">الخدمات:</span><span class="details-value">${servicesHtml}</span></div>
        <div class="details-item"><span class="details-label" data-ar="رقم العرض:" data-en="Offer ID:" data-fr="ID de l'offre :">رقم العرض:</span><span class="details-value" style='font-size:0.93em;color:#888;'>${offer.id}</span></div>
        <div class="details-item"><span class="details-label" data-ar="تاريخ الإنشاء:" data-en="Created At:" data-fr="Date de création :">تاريخ الإنشاء:</span><span class="details-value">${offer.created_at ? offer.created_at.split('T')[0] : '-'}</span></div>
      </div>
      <div><b data-ar="صور الفندق:" data-en="Hotel Images:" data-fr="Images de l'hôtel :">صور الفندق:</b> <div class="hotel-images">${hotelImgsHtml || '-'}</div></div>
      <div><b data-ar="الأسعار:" data-en="Prices:" data-fr="Prix :">الأسعار:</b>
        <ul>
          <li data-ar="مزدوجة:" data-en="Double:" data-fr="Double :">مزدوجة:</li> <b>${offer.price_double || '-'}</b> <span data-ar="دينار" data-en="Dinar" data-fr="Dinar">دينار</span>
          <li data-ar="ثلاثية:" data-en="Triple:" data-fr="Triple :">ثلاثية:</li> <b>${offer.price_triple || '-'}</b> <span data-ar="دينار" data-en="Dinar" data-fr="Dinar">دينار</span>
          <li data-ar="رباعية:" data-en="Quad:" data-fr="Quadruple :">رباعية:</li> <b>${offer.price_quad || '-'}</b> <span data-ar="دينار" data-en="Dinar" data-fr="Dinar">دينار</span>
          <li data-ar="خماسية:" data-en="Quint:" data-fr="Quintuple :">خماسية:</li> <b>${offer.price_quint || '-'}</b> <span data-ar="دينار" data-en="Dinar" data-fr="Dinar">دينار</span>
        </ul>
      </div>
      <div style=\"margin-top:10px;text-align:left;\">
        <button class=\"btn btn-secondary\" onclick=\"document.getElementById('offerDetailsModal').style.display='none'\"><span data-ar="إغلاق" data-en="Close" data-fr="Fermer">إغلاق</span></button>
      </div>
    </div>`;
    let modal = document.getElementById('offerDetailsModal');
    let content = document.getElementById('offerDetailsContent');
    if (modal && content) {
      content.innerHTML = html;
      modal.style.display = 'flex';
      // Apply language to all modal fields
      var lang = localStorage.getItem('umrah_admin_lang') || 'ar';
      content.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(function(el) {
        if (el.dataset[lang]) {
          el.textContent = el.dataset[lang];
        }
      });
      modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
    }
  } catch (e) {
    showShortMessage('تعذر جلب التفاصيل', 'error');
  }
}

// تعديل عرض (فتح المودال مع تعبئة البيانات)
window.editOffer = async function(id) {
  try {
    // جلب بيانات العرض
    const res = await fetch(`${API_BASE}?id=${id}`, {
      headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN }
    });
    const data = await res.json();
    let offer = null;
    if (res.ok && data.offers) {
      offer = Array.isArray(data.offers) ? data.offers.find(o => o.id == id) : data.offers;
    }
    if (!offer) {
      showShortMessage('العرض غير موجود', 'error');
      return;
    }
    // تعبئة النموذج
    for (const [key, value] of Object.entries(offer)) {
      const input = addOfferForm.querySelector(`[name="${key}"]`);
      if (input && input.type !== 'file') input.value = value || '';
    }
    // تعبئة الخدمات
    let selectedServices = {};
    if (offer.services && typeof offer.services === 'object') selectedServices = offer.services;
    else if (typeof offer.services === 'string') {
      try { selectedServices = JSON.parse(offer.services); } catch { selectedServices = {}; }
    }
    updateServicesInput(selectedServices);
    renderServices(selectedServices);
    // جلب الفروع وشركات الطيران وتحديد شركة الطيران المختارة
    // (سيتم تحديد الفروع تلقائياً في fillBranchesAndAirlines)
    await fillBranchesAndAirlines({ ...offer, branches: data.branches });
    // فتح المودال
    showModal(addOfferModal);
    // عند الحفظ: إرسال PUT بدلاً من POST
    addOfferForm.onsubmit = async function(e) {
      e.preventDefault();
      const formData = new FormData(addOfferForm);
      if (formData.get('main_image_file')) {
        formData.append('main_image', formData.get('main_image_file'));
        formData.delete('main_image_file');
      }
      if (formData.getAll('hotel_images_file').length) {
        for (const file of formData.getAll('hotel_images_file')) {
          formData.append('hotel_images', file);
        }
        formData.delete('hotel_images_file');
      }
      // جمع الفروع المختارة من قائمة checkboxes
      const branchCheckboxes = document.querySelectorAll('#branchesListBox input[type=checkbox][name=branchesBox]');
      let selectedBranches = Array.from(branchCheckboxes).filter(chk => chk.checked).map(chk => chk.value);
      if (!selectedBranches.length) selectedBranches = ['main'];
      formData.delete('agency_id');
      // إرسال branch_ids كمصفوفة وليس كـ JSON string
      selectedBranches.forEach(branchId => formData.append('branch_ids', branchId));
      // إضافة الخدمات
      formData.set('services', servicesInput.value);
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          method: 'PUT',
          headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN },
          body: formData
        });
        const data = await res.json();
        if (res.ok) {
          showShortMessage('تم تعديل العرض بنجاح', 'success');
          hideModal(addOfferModal);
          addOfferForm.reset();
          fetchOffers();
        } else {
          showShortMessage(data.error || 'فشل التعديل', 'error');
        }
      } catch (e) {
        showShortMessage('خطأ في الاتصال بالخادم', 'error');
      }
      // إعادة onsubmit للوضع الافتراضي بعد التعديل
      addOfferForm.onsubmit = defaultAddOfferSubmit;
    }
  } catch (e) {
    showShortMessage('تعذر جلب بيانات العرض', 'error');
  }
}

// لم يعد هناك حاجة لتعريف defaultAddOfferSubmit هنا، أصبح معرفاً أعلاه

// البحث
if (searchOffers) {
  searchOffers.oninput = function() {
    const val = this.value.trim();
    // بحث محلي فقط (يمكن تطويره ليكون من السيرفر)
    const cards = offersGrid.querySelectorAll('.offer-card');
    cards.forEach(card => {
      const title = card.querySelector('h3').textContent;
      card.style.display = title.includes(val) ? '' : 'none';
    });
  }
}

// --- تصدير البيانات ---
const exportOffersBtn = document.getElementById('exportOffersBtn');
exportOffersBtn && (exportOffersBtn.onclick = async function() {
  exportOffersBtn.disabled = true;
  exportOffersBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التصدير...';
  try {
    // جلب كل العروض من السيرفر
    const res = await fetch(API_BASE, { headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN } });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.offers)) throw new Error(data.error || 'فشل جلب البيانات');
    // تجهيز البيانات للتصدير
    const offers = data.offers;
    if (!offers.length) throw new Error('لا توجد عروض للتصدير');
    // رؤوس الأعمدة
    const headers = [
      'اسم العرض', 'تاريخ الذهاب', 'تاريخ العودة', 'مدة الرحلة', 'نوع الرحلة', 'شركة الطيران',
      'اسم الفندق', 'المسافة للحرم', 'السعر مزدوجة', 'السعر ثلاثية', 'السعر رباعية', 'السعر خماسية', 'الخدمات', 'الوصف', 'الدخول', 'الخروج', 'تاريخ الإنشاء', 'رقم العرض'
    ];
    // تحويل كل عرض إلى صف
    const rows = offers.map(o => [
      o.title || '',
      o.departure_date || '',
      o.return_date || '',
      o.duration_days || '',
      o.flight_type || '',
      o.airline_id || '',
      o.hotel_name || '',
      o.hotel_distance || '',
      o.price_double || '',
      o.price_triple || '',
      o.price_quad || '',
      o.price_quint || '',
      typeof o.services === 'object' ? Object.keys(o.services).filter(k => o.services[k]).join(', ') : (o.services || ''),
      o.description || '',
      o.entry || '',
      o.exit || '',
      o.created_at ? o.created_at.split('T')[0] : '',
      o.id || ''
    ]);
    // بناء CSV
    let csv = '\uFEFF' + headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(val => '"' + String(val).replace(/"/g, '""') + '"').join(',') + '\n';
    });
    // إنشاء ملف وتحميله
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'offers_export.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    showShortMessage('تم تصدير البيانات بنجاح', 'success');
  } catch (e) {
    showShortMessage(e.message || 'فشل التصدير', 'error');
  } finally {
    exportOffersBtn.disabled = false;
    exportOffersBtn.innerHTML = '<i class="fas fa-download"></i> <span>تصدير البيانات</span>';
  }
});

// --- الخدمات (services) ---
const servicesList = [
  { key: 'التأشيرة', icon: 'fa-passport', color: '#176a3d' },
  { key: 'الإرشاد', icon: 'fa-user-tie', color: '#34495e' },
  { key: 'الإطعام', icon: 'fa-utensils', color: '#f7ca18' },
  { key: 'النقل', icon: 'fa-bus', color: '#1e824c' },
];

const servicesIconsContainer = document.getElementById('servicesIconsContainer');
const servicesInput = document.getElementById('servicesInput');

function renderServices(selected = {}) {
  if (!servicesIconsContainer) return;
  let html = '';
  servicesList.forEach(service => {
    const checked = selected[service.key] ? 'service-selected' : '';
    html += `<div class="service-icon-select ${checked}" data-key="${service.key}" style="display:inline-block;margin:0 7px 7px 0;cursor:pointer;border:2px solid ${checked ? service.color : '#eee'};background:${checked ? '#f7f7f7' : '#fff'};color:${checked ? service.color : '#888'};padding:10px 10px 6px 10px;border-radius:9px;min-width:60px;text-align:center;transition:all 0.2s;">
      <div class="icon"><i class="fas ${service.icon}" style="color:${service.color};font-size:1.5em;"></i></div>
      <div class="label" style="font-size:0.85em;">${service.key}</div>
    </div>`;
  });
  servicesIconsContainer.innerHTML = html;
  // إضافة الأحداث
  servicesIconsContainer.querySelectorAll('.service-icon-select').forEach(div => {
    div.onclick = function() {
      const key = this.getAttribute('data-key');
      const current = getServicesObj();
      current[key] = !current[key];
      updateServicesInput(current);
      renderServices(current);
    };
  });
}

function getServicesObj() {
  try {
    return servicesInput.value ? JSON.parse(servicesInput.value) : {};
  } catch { return {}; }
}

function updateServicesInput(obj) {
  servicesInput.value = JSON.stringify(obj);
}

// عند فتح إضافة عرض جديد أو تعديل، يجب إعادة توليد الخدمات حسب القيمة
if (openAddOfferModalBtn) {
  openAddOfferModalBtn.addEventListener('click', () => {
    updateServicesInput({});
    renderServices({});
  });
}
if (addOfferModal) {
  addOfferModal.addEventListener('show', () => {
    updateServicesInput({});
    renderServices({});
  });
}

// عند تعديل عرض: تعبئة الخدمات المختارة
window.editOffer = async function(id) {
  try {
    // جلب بيانات العرض
    const res = await fetch(`${API_BASE}?id=${id}`, {
      headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN }
    });
    const data = await res.json();
    let offer = null;
    if (res.ok && data.offers) {
      offer = Array.isArray(data.offers) ? data.offers.find(o => o.id == id) : data.offers;
    }
    if (!offer) {
      showShortMessage('العرض غير موجود', 'error');
      return;
    }
    // تعبئة النموذج
    for (const [key, value] of Object.entries(offer)) {
      const input = addOfferForm.querySelector(`[name="${key}"]`);
      if (input && input.type !== 'file') input.value = value || '';
    }
    // تعبئة الخدمات
    let selectedServices = {};
    if (offer.services && typeof offer.services === 'object') selectedServices = offer.services;
    else if (typeof offer.services === 'string') {
      try { selectedServices = JSON.parse(offer.services); } catch { selectedServices = {}; }
    }
    updateServicesInput(selectedServices);
    renderServices(selectedServices);
    // جلب الفروع وشركات الطيران وتحديد شركة الطيران المختارة
    // (سيتم تحديد الفروع تلقائياً في fillBranchesAndAirlines)
    await fillBranchesAndAirlines({ ...offer, branches: data.branches });
    // فتح المودال
    showModal(addOfferModal);
    // عند الحفظ: إرسال PUT بدلاً من POST
    addOfferForm.onsubmit = async function(e) {
      e.preventDefault();
      const formData = new FormData(addOfferForm);
      if (formData.get('main_image_file')) {
        formData.append('main_image', formData.get('main_image_file'));
        formData.delete('main_image_file');
      }
      if (formData.getAll('hotel_images_file').length) {
        for (const file of formData.getAll('hotel_images_file')) {
          formData.append('hotel_images', file);
        }
        formData.delete('hotel_images_file');
      }
      // جمع الفروع المختارة من قائمة checkboxes
      // طباعة عدد عناصر الفروع في DOM قبل الجمع (تعديل)
      const branchCheckboxes = document.querySelectorAll('#branchesListBox input[type=checkbox][name=branchesBox]');
      let selectedBranches = Array.from(branchCheckboxes).filter(chk => chk.checked).map(chk => chk.value);
      if (!selectedBranches.length) selectedBranches = ['main'];
      formData.delete('agency_id');
      // إرسال branch_ids كمصفوفة وليس كـ JSON string
      selectedBranches.forEach(branchId => formData.append('branch_ids', branchId));
      // إضافة الخدمات
      formData.set('services', servicesInput.value);
      try {
        const res = await fetch(`${API_BASE}/${id}`, {
          method: 'PUT',
          headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN },
          body: formData
        });
        const data = await res.json();
        if (res.ok) {
          showShortMessage('تم تعديل العرض بنجاح', 'success');
          hideModal(addOfferModal);
          addOfferForm.reset();
          fetchOffers();
        } else {
          showShortMessage(data.error || 'فشل التعديل', 'error');
        }
      } catch (e) {
        showShortMessage('خطأ في الاتصال بالخادم', 'error');
      }
      // إعادة onsubmit للوضع الافتراضي بعد التعديل
      addOfferForm.onsubmit = defaultAddOfferSubmit;
    }
  } catch (e) {
    showShortMessage('تعذر جلب بيانات العرض', 'error');
  }
}

// عند إضافة عرض جديد: إضافة الخدمات
if (addOfferForm) {
  var defaultAddOfferSubmit = async function(e) {
    e.preventDefault();
    // تعطيل زر الحفظ مؤقتاً
    const saveBtn = addOfferForm.querySelector('button[type="submit"]');
    const oldText = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';
    }
    const formData = new FormData(addOfferForm);
    // تحويل صور الفندق والصورة الرئيسية للأسماء الصحيحة
    if (formData.get('main_image_file')) {
      formData.append('main_image', formData.get('main_image_file'));
      formData.delete('main_image_file');
    }
    if (formData.getAll('hotel_images_file').length) {
      for (const file of formData.getAll('hotel_images_file')) {
        formData.append('hotel_images', file);
      }
      formData.delete('hotel_images_file');
    }
    // جمع الفروع المختارة من قائمة checkboxes
    const branchCheckboxes = document.querySelectorAll('#branchesListBox input[type=checkbox][name=branchesBox]');
    let selectedBranches = Array.from(branchCheckboxes).filter(chk => chk.checked).map(chk => chk.value);
    if (!selectedBranches.length) selectedBranches = ['main'];
    formData.delete('agency_id'); // لم يعد مستخدمًا
    // إرسال الفروع المختارة للـ API عبر branch_ids
    selectedBranches.forEach(branchId => formData.append('branch_ids', branchId));
    // ...existing code...
    // إضافة الخدمات
    formData.set('services', servicesInput.value);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + AUTH_TOKEN },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        showShortMessage('تمت إضافة العرض بنجاح', 'success');
        hideModal(addOfferModal);
        addOfferForm.reset();
        fetchOffers();
      } else {
        showShortMessage(data.error || 'فشل الإضافة', 'error');
      }
    } catch (e) {
      showShortMessage('خطأ في الاتصال بالخادم', 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = oldText;
      }
    }
  };
  addOfferForm.onsubmit = defaultAddOfferSubmit;
}

// حساب مدة الرحلة تلقائياً عند تغيير التواريخ
const departureInput = document.querySelector('input[name="departure_date"]');
const returnInput = document.querySelector('input[name="return_date"]');
const durationInput = document.querySelector('input[name="duration_days"]');

function updateDuration() {
  if (departureInput && returnInput && durationInput) {
    const dep = departureInput.value;
    const ret = returnInput.value;
    if (dep && ret) {
      const depDate = new Date(dep);
      const retDate = new Date(ret);
      const diff = Math.round((retDate - depDate) / (1000 * 60 * 60 * 24));
      if (!isNaN(diff) && diff >= 0) {
        durationInput.value = diff + 1; // يشمل يوم الذهاب والعودة
      } else {
        durationInput.value = '';
      }
    }
  }
}
if (departureInput) departureInput.addEventListener('change', updateDuration);
if (returnInput) returnInput.addEventListener('change', updateDuration);

// تحميل العروض عند بدء الصفحة
fetchOffers();





 // Unified sidebar loader
function applyLanguage(lang) {
  // Update all elements with data-ar, data-en, data-fr
  document.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(function(el) {
    if (el.dataset[lang]) {
      el.textContent = el.dataset[lang];
    }
  });
  // Also update action buttons in offersGrid
  if (offersGrid) {
    offersGrid.querySelectorAll('[data-ar], [data-en], [data-fr]').forEach(function(el) {
      if (el.dataset[lang]) {
        el.textContent = el.dataset[lang];
      }
    });
  }
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
      if (!current || current === '') current = 'manage_offers.html';
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
