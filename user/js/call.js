function fillContactCard() {
  if (!window.home1Texts) return;
  const lang = window.getCurrentLang ? window.getCurrentLang() : 'ar';
  const t = window.home1Texts[lang];
  document.getElementById('contactTitle').textContent = t.contactTitle;
  const contactGrid = document.getElementById('contactGrid');
  contactGrid.innerHTML = '';
  t.contactMethods.forEach(method => {
    const a = document.createElement('a');
    a.className = 'contact-card';
    a.href = method.href;
    a.target = '_blank';
    a.style.textDecoration = 'none';
    a.innerHTML = `
      <span class="contact-icon"><i class="${method.icon}"></i></span>
      <div class="contact-info">
        <h3>${method.label || method.title || ''}</h3>
        <p>${method.value || method.text || ''}</p>
      </div>
    `;
    contactGrid.appendChild(a);
  });
}
document.addEventListener('DOMContentLoaded', fillContactCard);
window.addEventListener('storage', fillContactCard);
