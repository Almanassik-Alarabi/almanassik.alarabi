// authGuard.js
// هذا الكود يتحقق من وجود التوكن في localStorage، إذا لم يوجد يعيد التوجيه لصفحة تسجيل الدخول
(function() {
    // اسم التوكن حسب ما تستخدمه في مشروعك، عدله إذا كان مختلفاً
    const token = localStorage.getItem('agency_token');
    if (!token) {
        window.location.href = '/public/agencie/login_agencie.html';
    }
})();
