 // وظيفة لاستخراج المعاملات من الـ URL
        function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        }

        // وظيفة لتحديث تفاصيل الحجز
        function updateBookingDetails() {
            const bookingNumber = getUrlParameter('bookingNumber') || '';
            const offerName = getUrlParameter('offer') || '';
            const bookingDate = getUrlParameter('bookingDate') || '';
            const fullName = getUrlParameter('full_name') || '';
            const phone = getUrlParameter('phone') || '';
            const roomType = getUrlParameter('room_type') || '';
            const totalPrice = getUrlParameter('price') || '';
            const hasDiscount = getUrlParameter('discount') === 'true';
            document.getElementById('bookingNumber').textContent = bookingNumber;
            document.getElementById('offerName').textContent = offerName;
            document.getElementById('bookingDate').textContent = bookingDate;
            document.getElementById('fullName').textContent = fullName;
            document.getElementById('phone').textContent = phone;
            document.getElementById('roomType').textContent = roomType;
            document.getElementById('totalPrice').textContent = totalPrice ? totalPrice + ' د.ج' : '';
            if (hasDiscount) {
                const discountBanner = document.getElementById('discountBanner');
                discountBanner.style.display = 'block';
                document.getElementById('discountAmount').textContent = '10000 د.ج';
            }
            window.bookingInfo = {
                bookingNumber,
                offerName,
                bookingDate,
                fullName,
                phone,
                roomType,
                totalPrice,
                hasDiscount
            };
        }
        function goHome() {
            window.location.href = 'home1.html';
        }
        // تحميل مكتبة pdfmake
        let pdfMakeReady = false;
        const pdfScript = document.createElement('script');
        pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js';
        pdfScript.onload = checkPdfMakeReady;
        document.head.appendChild(pdfScript);
        const vfsScript = document.createElement('script');
        vfsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js';
        vfsScript.onload = checkPdfMakeReady;
        document.head.appendChild(vfsScript);

        function checkPdfMakeReady() {
            if (window.pdfMake && window.pdfMake.createPdf) {
                pdfMakeReady = true;
                const btn = document.getElementById('downloadBookingBtn');
                if (btn) btn.disabled = false;
            }
        }

        function downloadBookingForm() {
            if (!pdfMakeReady) {
                alert('يرجى الانتظار حتى يتم تحميل مكتبة PDF...');
                return;
            }
            const info = window.bookingInfo || {};
            function generatePDF() {
                let pdfContent = [
                    { text: 'استمارة طلب الحجز', style: 'header', alignment: 'center' },
                    { text: '\n' },
                    { text: `رقم طلب الحجز: ${info.tracking_code || info.bookingNumber || ''}`, style: 'field' },
                    { text: `اسم العرض: ${info.offer_title || info.offerName || ''}`, style: 'field' },
                    { text: `تاريخ طلب الحجز: ${info.bookingDate || ''}`, style: 'field' },
                    { text: `الاسم الكامل: ${info.full_name || info.fullName || ''}`, style: 'field' },
                    { text: `رقم الهاتف: ${info.phone || ''}`, style: 'field' },
                    { text: `نوع الغرفة: ${info.room_type || info.roomType || ''}`, style: 'field' },
                    { text: `السعر الإجمالي: ${(info.final_price || info.totalPrice || '') + ' د.ج'}`, style: 'field' },
                    { text: `حالة طلب الحجز: ${info.status || ''}`, style: 'field' },
                    { text: `معرف طلب الحجز: ${info.id || ''}`, style: 'field' },
                    { text: `رقم العرض: ${info.offer_id || ''}`, style: 'field' },
                ];
                if (info.discount_applied || info.hasDiscount) {
                    pdfContent.push({ text: '🎁 تم تطبيق تخفيض خاص على هذا طلب الحجز!', style: 'discount', alignment: 'center' });
                }
                // صورة الجواز: فقط إذا كانت Base64 أو من نفس الأصل
                if (info.passport_image_url && (info.passport_image_url.startsWith('data:image') || info.passport_image_url.startsWith(window.location.origin))) {
                    pdfContent.push({ image: info.passport_image_url, width: 180, alignment: 'center', margin: [0, 10, 0, 0] });
                }
                const docDefinition = {
                    content: pdfContent,
                    defaultStyle: {
                        font: 'Helvetica', // fallback للخط الافتراضي
                        alignment: 'right',
                        fontSize: 14
                    },
                    styles: {
                        header: { fontSize: 22, bold: true },
                        field: { fontSize: 14, margin: [0, 2, 0, 2] },
                        discount: { fontSize: 15, color: 'orange', bold: true, margin: [0, 10, 0, 10] }
                    }
                };
                try {
                    pdfMake.createPdf(docDefinition).download('booking-form.pdf');
                } catch (e) {
                    alert('حدث خطأ أثناء توليد ملف PDF. يرجى المحاولة لاحقاً.');
                }
            }
            generatePDF();
        }
        window.onload = function() {
            // استخرج كائن الحجز من الرابط
            const bookingParam = getUrlParameter('booking');
            let booking = {};
            if (bookingParam) {
                try {
                    booking = JSON.parse(decodeURIComponent(bookingParam));
                } catch (e) {
                    booking = {};
                }
            }
            // تاريخ الحجز بصيغة لاتينية
            let bookingDate = '';
            if (booking.created_at) {
                const dateObj = new Date(booking.created_at);
                bookingDate = dateObj.toLocaleDateString('en-GB');
            } else {
                bookingDate = booking.bookingDate || '';
            }
            document.getElementById('bookingNumber').textContent = booking.tracking_code || '';
            document.getElementById('offerName').textContent = booking.offer_title || '';
            document.getElementById('bookingDate').textContent = bookingDate;
            document.getElementById('fullName').textContent = booking.full_name || '';
            document.getElementById('phone').textContent = booking.phone || '';
            // تحويل نوع الغرفة إلى نص عربي
            function getRoomTypeArabic(type) {
                switch ((type || '').toLowerCase()) {
                    case 'double': return 'ثنائي';
                    case 'triple': return 'ثلاثي';
                    case 'quad': return 'رباعي';
                    case 'quint': return 'خماسي';
                    default: return type || '';
                }
            }
            document.getElementById('roomType').textContent = getRoomTypeArabic(booking.room_type);
            // عرض السعر النهائي
            document.getElementById('totalPrice').textContent = (booking.final_price ? booking.final_price + ' د.ج' : '');
            // عرض السعر السابق وقيمة الهدية إذا توفرت
            if (typeof booking.price_before_discount !== 'undefined' && booking.price_before_discount && booking.price_before_discount != booking.final_price) {
                let oldPriceEl = document.getElementById('oldPrice');
                if (oldPriceEl) {
                    oldPriceEl.textContent = booking.price_before_discount + ' د.ج';
                    oldPriceEl.style.display = 'inline';
                }
            }
            if (typeof booking.discount !== 'undefined' && booking.discount > 0) {
                let giftValueEl = document.getElementById('giftValue');
                if (giftValueEl) {
                    giftValueEl.textContent = booking.discount + ' د.ج';
                    giftValueEl.style.display = 'inline';
                }
            }
            if (booking.discount_applied) {
                const discountBanner = document.getElementById('discountBanner');
                discountBanner.style.display = 'block';
                document.getElementById('discountAmount').textContent = '10000 د.ج';
            }
            // معلومات إضافية
            document.getElementById('bookingStatusValue').textContent = booking.status || '';
            document.getElementById('bookingIdValue').textContent = booking.id || '';
            document.getElementById('offerIdValue').textContent = booking.offer_id || '';
            if (booking.passport_image_url) {
                let imgEl = document.getElementById('passportImage');
                imgEl.src = booking.passport_image_url;
                imgEl.alt = 'صورة جواز السفر';
            }
            window.bookingInfo = {
                ...booking,
                bookingDate
            };
            // زر طباعة الاستمارة
            const printBtn = document.createElement('button');
            printBtn.className = 'home-button';
            printBtn.id = 'printBookingBtn';
            printBtn.style = 'background:linear-gradient(135deg,#1976d2,#43a047);margin-top:10px;';
            printBtn.textContent = 'طباعة استمارة طلب الحجز';
            printBtn.onclick = printBookingForm;
            const oldBtn = document.querySelector('button[onclick="printBookingForm()"]');
            if (oldBtn) {
                oldBtn.parentNode.replaceChild(printBtn, oldBtn);
            } else {
                const container = document.querySelector('.success-container');
                if (container) container.appendChild(printBtn);
            }

            // دالة طباعة الاستمارة بشكل جميل
            function printBookingForm() {
                const info = window.bookingInfo || {};
                const win = window.open('', '', 'width=800,height=900');
                let discountHtml = '';
                if (info.discount_applied || info.hasDiscount) {
                    discountHtml = `<div style="background:#fff8e1;border:1px solid #ffe082;padding:10px 0;margin:15px 0 10px 0;text-align:center;color:#bfa100;font-weight:bold;font-size:1.1em;border-radius:8px;">🎁 تم تطبيق تخفيض خاص على هذا الحجز! <span style='color:#388e3c;'>-10000 د.ج</span></div>`;
                }
                // تحويل نوع الغرفة إلى نص عربي
                function getRoomTypeArabic(type) {
                    switch ((type || '').toLowerCase()) {
                        case 'double': return 'ثنائي';
                        case 'triple': return 'ثلاثي';
                        case 'quad': return 'رباعي';
                        case 'quint': return 'خماسي';
                        default: return type || '';
                    }
                }
                const roomTypeArabic = getRoomTypeArabic(info.room_type || info.roomType);
                // بناء HTML للسعر السابق وقيمة الهدية إذا توفرت
                let oldPriceHtml = '';
                if (typeof info.price_before_discount !== 'undefined' && info.price_before_discount && info.price_before_discount != info.final_price) {
                    oldPriceHtml = `<div class='print-row'><span class='print-label'>السعر السابق:</span> <span class='print-value' style='text-decoration:line-through;color:#888;'>${info.price_before_discount} د.ج</span></div>`;
                }
                let giftValueHtml = '';
                if (typeof info.discount !== 'undefined' && info.discount > 0) {
                    giftValueHtml = `<div class='print-row'><span class='print-label'>قيمة الهدية:</span> <span class='print-value' style='color:#bfa100;'>${info.discount} د.ج</span></div>`;
                }
                win.document.write(`
                <html lang='ar' dir='rtl'>
                <head>
                    <meta charset='UTF-8'>
                    <title>استمارة طلب الحجز</title>
                    <style>
                        body { font-family: 'Cairo', Tahoma, Arial, sans-serif; background: #f7f7f7; margin: 0; padding: 0; }
                        .print-container { max-width: 500px; margin: 30px auto; background: #fff; border-radius: 16px; box-shadow: 0 2px 12px #ccc; padding: 32px 24px; }
                        .print-title { text-align: center; color: #1976d2; font-size: 2em; font-weight: bold; margin-bottom: 10px; }
                        .print-section { margin-bottom: 18px; }
                        .print-label { color: #555; font-weight: bold; display: inline-block; min-width: 110px; }
                        .print-value { color: #222; font-weight: bold; }
                        .print-row { margin-bottom: 8px; font-size: 1.1em; }
                        .print-logo { display: block; margin: 0 auto 18px auto; max-width: 120px; }
                        .print-check { color: #43a047; font-size: 2.5em; text-align: center; margin-bottom: 10px; }
                        .print-footer { text-align: center; color: #888; font-size: 1em; margin-top: 30px; }
                        .print-passport { display: block; margin: 18px auto 0 auto; max-width: 180px; border-radius: 10px; box-shadow: 0 2px 8px #ccc; }
                    </style>
                </head>
                <body>
                    <div class='print-container'>
                        <div class='print-check'>✓</div>
                        <div class='print-title'>استمارة طلب الحجز</div>
                        ${discountHtml}
                        <div class='print-section'>
                            <div class='print-row'><span class='print-label'>رقم طلب الحجز:</span> <span class='print-value'>${info.tracking_code || info.bookingNumber || ''}</span></div>
                            <div class='print-row'><span class='print-label'>اسم العرض:</span> <span class='print-value'>${info.offer_title || info.offerName || ''}</span></div>
                            <div class='print-row'><span class='print-label'>تاريخ طلب الحجز:</span> <span class='print-value'>${info.bookingDate || ''}</span></div>
                            <div class='print-row'><span class='print-label'>الاسم الكامل:</span> <span class='print-value'>${info.full_name || info.fullName || ''}</span></div>
                            <div class='print-row'><span class='print-label'>رقم الهاتف:</span> <span class='print-value'>${info.phone || ''}</span></div>
                            <div class='print-row'><span class='print-label'>نوع الغرفة:</span> <span class='print-value'>${roomTypeArabic}</span></div>
                            <div class='print-row'><span class='print-label'>السعر الإجمالي:</span> <span class='print-value'>${(info.final_price || info.totalPrice || '') + ' د.ج'}</span></div>
                            ${oldPriceHtml}
                            ${giftValueHtml}
                            <div class='print-row'><span class='print-label'>حالة طلب الحجز:</span> <span class='print-value'>${info.status || ''}</span></div>
                            <div class='print-row'><span class='print-label'>معرف طلب الحجز:</span> <span class='print-value'>${info.id || ''}</span></div>
                            <div class='print-row'><span class='print-label'>رقم العرض:</span> <span class='print-value'>${info.offer_id || ''}</span></div>
                        </div>
                        ${(info.passport_image_url && (info.passport_image_url.startsWith('data:image') || info.passport_image_url.startsWith(window.location.origin))) ? `<img class='print-passport' src='${info.passport_image_url}' alt='صورة جواز السفر'>` : ''}
                        <div class='print-footer'>
                            <span>شكراً لاختياركم منصتنا. نتمنى لكم رحلة موفقة ومباركة.</span>
                        </div>
                    </div>
                    <script>window.print();<\/script>
                </body>
                </html>
                `);
                win.document.close();
            }
        }