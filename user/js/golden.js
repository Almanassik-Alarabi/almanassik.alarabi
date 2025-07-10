// دالة لجلب العروض الذهبية من API وعرضها في الصفحة
async function fetchAndDisplayGoldenOffers() {
    const offersContainer = document.querySelector('.offers-container1');
    offersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center;">جاري التحميل...</div>';
    try {
        const response = await fetch('https://almanassik-alarabis-v0-4.onrender.com/api/user/offers/golden');
        const offers = await response.json();
        if (!Array.isArray(offers) || offers.length === 0) {
            offersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center;">لا توجد عروض ذهبية حالياً</div>';
            return;
        }
        // تحديد أقل سعر quint متوفر
        let minPrice = Infinity;
        let bestOfferId = null;
        offers.forEach(offer => {
            if (Number(offer.price_quint) && Number(offer.price_quint) < minPrice) {
                minPrice = Number(offer.price_quint);
                bestOfferId = offer.id;
            }
        });
        offersContainer.innerHTML = `<section class="offers-container">${offers.map(offer => {
            let servicesHtml = '';
            if (offer.services && typeof offer.services === 'object') {
                // خريطة الأيقونات حسب اسم الخدمة
                const serviceIcons = {
                  transport: 'fa-bus',
                  flight: 'fa-plane',
                  visa: 'fa-passport',
                  guide: 'fa-user-tie',
                  meals: 'fa-utensils',
                  insurance: 'fa-shield-heart',
                  zamzam: 'fa-tint',
                  hotel: 'fa-hotel',
                  sim: 'fa-sim-card',
                  laundry: 'fa-soap',
                  gifts: 'fa-gift',
                  wifi: 'fa-wifi',
                  // أضف المزيد حسب الحاجة
                };
                servicesHtml = Object.keys(offer.services).filter(key => offer.services[key]).map(key => {
                    const icon = serviceIcons[key] || 'fa-check-circle';
                    return `<span class="service-icon-with-label"><i class="fas ${icon}"></i><span class="service-label">${key}</span></span>`;
                }).join(' ');
            }
            let agencyName = offer.agencies && offer.agencies.name ? offer.agencies.name : '';
            let mainImage = offer.main_image || (offer.hotel_images && offer.hotel_images[0]) || '';
            let locationHtml = '';
            if (offer.entry && offer.exit) {
                locationHtml = `<span class="offer-location"><i class="fas fa-plane-departure"></i> ${offer.entry}</span> <span class="offer-location"><i class="fas fa-plane-arrival"></i> ${offer.exit}</span>`;
            }
            let bestBadge = (offer.id === bestOfferId) ? `<div class="offer-badge best-offer"><i class='fas fa-crown'></i></div>` : '';
            return `
            <div class="offer-card">
                ${bestBadge}
                <img src="${mainImage}" alt="${offer.title || ''}" class="offer-image">
                <div class="offer-content">
                    <h3 class="offer-title">${offer.title || ''}</h3>
                    <div class="offer-agency-location-row">
                        <div class="offer-agency"><i class="fas fa-building"></i> ${agencyName}</div>
                        <div class="offer-location-group">${locationHtml}</div>
                    </div>
                    <div class="offer-details">
                        ${servicesHtml}
                    </div>
                    <div class="offer-bottom">
                      <div class="offer-price">
                        <button class="offer-btn golden-btn" onclick="window.location.href='offer-details.html?id=${offer.id}'"><i class="fas fa-eye"></i> تفاصيل</button>
                        <span class="price-amount">
                          <span class="people-icons">
                            <i class="fas fa-user"></i>
                            <i class="fas fa-user"></i>
                            <i class="fas fa-user"></i>
                          
                          </span>
                            <span class="people-icons">
                            <i class="fas fa-user"></i>
                            <i class="fas fa-user"></i>
                    
                          </span>
                          <span class="price-text">
                            ${Number(offer.price_quint) ? offer.price_quint + ' DA' : '<span class="not-available">غير متوفر</span>'}
                          </span>
                        </span>
                      </div>
                    </div>
                </div>
            </div>
            `;
        }).join('')}</section>`;
    } catch (err) {
        offersContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:red;">حدث خطأ أثناء جلب العروض الذهبية</div>';
    }
}

// تحميل المكونات عند بدء الصفحة
window.addEventListener('DOMContentLoaded', fetchAndDisplayGoldenOffers);
