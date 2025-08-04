// رسالة عائمة
function showShortMessage(message, type = 'info', duration = 2200) {
  const oldMsg = document.getElementById('shortMsgToast');
  if (oldMsg) oldMsg.remove();
  const msgDiv = document.createElement('div');
  msgDiv.id = 'shortMsgToast';
  msgDiv.textContent = message;
  msgDiv.style.background = type === 'success' ? 'linear-gradient(90deg,#1e824c,#f7ca18)' : (type === 'error' ? '#c0392b' : '#34495e');
  document.body.appendChild(msgDiv);
  setTimeout(() => {
    msgDiv.style.opacity = '0';
    setTimeout(() => msgDiv.remove(), 600);
  }, duration);
}


let branches = [];
let editBranchId = null;

const API_URL = 'https://almanassik-alarabi-server-v-01.onrender.com/api/agency/branches';
const AIRPORTS_API_URL = 'https://almanassik-alarabi-server-v-01.onrender.com/api/agency/airports';
let airportsList = [];

// جلب التوكن من localStorage بشكل باتي عند كل طلب
function getToken() {
  return localStorage.getItem('agency_token') || '';
}

async function fetchBranches() {
  try {
    const res = await fetch(API_URL, {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    const data = await res.json();
    if (res.ok && data.branches) {
      branches = data.branches;
    } else {
      branches = [];
      showShortMessage(data.error || 'تعذر جلب الفروع', 'error');
    }
  } catch (e) {
    branches = [];
    showShortMessage('خطأ في الاتصال بالخادم', 'error');
  }
}

async function addBranch(branch) {
  try {
    // إعداد الحقول المطلوبة كما في API
    const payload = {
      email: branch.email,
      password: branch.password,
      wilaya: branch.wilaya,
      name: branch.name,
      latitude: Number(branch.latitude),
      longitude: Number(branch.longitude),
      manager_phone: branch.manager_phone,
      location_name: branch.location_name || branch.address || ''

      // airport_ids غير مرسل للـ API الرئيسي
      // address غير مرسل للـ API لأنه غير موجود في الجدول
    };
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.status === 'ok' && data.branch) {
      showShortMessage('تمت إضافة الفرع بنجاح', 'success');
      return data.branch;
    } else {
      showShortMessage(data.error || 'تعذر إضافة الفرع', 'error');
      return null;
    }
  } catch (e) {
    showShortMessage('خطأ في الاتصال بالخادم', 'error');
    return null;
  }
}

async function updateBranch(id, fields) {
  try {
    // Préparer tous les champs nécessaires pour l'API
    const payload = {
      email: fields.email,
      password: fields.password,
      wilaya: fields.wilaya,
      name: fields.name,
      latitude: Number(fields.latitude),
      longitude: Number(fields.longitude),
      manager_phone: fields.manager_phone,
      airport_ids: fields.airport_ids,
      location_name: fields.location_name || fields.address || ''
    };
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.status === 'ok') {
      showShortMessage('تم تحديث بيانات الفرع', 'success');
      return true;
    } else {
      showShortMessage(data.error || 'تعذر تحديث الفرع', 'error');
      return false;
    }
  } catch (e) {
    showShortMessage('خطأ في الاتصال بالخادم', 'error');
    return false;
  }
}

async function removeBranch(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    const data = await res.json();
    if (res.ok && data.status === 'ok') {
      showShortMessage('تم حذف الفرع بنجاح', 'success');
      return true;
    } else {
      showShortMessage(data.error || 'تعذر حذف الفرع', 'error');
      return false;
    }
  } catch (e) {
    showShortMessage('خطأ في الاتصال بالخادم', 'error');
    return false;
  }
}

