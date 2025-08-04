
// تحميل الشريط العلوي إذا وجد عنصر مخصص له
const topBarPlaceholder = document.getElementById('top-bar-placeholder');
if (topBarPlaceholder) {
  fetch('components/top-bar.html')
    .then(res => res.text())
    .then(html => {
      topBarPlaceholder.innerHTML = html;
      // إعادة تفعيل السكريبتات داخل الشريط العلوي بعد إدراجه
      const scripts = topBarPlaceholder.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
      });
    });
}

// تحميل الشريط السفلي إذا وجد عنصر مخصص له
const bottomBarPlaceholder = document.getElementById('bottom-bar-placeholder');
if (bottomBarPlaceholder) {
  fetch('components/bottom-bar.html')
    .then(res => res.text())
    .then(html => {
      bottomBarPlaceholder.innerHTML = html;
      // إعادة تفعيل السكريبتات داخل الشريط السفلي بعد إدراجه
      const scripts = bottomBarPlaceholder.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        document.body.appendChild(newScript);
      });
    });
}
