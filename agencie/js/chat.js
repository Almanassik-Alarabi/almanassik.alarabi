const API_BASE = 'https://almanassik-alarabi-server-v-01.onrender.com/api/agency/chat';

const token = localStorage.getItem('agency_token') || '';
let currentChatId = null;
let agencyId = null;

// تعريف عنصر اختيار الصورة في الأعلى
const imageInput = document.getElementById('imageInput');


// إنشاء نافذة منبثقة لإشعار اختيار الصورة: تُنشأ مرة واحدة فقط عند تحميل الصفحة (خارج أي دالة)
let imageModal = document.getElementById('imageModalPopup');
if (!imageModal) {
  imageModal = document.createElement('div');
  imageModal.id = 'imageModalPopup';
  imageModal.style.display = 'none';
  imageModal.innerHTML = `
    <div id="imageModalOverlay" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0007;z-index:9999;display:flex;align-items:center;justify-content:center;">
      <div style="background:#fffbe6;padding:32px 28px 22px 28px;border-radius:18px;box-shadow:0 8px 32px #0003;min-width:320px;max-width:90vw;text-align:center;position:relative;">
        <div style="color:#176a3d;font-size:1.1em;margin-bottom:12px;">تم اختيار صورة:</div>
        <div id="imageModalFileName" style="font-weight:600;color:#1e824c;font-size:1.08em;margin-bottom:18px;"></div>
        <button id="sendImageBtn" style="background:#176a3d;color:#fff;border:none;border-radius:6px;padding:7px 22px;font-size:1.05em;cursor:pointer;margin:0 8px 0 8px;">إرسال</button>
        <button id="clearImageBtn" style="background:#fffbe6;color:#bfa441;border:1px solid #f5e6b2;border-radius:6px;padding:7px 22px;font-size:1.05em;cursor:pointer;margin:0 8px 0 8px;">إلغاء</button>
      </div>
    </div>
  `;
  document.body.appendChild(imageModal);
}

// إضافة event listener لمرة واحدة فقط عند تحميل الصفحة
if (imageInput) {
  imageInput.addEventListener('change', function() {
    if (imageInput.files && imageInput.files[0]) {
      document.getElementById('imageModalFileName').textContent = imageInput.files[0].name;
      imageModal.style.display = 'block';
      // زر إرسال الصورة
      const sendBtn = document.getElementById('sendImageBtn');
      sendBtn.onclick = async function() {
        const errorDiv = getOrCreateErrorDiv();
        errorDiv.textContent = '';
        if (!currentChatId) {
          errorDiv.textContent = 'لا توجد محادثة محددة.';
          return;
        }
        const imageFile = imageInput.files[0];
        if (!imageFile) return;
        const formData = new FormData();
        formData.append('chatId', currentChatId);
        formData.append('image', imageFile);
        try {
          const resp = await fetch(`${API_BASE}/chats/${currentChatId}/messages`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
          });
          const data = await resp.json();
          if (data.error) {
            errorDiv.textContent = 'خطأ من الخادم: ' + (data.error.message || data.error);
            console.error('API error:', data.error);
            return;
          }
          imageInput.value = '';
          imageModal.style.display = 'none';
          loadMessages();
        } catch (err) {
          errorDiv.textContent = 'فشل إرسال الصورة: ' + (err.message || err);
          console.error('Send image error:', err);
        }
      };
    }
  });
}

// جلب المحادثات
async function fetchChats() {
  const res = await fetch(`${API_BASE}/chats`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  if (data.chats) return data.chats;
  return [];
}

// جلب رسائل محادثة
async function fetchMessages(chatId) {
  const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  if (data.messages) return data.messages;
  return [];
}

// إرسال رسالة (فقط نص الرسالة، التوكن يحدد المرسل)
async function sendMessage(chatId, message) {
  const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ message })
  });
  return await res.json();
}