function renderBranchesTable() {
  const container = document.getElementById('branchesTableContainer');
  if (!branches.length) {
    container.innerHTML = '<div style="text-align:center;color:#888;padding:32px 0;">لا توجد فروع بعد.</div>';
    return;
  }
  let html = `<table class="branches-table">
    <thead><tr>
      <th data-ar="اسم الفرع" data-en="Branch Name" data-fr="Nom de l'agence">اسم الفرع</th>
      <th data-ar="المدينة" data-en="City" data-fr="Ville">المدينة</th>
      <th data-ar="العنوان" data-en="Address" data-fr="Adresse">العنوان</th>
      <th data-ar="إجراءات" data-en="Actions" data-fr="Actions">إجراءات</th>
    </tr></thead><tbody>`;
  branches.forEach(branch => {
    html += `<tr>
      <td>${branch.name || '-'}</td>
      <td>${branch.wilaya || branch.city || '-'}</td>
      <td>${branch.location_name ? branch.location_name : '-'}</td>
      <td class="action-btns">
        <button class="btn btn-secondary" data-id="${branch.id}" data-action="edit"><i class='fas fa-edit'></i> <span data-ar="تعديل" data-en="Edit" data-fr="Modifier">تعديل</span></button>
        <button class="btn btn-danger" data-id="${branch.id}" data-action="delete"><i class='fas fa-trash'></i> <span data-ar="حذف" data-en="Delete" data-fr="Supprimer">حذف</span></button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
  // ربط الأحداث للأزرار
  container.querySelectorAll('button[data-action="edit"]').forEach(btn => {
    btn.onclick = async () => {
      if (!document.getElementById('airportCheckboxes').children.length) {
        await fetchAirports();
        setTimeout(() => {
          openEditBranchModal(btn.getAttribute('data-id'));
        }, 50);
      } else {
        openEditBranchModal(btn.getAttribute('data-id'));
      }
    };
  });
  container.querySelectorAll('button[data-action="delete"]').forEach(btn => {
    btn.onclick = () => deleteBranch(btn.getAttribute('data-id'));
  });
}


function openAddBranchModal() {
  editBranchId = null;
  const form = document.getElementById('branchForm');
  form.reset();
  // إفراغ جميع الحقول يدويًا لضمان عدم بقاء بيانات قديمة
  form.name.value = '';
  form.city.value = '';
  document.getElementById('addressInput').value = '';
  form.email.value = '';
  form.password.value = '';
  form.latitude.value = '';
  form.longitude.value = '';
  form.manager_phone.value = '';
  // إلغاء تحديد جميع المطارات
  const checkboxes = document.querySelectorAll('input[name="airport_ids"]');
  checkboxes.forEach(cb => cb.checked = false);
  document.getElementById('branchModalTitle').textContent = 'إضافة فرع جديد';
  document.getElementById('branchModal').classList.add('show');
}

function openEditBranchModal(id) {
  const branch = branches.find(b => b.id === id);
  if (!branch) {
    return;
  }
  editBranchId = id;
  const form = document.getElementById('branchForm');
  form.name.value = branch.name || '';
  form.city.value = branch.wilaya || branch.city || '';
  document.getElementById('addressInput').value = branch.address || branch.departure_airport || branch.location_name || branch.name || '';
  form.email.value = branch.email || '';
  form.password.value = branch.password || '';
  form.latitude.value = branch.latitude || '';
  form.longitude.value = branch.longitude || '';
  // لا داعي لإضافة الزر برمجياً، أصبح في HTML

// تفعيل زر تحديد الموقع تلقائياً ليملأ خطوط الطول والعرض
document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('detectLocationBtn');
  if (btn) {
    btn.onclick = function() {
      const form = document.getElementById('branchForm');
      if (!navigator.geolocation) {
        showShortMessage('المتصفح لا يدعم تحديد الموقع الجغرافي', 'error');
        return;
      }
      btn.disabled = true;
      btn.textContent = '...جاري التحديد';
      navigator.geolocation.getCurrentPosition(function(pos) {
        form.latitude.value = pos.coords.latitude;
        form.longitude.value = pos.coords.longitude;
        showShortMessage('تم تحديد الموقع بنجاح', 'success');
        btn.textContent = 'تحديد الموقع تلقائياً';
        btn.disabled = false;
      }, function(err) {
        showShortMessage('تعذر تحديد الموقع', 'error');
        btn.textContent = 'تحديد الموقع تلقائياً';
        btn.disabled = false;
      });
    };
  }
});
  form.manager_phone.value = branch.manager_phone || '';
  // إلغاء تحديد جميع المطارات أولاً
  const checkboxes = document.querySelectorAll('input[name="airport_ids"]');
  checkboxes.forEach(cb => cb.checked = false);
  // ثم تحديد المطارات المرتبطة
  if (Array.isArray(branch.airport_ids)) {
    branch.airport_ids.forEach(id => {
      const cb = document.querySelector('input[name="airport_ids"][value="'+id+'"]');
      if (cb) cb.checked = true;
    });
  }
  document.getElementById('branchModalTitle').textContent = 'تعديل بيانات الفرع';
  document.getElementById('branchModal').classList.add('show');
}

function closeBranchModal() {
  document.getElementById('branchModal').classList.remove('show');
}

async function deleteBranch(id) {
  if (confirm('هل أنت متأكد من حذف هذا الفرع؟')) {
    const ok = await removeBranch(id);
    if (ok) {
      await fetchBranches();
      renderBranchesTable();
    }
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  // جلب المطارات وملء القائمة
  await fetchAirports();
  await fetchBranches();
  renderBranchesTable();
  document.getElementById('openAddBranchModalBtn').onclick = openAddBranchModal;
  document.getElementById('closeBranchModalBtn').onclick = closeBranchModal;
  document.getElementById('cancelBranchBtn').onclick = closeBranchModal;
document.getElementById('branchForm').onsubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn.disabled) return; // منع التكرار
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = '...جاري الإضافة';
  const name = form.name.value.trim();
  const city = form.city.value.trim();
  const address = form.address.value.trim();
  const email = form.email ? form.email.value.trim() : '';
  const password = form.password ? form.password.value.trim() : '';
  const latitude = form.latitude ? form.latitude.value.trim() : '';
  const longitude = form.longitude ? form.longitude.value.trim() : '';
  const manager_phone = form.manager_phone ? form.manager_phone.value.trim() : '';
  const airport_ids = Array.from(document.querySelectorAll('input[name="airport_ids"]:checked')).map(cb => Number(cb.value));
  if (!name || !city || !email || !password || !latitude || !longitude || !manager_phone || airport_ids.length === 0) {
    showShortMessage('يرجى ملء جميع الحقول المطلوبة واختيار مطار واحد على الأقل', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    return;
  }
  if (editBranchId) {
    // تعديل فرع
    const ok = await updateBranch(editBranchId, {
      name,
      wilaya: city,
      address: address,
      email,
      password,
      latitude,
      longitude,
      manager_phone,
      airport_ids
    });
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    if (ok) {
      await fetchBranches();
      closeBranchModal();
      renderBranchesTable();
    }
  } else {
    // إضافة فرع جديد
    const branch = await addBranch({
      name,
      wilaya: city,
      address: address,
      email,
      password,
      latitude,
      longitude,
      manager_phone,
      airport_ids
    });
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    if (branch) {
      await fetchBranches();
      closeBranchModal();
      renderBranchesTable();
    }
  }
};
  // إغلاق المودال عند الضغط خارج المحتوى
  document.getElementById('branchModal').addEventListener('click', function(e) {
    if (e.target === this) closeBranchModal();
  });
});

// جلب المطارات وملء القائمة
async function fetchAirports() {
  try {
    const res = await fetch(AIRPORTS_API_URL);
    const data = await res.json();
    if (Array.isArray(data)) {
      airportsList = data;
      const container = document.getElementById('airportCheckboxes');
      container.innerHTML = data.map(a =>
        `<label style='display:inline-flex;align-items:center;gap:3px;'>
          <input type='checkbox' name='airport_ids' value='${a.id}'> ${a.name} (${a.code})
        </label>`
      ).join('');
    }
  } catch (e) {
    showShortMessage('تعذر جلب قائمة المطارات', 'error');
  }
}
 
  // إغلاق المودال عند الضغط خارج المحتوى
  document.getElementById('branchModal').addEventListener('click', function(e) {
    if (e.target === this) closeBranchModal();
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
      if (!current || current === '') current = 'manage_branches.html';
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