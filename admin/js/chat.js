const API_BASE = 'https://almanassik-alarabi-server-v-01.onrender.com/api/admin';
const token = localStorage.getItem('umrah_admin_token') || '';
let currentChatId = null;

// جلب قائمة الوكالات
async function fetchAgencies() {
    try {
        const res = await fetch('https://almanassik-alarabi-server-v-01.onrender.com/api/admin/agencies/all', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        if (data && Array.isArray(data.agencies)) {
            const agencyList = document.getElementById('agencyList');
            agencyList.innerHTML = '<option value="">-- اختر وكالة --</option>';
            // جلب جميع المحادثات للمدير لمعرفة الرسائل غير المقروءة
            const chatsRes = await fetch(`${API_BASE}/chats`, { headers: { 'Authorization': 'Bearer ' + token } });
            const chatsData = await chatsRes.json();
            let unreadByAgency = {};
            if (chatsData && Array.isArray(chatsData.chats)) {
                // لكل محادثة، جلب الرسائل غير المقروءة
                for (const chat of chatsData.chats) {
                    const messagesRes = await fetch(`${API_BASE}/chats/${chat.id}/messages`, { headers: { 'Authorization': 'Bearer ' + token } });
                    const messagesData = await messagesRes.json();
                    if (messagesData && Array.isArray(messagesData.messages)) {
                        const hasUnread = messagesData.messages.some(msg => msg.is_read === false && msg.sender_type === 'agency');
                        if (hasUnread) {
                            unreadByAgency[chat.agency_id] = true;
                        }
                    }
                }
            }
            // ترتيب الوكالات بحيث الحمراء أولاً
            const sortedAgencies = [...data.agencies].sort((a, b) => {
                const aUnread = unreadByAgency[a.id] ? 1 : 0;
                const bUnread = unreadByAgency[b.id] ? 1 : 0;
                return bUnread - aUnread;
            });
            sortedAgencies.forEach(agency => {
                const option = document.createElement('option');
                option.value = agency.id;
                option.textContent = agency.name;
                if (unreadByAgency[agency.id]) {
                    option.style.color = 'red';
                    option.style.fontWeight = 'bold';
                } else {
                    option.style.color = '';
                    option.style.fontWeight = '';
                }
                agencyList.appendChild(option);
            });
        }
    } catch (err) {
        alert('خطأ في جلب الوكالات');
    }
}

// جلب المحادثة أو إنشاؤها مع وكالة محددة
async function getOrCreateChat(agencyId) {
    // إنشاء أو جلب محادثة بين المدير والوكالة
    const res = await fetch(`${API_BASE}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ agency_id: agencyId })
    });
    const data = await res.json();
    if (data.chat && data.chat.id) return data.chat.id;
    return null;
}

// جلب الرسائل لمحادثة محددة
async function fetchMessages(chatId) {
    // تحديث حالة الرسائل غير المقروءة إلى مقروءة عند فتح المحادثة
    try {
        await fetch(`${API_BASE}/chats/${chatId}/messages/read`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
    } catch (err) {
        // تجاهل الخطأ في التحديث
    }
    // بعد جلب الرسائل، أعد تحديث قائمة الوكالات لتغيير لونها إذا تم قراءة الرسائل
    fetchAgencies();
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '<span>جاري التحميل...</span>';
    // منطقة التنبيه
    let alertDiv = document.getElementById('unreadAlert');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.id = 'unreadAlert';
        alertDiv.style.cssText = 'background:#ffe9b3;color:#bfa441;padding:8px 16px;border-radius:8px;margin-bottom:8px;font-weight:700;display:none;text-align:center;';
        messagesDiv.parentNode.insertBefore(alertDiv, messagesDiv);
    }
    try {
        const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        messagesDiv.innerHTML = '';
        if (data && Array.isArray(data.messages)) {
            // فحص الرسائل غير المقروءة
            const unreadCount = data.messages.filter(msg => msg.is_read === false && msg.sender_type !== 'admin').length;
            if (unreadCount > 0) {
                alertDiv.textContent = `لديك ${unreadCount} رسالة غير مقروءة من الوكالة!`;
                alertDiv.style.display = 'block';
            } else {
                alertDiv.style.display = 'none';
            }
            data.messages.forEach(msg => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'message-item ' + (msg.sender_type === 'admin' ? 'admin' : 'agency');
                let bubble = '';
                if (msg.message && msg.message.trim() !== '') {
                    bubble += `<div class="message-bubble">${msg.message}</div>`;
                }
                if (msg.image_url) {
                    bubble += `<div class="message-bubble"><img src="${msg.image_url}" alt="صورة مرسلة" style="max-width:120px;max-height:120px;border-radius:8px;display:block;margin:4px auto;" /></div>`;
                }
                bubble += `<div class="message-meta">${msg.sender_type === 'admin' ? 'مدير' : 'وكالة'} • ${new Date(msg.sent_at).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</div>`;
                itemDiv.innerHTML = bubble;
                messagesDiv.appendChild(itemDiv);
            });
        } else {
            messagesDiv.innerHTML = '<span>لا توجد رسائل.</span>';
            alertDiv.style.display = 'none';
        }
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (err) {
        messagesDiv.innerHTML = '<span>خطأ في جلب الرسائل.</span>';
    }
}

// إرسال رسالة جديدة (نص فقط)
// تم الاستغناء عن هذه الدالة والاكتفاء بدالة sendMessageWithImage

// إرسال رسالة جديدة (مع صورة)
async function sendMessageWithImage(chatId, message, imageFile) {
    try {
        const formData = new FormData();
        formData.append('message', message);
        if (imageFile) {
            formData.append('image', imageFile);
        }
        const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        });
        const data = await res.json();
        if (data.status === 'ok') {
            fetchMessages(chatId);
        } else {
            alert('تعذر إرسال الرسالة أو الصورة');
        }
    } catch (err) {
        alert('خطأ في إرسال الرسالة أو الصورة');
    }
}

// الأحداث
document.addEventListener('DOMContentLoaded', () => {
    fetchAgencies();
    const agencyList = document.getElementById('agencyList');
    const sendMessageForm = document.getElementById('sendMessageForm');
    let selectedAgencyId = '';

    agencyList.addEventListener('change', async (e) => {
        selectedAgencyId = e.target.value;
        if (selectedAgencyId) {
            currentChatId = await getOrCreateChat(selectedAgencyId);
            if (currentChatId) fetchMessages(currentChatId);
        } else {
            document.getElementById('messages').innerHTML = '';
        }
    });

    sendMessageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = document.getElementById('messageInput').value.trim();
        const imageInput = document.getElementById('imageInput');
        const imageFile = imageInput && imageInput.files.length > 0 ? imageInput.files[0] : null;
        if (currentChatId && (message || imageFile)) {
            sendMessageWithImage(currentChatId, message, imageFile);
            document.getElementById('messageInput').value = '';
            if (imageInput) imageInput.value = '';
        }
    });
});
