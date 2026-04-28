
            let state = { sections: { installment: [] } };
            let isSaving = false;
            const CARDS = ['국민', '신한', '롯데', '현대', '삼성', '우리', '농협', '하나'];

            // --- Crypto Logic (from asset.html) ---
            async function deriveKey(password, salt) {
                const enc = new TextEncoder();
                const keyMaterial = await crypto.subtle.importKey(
                    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits", "deriveKey"]
                );
                return crypto.subtle.deriveKey(
                    { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
                    keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
                );
            }

            async function encryptData(dataObj, password) {
                const text = JSON.stringify(dataObj);
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const iv = crypto.getRandomValues(new Uint8Array(12));
                const key = await deriveKey(password, salt);
                const encoded = new TextEncoder().encode(text);
                const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, encoded);
                const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
                combined.set(salt, 0); combined.set(iv, salt.length);
                combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
                return { _isEncrypted: true, payload: btoa(String.fromCharCode(...combined)) };
            }

            async function decryptData(encryptedObj, password) {
                if (!encryptedObj || !encryptedObj._isEncrypted) return encryptedObj;
                try {
                    const combined = new Uint8Array(atob(encryptedObj.payload).split("").map(c => c.charCodeAt(0)));
                    const salt = combined.slice(0, 16);
                    const iv = combined.slice(16, 28);
                    const ciphertext = combined.slice(28);
                    const key = await deriveKey(password, salt);
                    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);
                    return JSON.parse(new TextDecoder().decode(decrypted));
                } catch (e) { console.error("Decryption failed:", e); return null; }
            }
            // -------------------------------------

            function initSelectors() {
                const now = new Date();
                const urlParams = new URLSearchParams(window.location.search);
                const yParam = urlParams.get('y');
                const mParam = urlParams.get('m');

                const yEl = document.getElementById('yearSelect');
                const mEl = document.getElementById('monthSelect');
                
                const currentYear = yParam ? parseInt(yParam) : now.getFullYear();
                const currentMonth = mParam ? mParam : String(now.getMonth() + 1).padStart(2, '0');

                yEl.innerHTML = '';
                const startYear = 2024;
                const endYear = Math.max(startYear, now.getFullYear() + 2, currentYear);

                for (let i = startYear; i <= endYear; i++) {
                    const opt = document.createElement('option');
                    opt.value = i; opt.textContent = i + '년';
                    if (i === currentYear) opt.selected = true;
                    yEl.appendChild(opt);
                }

                mEl.innerHTML = '';
                for (let i = 1; i <= 12; i++) {
                    const monthStr = String(i).padStart(2, '0');
                    const opt = document.createElement('option');
                    opt.value = monthStr;
                    opt.textContent = i + '월';
                    if (monthStr === currentMonth) opt.selected = true;
                    mEl.appendChild(opt);
                }
                yEl.onchange = () => { syncMenuLinks(); loadData(); };
                mEl.onchange = () => { syncMenuLinks(); loadData(); };
                syncMenuLinks();
            }

            function syncMenuLinks() {
                const y = document.getElementById('yearSelect').value;
                const m = document.getElementById('monthSelect').value;
                const menuLinks = document.querySelectorAll('#dashboardMenu a');
                menuLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && (href.includes('asset.html') || href.includes('installment.html'))) {
                        const base = href.split('?')[0];
                        link.setAttribute('onclick', `location.href='${base}?y=${y}&m=${m}'`);
                    }
                });
            }

            function toggleTheme() {
                document.documentElement.classList.toggle('dark');
                const isDark = document.documentElement.classList.contains('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                updateThemeBtn();
            }

            function updateThemeBtn() {
                const btn = document.getElementById('themeToggleBtn');
                if (btn) btn.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
            }

            function getYearKey() { return `assetData_${document.getElementById('yearSelect').value}`; }
            function getMonthKey() { return document.getElementById('monthSelect').value; }

            // Initialization is now handled at the end of the document

            async function loadData() {
                try {
                    const yEl = document.getElementById('yearSelect');
                    const mEl = document.getElementById('monthSelect');
                    if (!yEl || !mEl) {
                        console.error("[loadData] Select elements not found!");
                        return;
                    }

                    const yearKey = `assetData_${yEl.value}`;
                    const monthKey = mEl.value;
                    const yearDataStr = localStorage.getItem(yearKey);
                    const password = sessionStorage.getItem('temp_master_pw');

                    console.log("[loadData] Attempting to load:", yearKey, "Month:", monthKey);

                    if (yearDataStr) {
                        let yearData = null;
                        try {
                            yearData = JSON.parse(yearDataStr);
                        } catch (e) {
                            console.error("[loadData] JSON parse error:", e);
                        }

                        if (yearData && yearData._isEncrypted) {
                            console.log("[loadData] Encrypted data detected");
                            if (!password) {
                                console.warn("[loadData] Password missing, redirecting to login with params");
                                alert('보안 암호화된 데이터입니다. 메인 페이지에서 먼저 로그인해주세요.');
                                const urlParams = new URLSearchParams(window.location.search);
                                window.location.href = 'asset.html' + (urlParams.toString() ? '?' + urlParams.toString() : '');
                                return;
                            }
                            yearData = await decryptData(yearData, password);
                            console.log("[loadData] Decryption successful:", !!yearData);
                        }

                        if (yearData && yearData.months && yearData.months[monthKey]) {
                            state = yearData.months[monthKey];
                            console.log("[loadData] Month data found in yearData");
                        } else {
                            console.log("[loadData] Month data not found for monthKey:", monthKey);
                            state = { sections: { installment: [] } };
                        }
                    } else {
                        console.log("[loadData] Year data string not found in localStorage for yearKey:", yearKey);
                        state = { sections: { installment: [] } };
                    }

                    // Ensure basic structure exists
                    if (!state || typeof state !== 'object') state = {};
                    if (!state.sections) state.sections = {};
                    if (!state.sections.installment) state.sections.installment = [];
                    
                    console.log("[loadData] Final State:", state);
                } catch (err) {
                    console.error("[loadData] Critical error during loadData:", err);
                    state = { sections: { installment: [] } };
                }
                render();
            }

            async function saveData(showFeedback = false) {
                if (isSaving) {
                    if (showFeedback) {
                        await new Promise(r => setTimeout(r, 500));
                        if (isSaving) return;
                    } else {
                        return;
                    }
                }
                
                isSaving = true;
                console.log("Saving data for", getYearKey(), getMonthKey());
                const yearKey = getYearKey();
                const monthKey = getMonthKey();
                const password = sessionStorage.getItem('temp_master_pw');

                let yearDataStr = localStorage.getItem(yearKey);
                let yearData = null;

                if (yearDataStr) {
                    try {
                        const parsed = JSON.parse(yearDataStr);
                        if (parsed._isEncrypted) {
                            if (!password) throw new Error("Password missing for encrypted data");
                            yearData = await decryptData(parsed, password);
                        } else {
                            yearData = parsed;
                        }
                    } catch (e) {
                        console.error("Data parse/decrypt error during save:", e);
                        // If decryption fails, we shouldn't overwrite the whole year data
                        // but since this is local, we'll try to proceed with a fresh object if critical
                    }
                }

                yearData = yearData || { year: document.getElementById('yearSelect').value, months: {} };
                if (!yearData.months) yearData.months = {};

                // Ensure state is deep-cloned or at least properly structured
                yearData.months[monthKey] = JSON.parse(JSON.stringify(state));

                try {
                    let finalStr = "";
                    if (password) {
                        const encrypted = await encryptData(yearData, password);
                        finalStr = JSON.stringify(encrypted);
                    } else {
                        finalStr = JSON.stringify(yearData);
                    }

                    localStorage.setItem(yearKey, finalStr);
                    console.log("Data saved successfully to localStorage");

                    updateCalculations();
                    if (showFeedback) showToast("✅ 할부 내역이 안전하게 저장되었습니다.");
                } catch (e) {
                    console.error("Save execution failed:", e);
                    if (showFeedback) showToast("❌ 저장 중 오류가 발생했습니다: " + e.message);
                } finally {
                    isSaving = false;
                }
            }

            function showToast(msg, duration = 3000) {
                const toast = document.getElementById('toastPopup');
                if (!toast) return;
                toast.innerText = msg;
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, duration);
            }

            async function addRow() {
                const now = new Date();
                const item = {
                    id: Date.now(),
                    date: `${document.getElementById('yearSelect').value}-${document.getElementById('monthSelect').value}-${String(now.getDate()).padStart(2, '0')}`,
                    card: '롯데',
                    content: '',
                    amount: 0,
                    rate: 0,
                    totalMonths: 1,
                    currentMonth: 1,
                    monthlyPrincipal: 0,
                    monthlyFee: 0,
                    remAmount: 0,
                    endDate: ''
                };
                if (!state.sections.installment) state.sections.installment = [];
                state.sections.installment.push(item);
                await saveData();
                render();
            }

            function deleteRow(id) {
                if (confirm('정말 삭제하시겠습니까?')) {
                    state.sections.installment = state.sections.installment.filter(i => i.id !== id);
                    saveData();
                    render();
                }
            }

            async function updateValue(id, field, value) {
                const item = state.sections.installment.find(i => i.id === id);
                if (!item) return;

                if (field === 'monthlyFee') {
                    const sVal = String(value).trim();
                    if (sVal.endsWith('%')) {
                        item.rate = parseFloat(sVal.replace('%', '')) || 0;
                    } else {
                        item.monthlyFee = parseFloat(sVal.replace(/,/g, '')) || 0;
                        item.rate = 0;
                    }
                } else if (['amount', 'rate', 'totalMonths', 'currentMonth'].includes(field)) {
                    item[field] = parseFloat(String(value).replace(/,/g, '')) || 0;
                } else {
                    item[field] = value;
                }

                calculateInstallment(item);
                await saveData();
                if (field !== 'content') render();
            }

            function calculateInstallment(item) {
                item.totalMonths = Math.max(1, parseInt(item.totalMonths) || 1);
                item.currentMonth = Math.max(0, Math.min(item.totalMonths, parseInt(item.currentMonth) || 0));
                item.amount = parseFloat(String(item.amount).replace(/,/g, '')) || 0;
                item.monthlyPrincipal = Math.floor(item.amount / item.totalMonths);
                item.rate = parseFloat(item.rate) || 0;

                const remainingBalance = (item.totalMonths - item.currentMonth) * item.monthlyPrincipal;
                if (item.rate > 0) {
                    // 잔액에 대한 수수료 (월별)
                    item.monthlyFee = Math.floor((remainingBalance * item.rate / 100) / 12);
                }

                if (item.date) {
                    const p = item.date.split(/[-./ ]/);
                    if (p.length >= 2) {
                        let y = parseInt(p[0]), m = parseInt(p[1]) + item.totalMonths;
                        y += Math.floor((m - 1) / 12); m = (m - 1) % 12 + 1;
                        item.endDate = `${String(y).substring(2)}.${String(m).padStart(2, '0')}`;
                    }
                }
                item.remAmount = (item.totalMonths - item.currentMonth) * item.monthlyPrincipal;
                return item;
            }

            function formatDateInput(el) {
                let v = el.value.replace(/[^0-9]/g, '');
                if (v.length > 4 && v.length <= 6) v = v.slice(0, 4) + '-' + v.slice(4);
                else if (v.length > 6) v = v.slice(0, 4) + '-' + v.slice(4, 6) + '-' + v.slice(6, 10);
                el.value = v;
            }

            function formatNumber(n) {
                return new Intl.NumberFormat('ko-KR').format(parseFloat(String(n).replace(/,/g, '')) || 0);
            }

            function render() {
                const tbody = document.getElementById('installmentBody');
                if (!tbody) return;
                tbody.innerHTML = '';

                const yEl = document.getElementById('yearSelect');
                const mEl = document.getElementById('monthSelect');
                if (!yEl || !mEl || !yEl.value || !mEl.value) {
                    console.warn("[render] Select values missing, skipping render");
                    return;
                }

                const curY = yEl.value;
                const curM = mEl.value;
                const currentTag = `${curY.substring(2)}.${curM}`;
                console.log("[render] Rendering for:", currentTag, "Item count:", state.sections.installment.length);

                if (state.sections && state.sections.installment && state.sections.installment.length > 0) {
                    state.sections.installment.forEach(item => {
                        calculateInstallment(item);
                        const tr = document.createElement('tr');

                        let endDateClass = "";
                        if (item.endDate && item.endDate < currentTag) {
                            tr.classList.add('installment-expired');
                            endDateClass = "end-date-expired";
                        } else if (item.endDate === currentTag) {
                            tr.classList.add('installment-ending');
                            endDateClass = "end-date-ending";
                        }

                        tr.innerHTML = `
                        <td><input type="text" value="${item.date}" placeholder="YYYY-MM-DD" maxlength="10" onclick="openCalendar(this)" oninput="formatDateInput(this)" onchange="updateValue(${item.id}, 'date', this.value)"></td>
                        <td>
                            <select onchange="updateValue(${item.id}, 'card', this.value)">
                                ${CARDS.map(c => `<option value="${c}" ${item.card === c ? 'selected' : ''}>${c}</option>`).join('')}
                            </select>
                        </td>
                        <td><input type="text" value="${item.content}" onchange="updateValue(${item.id}, 'content', this.value)"></td>
                        <td><input type="text" class="amount font-bold" value="${formatNumber(item.amount)}" onblur="updateValue(${item.id}, 'amount', this.value)"></td>
                        <td><input type="text" style="text-align:center" value="${item.rate || 0}" onblur="updateValue(${item.id}, 'rate', this.value)"></td>
                        <td>
                            <div class="flex items-center justify-center gap-1">
                                <input type="number" style="width:40px; text-align:center" value="${item.currentMonth}" onchange="updateValue(${item.id}, 'currentMonth', this.value)">
                                <span class="opacity-30">/</span>
                                <input type="number" style="width:40px; text-align:center" value="${item.totalMonths}" onchange="updateValue(${item.id}, 'totalMonths', this.value)">
                            </div>
                        </td>
                        <td><div class="amount font-bold">${formatNumber(item.monthlyPrincipal)}</div></td>
                        <td><input type="text" class="amount font-bold text-accent-blue" value="${item.rate > 0 ? item.rate + '%' : formatNumber(item.monthlyFee)}" onblur="updateValue(${item.id}, 'monthlyFee', this.value)"></td>
                        <td><div class="amount font-bold text-accent-red">${formatNumber(item.remAmount)}</div></td>
                        <td><div class="text-center font-bold ${endDateClass}">${item.endDate}</div></td>
                        <td class="text-center">
                            <button onclick="openDetail(${item.id})" class="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            </button>
                        </td>
                        <td class="text-center"><button onclick="deleteRow(${item.id})" class="btn-delete">&times;</button></td>
                    `;
                        tbody.appendChild(tr);
                    });
                }
                updateCalculations();
            }

            function updateCalculations() {
                const data = state.sections.installment || [];
                const curY = document.getElementById('yearSelect').value;
                const curM = document.getElementById('monthSelect').value;
                const currentTag = `${curY.substring(2)}.${curM}`;

                const totalAmount = data.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
                const monthlyTotal = data
                    .filter(i => !i.endDate || i.endDate >= currentTag)
                    .reduce((sum, i) => sum + (parseFloat(i.monthlyPrincipal) || 0) + (parseFloat(i.monthlyFee) || 0), 0);
                const remainingTotal = data.reduce((sum, i) => sum + (parseFloat(i.remAmount) || 0), 0);

                document.getElementById('totalAmount').innerText = formatNumber(totalAmount) + '원';
                document.getElementById('monthlyTotal').innerText = formatNumber(monthlyTotal) + '원';
                document.getElementById('remainingTotal').innerText = formatNumber(remainingTotal) + '원';
            }

            function openDetail(id) {
                const item = state.sections.installment.find(i => i.id === id);
                if (!item) return;

                const listEl = document.getElementById('idm-list');
                listEl.innerHTML = '';

                const principal = parseFloat(item.amount) || 0;
                const rate = parseFloat(item.rate || 0);
                const months = parseInt(item.totalMonths) || 1;
                const monthlyPrincipal = Math.floor(principal / months);

                let totalFee = 0;
                const schedule = [];
                let baseDate = item.date ? new Date(item.date) : new Date();

                for (let i = 1; i <= months; i++) {
                    const remaining = principal - (monthlyPrincipal * (i - 1));
                    const monthlyFee = rate > 0 ? Math.floor(remaining * (rate / 100) / 12) : parseFloat(item.monthlyFee || 0);
                    totalFee += monthlyFee;

                    const payDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + (i - 1), baseDate.getDate());
                    const dateStr = `${String(payDate.getFullYear()).substring(2)}.${String(payDate.getMonth() + 1).padStart(2, '0')}.${String(payDate.getDate()).padStart(2, '0')}`;

                    schedule.push({ idx: i, date: dateStr, principal: i === months ? principal - (monthlyPrincipal * (months - 1)) : monthlyPrincipal, fee: monthlyFee });
                }

                document.getElementById('idm-total-all').innerText = formatNumber(principal + totalFee) + '원';
                document.getElementById('idm-total-principal').innerText = formatNumber(principal) + '원';
                document.getElementById('idm-total-fee').innerText = formatNumber(totalFee) + '원';
                document.getElementById('idm-fee-rate').innerText = rate.toFixed(2) + '%';

                schedule.forEach(s => {
                    const div = document.createElement('div');
                    div.className = 'border-b border-white/5 pb-4';
                    div.innerHTML = `
                    <div class="flex justify-between font-bold mb-2"><span>${s.idx}회차</span><span>${formatNumber(s.principal + s.fee)}원</span></div>
                    <div class="flex justify-between text-xs opacity-50"><span>예정일 ${s.date}</span><span>원금 ${formatNumber(s.principal)} / 수수료 ${formatNumber(s.fee)}</span></div>
                `;
                    listEl.appendChild(div);
                });

                document.getElementById('detailModal').style.display = 'flex';
            }

            function closeDetail() { document.getElementById('detailModal').style.display = 'none'; }

            function sortData(criterion) {
                const data = state.sections.installment;
                if (!data) return;
                if (criterion === 'date_desc') data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
                if (criterion === 'date_asc') data.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
                if (criterion === 'amount_desc') data.sort((a, b) => (b.amount || 0) - (a.amount || 0));
                render();
            }

            // --- Dashboard Menu Logic ---
            function toggleDashboardMenu() {
                const menu = document.getElementById('dashboardMenu');
                const isExpanded = !menu.classList.contains('w-0');
                if (isExpanded) closeDashboardMenu();
                else openDashboardMenu();
            }
            function openDashboardMenu() {
                const menu = document.getElementById('dashboardMenu');
                menu.classList.remove('w-0', 'opacity-0', 'pointer-events-none');
                menu.classList.add('w-[480px]', 'opacity-100', 'px-4');
            }
            function closeDashboardMenu() {
                const menu = document.getElementById('dashboardMenu');
                menu.classList.add('w-0', 'opacity-0', 'pointer-events-none');
                menu.classList.remove('w-[480px]', 'opacity-100', 'px-4');
            }

            function logout() {
                sessionStorage.removeItem('assetLoginSession');
                sessionStorage.removeItem('temp_master_pw');
                alert('로그아웃 되었습니다.');
                location.href = 'asset.html';
            }

            // ===== Custom Calendar Logic =====
            let activeCalendarInput = null;
            let calendarDate = new Date();

            function openCalendar(el) {
                if (activeCalendarInput === el) {
                    closeCalendar();
                    return;
                }
                activeCalendarInput = el;
                const rect = el.getBoundingClientRect();
                const cal = document.getElementById('customCalendar');

                let top = rect.bottom + window.scrollY + 8;
                let left = rect.left + window.scrollX;

                if (left + 300 > window.innerWidth) left = window.innerWidth - 320;
                if (left < 10) left = 10;

                cal.style.top = top + 'px';
                cal.style.left = left + 'px';
                cal.style.display = 'flex';

                if (el.value && /^\d{4}-\d{2}-\d{2}$/.test(el.value)) {
                    calendarDate = new Date(el.value);
                } else {
                    calendarDate = new Date();
                }
                renderCalendar();
            }

            function closeCalendar() {
                document.getElementById('customCalendar').style.display = 'none';
                activeCalendarInput = null;
            }

            function renderCalendar() {
                const cal = document.getElementById('customCalendar');
                const year = calendarDate.getFullYear();
                const month = calendarDate.getMonth();

                const headerText = cal.querySelector('.calendar-header span');
                headerText.innerText = `${year}년 ${month + 1}월`;

                const grid = cal.querySelector('.calendar-grid');
                grid.innerHTML = '';

                ['일', '월', '화', '수', '목', '금', '토'].forEach(d => {
                    const div = document.createElement('div');
                    div.className = 'calendar-day-label';
                    div.innerText = d;
                    grid.appendChild(div);
                });

                const firstDay = new Date(year, month, 1).getDay();
                const lastDate = new Date(year, month + 1, 0).getDate();
                const prevLastDate = new Date(year, month, 0).getDate();

                for (let i = firstDay - 1; i >= 0; i--) {
                    addDateCell(year, month - 1, prevLastDate - i, true);
                }

                const today = new Date();
                const selectedVal = activeCalendarInput ? activeCalendarInput.value : '';
                for (let i = 1; i <= lastDate; i++) {
                    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                    const isSelected = selectedVal === dateStr;
                    addDateCell(year, month, i, false, isToday, isSelected);
                }

                let nextMonthDay = 1;
                while (grid.children.length < 49) {
                    addDateCell(year, month + 1, nextMonthDay++, true);
                }
            }

            function addDateCell(y, m, d, otherMonth, isToday, isSelected) {
                const cal = document.getElementById('customCalendar');
                const grid = cal.querySelector('.calendar-grid');
                const div = document.createElement('div');
                div.className = 'calendar-date';
                if (otherMonth) div.classList.add('other-month');
                if (isToday) div.classList.add('today');
                if (isSelected) div.classList.add('selected');
                div.innerText = d;

                const targetDate = new Date(y, m, d);
                const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

                div.onclick = (e) => {
                    e.stopPropagation();
                    if (activeCalendarInput) {
                        activeCalendarInput.value = dateStr;
                        const event = new Event('change', { bubbles: true });
                        activeCalendarInput.dispatchEvent(event);
                    }
                    closeCalendar();
                };
                grid.appendChild(div);
            }

            function changeCalendarMonth(delta) {
                calendarDate.setMonth(calendarDate.getMonth() + delta);
                renderCalendar();
            }

            document.addEventListener('mousedown', (e) => {
                const cal = document.getElementById('customCalendar');
                if (cal.style.display === 'flex' && !cal.contains(e.target) && e.target !== activeCalendarInput) {
                    closeCalendar();
                }
            });
        