// طباعة التوكن وrefresh_token الحاليين كل 10 دقائق

let agencyStats = {
  offersCount: 0,
  bookingsCount: 0,
  offers: [],
  bookings: [],
  siteStats: [],
  offersViews: 0,
};

// جلب إحصائيات الوكالة من API
async function fetchAgencyStats() {
  let agency = null;
  let token = null;
  try {
    agency = JSON.parse(localStorage.getItem('agency_data'));
    token = localStorage.getItem('agency_token');
  } catch(e) {}
  // Debug: تحقق من قراءة بيانات الوكالة
  if (!agency || !agency.id) {
    alert('تعذر العثور على بيانات الوكالة. يرجى تسجيل الدخول مجددًا.');
    return;
  }
  if (!token) {
    alert('تعذر العثور على رمز الدخول. يرجى تسجيل الدخول مجددًا.');
    return;
  }
  try {
    const res = await fetch(`https://almanassik-alarabi-server-v-01.onrender.com/api/agency/stats/${agency.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('فشل في جلب الإحصائيات');
    const data = await res.json();
    agencyStats.offersCount = data.offersCount || 0;
    agencyStats.bookingsCount = data.bookingsCount || 0;
    agencyStats.offers = Array.isArray(data.offers) ? data.offers : [];
    agencyStats.bookings = Array.isArray(data.bookings) ? data.bookings : [];
    agencyStats.siteStats = Array.isArray(data.siteStats) ? data.siteStats : [];
    agencyStats.offersViews = data.offersViews || 0;
  } catch (err) {
    // إبقاء القيم الافتراضية
  }
}

// تعبئة بطاقات الإحصائيات
function renderStats() {
  const statsGrid = document.getElementById('statsGrid');
  if (!statsGrid) return;
  statsGrid.innerHTML = `
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-icon"><i class="fas fa-tags"></i></span>
        <div>
          <div class="stat-number">${agencyStats.offersCount}</div>
          <div class="stat-label translatable"
            data-ar="عدد عروض وكالتك"
            data-en="Your Agency's Offers Count"
            data-fr="Nombre d'offres de votre agence"
          >عدد عروض وكالتك</div>
        </div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-icon"><i class="fas fa-book"></i></span>
        <div>
          <div class="stat-number">${agencyStats.bookingsCount}</div>
          <div class="stat-label translatable"
            data-ar="عدد حجوزات عروضك"
            data-en="Your Offers Bookings Count"
            data-fr="Nombre de réservations de vos offres"
          >عدد حجوزات عروضك</div>
        </div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-icon"><i class="fas fa-users"></i></span>
        <div>
          <div class="stat-number">${agencyStats.siteStats.reduce((sum, s) => sum + (s.visit_count || 0), 0)}</div>
          <div class="stat-label translatable"
            data-ar="عدد زوار موقعك"
            data-en="Your Site Visitors"
            data-fr="Visiteurs de votre site"
          >عدد زوار موقعك</div>
        </div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-icon"><i class="fas fa-eye"></i></span>
        <div>
          <div class="stat-number">${agencyStats.offersViews}</div>
          <div class="stat-label translatable"
            data-ar="زوار عروضك"
            data-en="Your Offers Visitors"
            data-fr="Visiteurs de vos offres"
          >زوار عروضك</div>
        </div>
      </div>
    </div>
  `;
}

// رسم مخططات الداشبورد
function renderCharts() {
  // حجوزات الشهرية
  const ctxBookings = document.getElementById('monthlyBookingsChart').getContext('2d');
  // تجهيز بيانات الحجوزات الشهرية
  const months = Array.from({length: 12}, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return d.toLocaleString('default', { month: 'short' });
  });
  const bookingsPerMonth = months.map((m, idx) => {
    // siteStats فيه زيارات لكل شهر، لكن الحجوزات نحتاج تجميعها حسب الشهر
    const monthNum = new Date().getMonth() - (11 - idx);
    const year = new Date().getFullYear();
    return agencyStats.bookings.filter(b => {
      const d = new Date(b.created_at);
      return d.getMonth() === ((monthNum + 12) % 12) && d.getFullYear() === year;
    }).length;
  });
  new Chart(ctxBookings, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'الحجوزات',
        data: bookingsPerMonth,
        backgroundColor: '#4e73df',
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  // توزيع العروض حسب الولاية
  const ctxDist = document.getElementById('agencyDistributionChart').getContext('2d');
  // نفترض أن كل عرض فيه حقل entry (الولاية)
  const wilayas = {};
  agencyStats.offers.forEach(o => {
    if (o.entry) wilayas[o.entry] = (wilayas[o.entry] || 0) + 1;
  });
  new Chart(ctxDist, {
    type: 'pie',
    data: {
      labels: Object.keys(wilayas),
      datasets: [{
        data: Object.values(wilayas),
        backgroundColor: ['#36b9cc', '#1cc88a', '#f6c23e', '#e74a3b', '#858796'],
      }]
    },
    options: { plugins: { legend: { position: 'bottom' } } }
  });

  // أكثر عروض الوكالة طلباً
  const ctxTopOffers = document.getElementById('topRequestedOffersChart').getContext('2d');
  // نجمع عدد الحجوزات لكل عرض
  const offerBookings = {};
  agencyStats.bookings.forEach(b => {
    offerBookings[b.offer_id] = (offerBookings[b.offer_id] || 0) + 1;
  });
  // ترتيب العروض حسب عدد الحجوزات
  const topOffers = Object.entries(offerBookings)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topOfferTitles = topOffers.map(([id]) => {
    const offer = agencyStats.offers.find(o => o.id === id);
    return offer ? offer.title : 'عرض #' + id;
  });
  const topOfferCounts = topOffers.map(([_, count]) => count);
  new Chart(ctxTopOffers, {
    type: 'bar',
    data: {
      labels: topOfferTitles,
      datasets: [{
        label: 'عدد الطلبات',
        data: topOfferCounts,
        backgroundColor: '#1cc88a',
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  // زيارات صفحة الوكالة (آخر 12 شهر)
  const ctxVisits = document.getElementById('siteVisitsMonthlyChart').getContext('2d');
  // siteStats فيه stat_month و visit_count
  const visitsMonths = agencyStats.siteStats.map(s => s.stat_month);
  const visitsCounts = agencyStats.siteStats.map(s => s.visit_count);
  new Chart(ctxVisits, {
    type: 'line',
    data: {
      labels: visitsMonths,
      datasets: [{
        label: 'زيارات',
        data: visitsCounts,
        borderColor: '#e74a3b',
        fill: false,
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}


// دعم تغيير اللغة للعناوين وحفظها في localStorage

function setupLanguageSwitcher() {
  // Add event listeners فقط
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      applyLanguage(btn.dataset.lang); // سيتم حفظ اللغة في localStorage داخل applyLanguage
    });
  });
}


// عند تحميل الصفحة، طبّق اللغة المختارة من localStorage مباشرة

document.addEventListener('DOMContentLoaded', async function() {
  await fetchAgencyStats();
  renderStats();
  renderCharts();
  // طبّق اللغة المختارة من localStorage مرة واحدة فقط
  var lang = localStorage.getItem('umrah_admin_lang') || 'ar';
  applyLanguage(lang);
  setupLanguageSwitcher();
});



 // Unified sidebar loader
function applyLanguage(lang) {
  // Update all elements with data-ar, data-en, data-fr
  document.querySelectorAll('.translatable').forEach(function(el) {
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
      if (!current || current === '') current = 'dashboard.html';
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
      // طبّق اللغة المختارة من localStorage على الشريط الجانبي
      var lang = localStorage.getItem('umrah_admin_lang') || 'ar';
      document.querySelectorAll('.sidebar-text').forEach(function(el) {
        if (el.dataset[lang]) {
          el.textContent = el.dataset[lang];
        }
      });
    });
});