// جلب أو إنشاء محادثة واحدة فقط مع الإدارة
async function populateChats() {
  const chats = await fetchChats();
  if (!chats.length) {
    // إذا لم توجد محادثة، أنشئ واحدة تلقائياً مع أدمن
    try {
      const res = await fetch(`${API_BASE}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (!data.chat && !data.status) {
        currentChatId = null;
        renderMessages([]);
        return;
      }
      // أعد جلب المحادثات بعد الإنشاء
      return await populateChats();
    } catch (err) {
      currentChatId = null;
      renderMessages([]);
      return;
    }
  }
  // دائماً نستخدم أول محادثة (مع الإدارة)
  currentChatId = chats[0].id;
  loadMessages();
}

// إنشاء محادثة جديدة مع أي أدمن (يتم اختياره تلقائياً من السيرفر)
async function startNewChat() {
  const errorDiv = getOrCreateErrorDiv();
  errorDiv.textContent = '';
  try {
    const res = await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (data.error) {
      errorDiv.textContent = 'خطأ في إنشاء المحادثة: ' + (data.error.message || data.error);
      return;
    }
    await populateChats();
    errorDiv.textContent = 'تم إنشاء المحادثة بنجاح!';
  } catch (err) {
    errorDiv.textContent = 'فشل إنشاء المحادثة: ' + (err.message || err);
  }
}



// عرض الرسائل
async function loadMessages() {
  if (!currentChatId) return renderMessages([]);
  const messages = await fetchMessages(currentChatId);
  renderMessages(messages);
}

function renderMessages(messages) {
  const list = document.getElementById('messagesList');
  list.innerHTML = '';
  // عكس ترتيب الرسائل: الأحدث في الأسفل، الصور تدفع الرسائل العلوية فقط
  messages.slice().reverse().forEach(msg => {
    const div = document.createElement('div');
    div.className = 'message-item ' + (msg.sender_type === 'agency' ? 'agency' : 'admin');
    let content = '';
    if (msg.message && msg.message.trim() !== '') {
      content += `<div class=\"message-bubble\">${msg.message}</div>`;
    }
    if (msg.image_url) {
      content += `<div class=\"message-bubble\"><img src=\"${msg.image_url}\" alt=\"صورة مرسلة\" style=\"max-width:180px;max-height:180px;border-radius:8px;display:block;margin:4px auto;object-fit:contain;vertical-align:top;\" /></div>`;
    }
    content += `<div class=\"message-meta\">${formatDate(msg.sent_at)}</div>`;
    div.innerHTML = content;
    list.appendChild(div);
  });
  // إعداد flex-direction: column-reverse على قائمة الرسائل
  list.style.display = 'flex';
  list.style.flexDirection = 'column-reverse';
  // تمرير تلقائي لأعلى ليظهر آخر رسالة (مع column-reverse)
  list.scrollTop = 0;
}

function formatDate(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleString('fr-EG', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
}

// لا يوجد اختيار محادثة أو زر تحديث بعد الآن
// لا حاجة لزر بدء محادثة جديدة بعد الآن

document.getElementById('sendMessageForm').onsubmit = async function(e) {
  e.preventDefault();
  const errorDiv = getOrCreateErrorDiv();
  errorDiv.textContent = '';
  if (!currentChatId) {
    errorDiv.textContent = 'لا توجد محادثة محددة.';
    return;
  }
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  const imageFile = imageInput.files[0];



document.addEventListener('click', function(e) {
  if (e.target && e.target.id === 'clearImageBtn') {
    imageInput.value = '';
    imageModal.style.display = 'none';
  }
  if (e.target && e.target.id === 'closeImageModalBtn') {
    imageModal.style.display = 'none';
  }
  if (e.target && e.target.id === 'imageModalOverlay') {
    imageModal.style.display = 'none';
  }
});

  if (!message && !imageFile) {
    errorDiv.textContent = 'الرسالة فارغة أو لم يتم اختيار صورة!';
    return;
  }

  try {
    // إذا كان هناك صورة، استخدم FormData
    if (imageFile) {
      const formData = new FormData();
      formData.append('chatId', currentChatId);
      if (message) formData.append('message', message);
      formData.append('image', imageFile);

      // ملاحظة: يجب أن يدعم backend استقبال multipart/form-data
      const resp = await fetch(`${API_BASE}/chats/${currentChatId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }, // لا تضع Content-Type مع FormData
        body: formData
      });
      const data = await resp.json();
      if (data.error) {
        errorDiv.textContent = 'خطأ من الخادم: ' + (data.error.message || data.error);
        console.error('API error:', data.error);
        return;
      }
      input.value = '';
      imageInput.value = '';
      loadMessages();
    } else {
      // إرسال نص فقط (بدون صورة)
      const resp = await sendMessage(currentChatId, message);
      if (resp.error) {
        errorDiv.textContent = 'خطأ من الخادم: ' + (resp.error.message || resp.error);
        console.error('API error:', resp.error);
        return;
      }
      input.value = '';
      loadMessages();
    }
  } catch (err) {
    errorDiv.textContent = 'فشل إرسال الرسالة: ' + (err.message || err);
    console.error('Send message error:', err);
  }
};

function getOrCreateErrorDiv() {
  let div = document.getElementById('chatErrorDiv');
  if (!div) {
    div = document.createElement('div');
    div.id = 'chatErrorDiv';
    div.style.color = 'red';
    div.style.textAlign = 'center';
    div.style.margin = '8px 0';
    const form = document.getElementById('sendMessageForm');
    form.parentNode.insertBefore(div, form);
  }
  return div;
}

// تحميل المحادثات عند الدخول
populateChats();

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
  // Load sidebar HTML if needed (example: fetch sidebar.html)
  fetch('sidebar.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('sidebar').innerHTML = html;
      // Highlight the active sidebar link based on current page
      var current = window.location.pathname.split('/').pop();
      if (!current || current === '') current = 'chat.html';
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