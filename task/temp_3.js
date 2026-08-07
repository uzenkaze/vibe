
        let tasks = [];
        let queries = [];
        let manpowers = [];
        let customGroups = [];
        let visibleCount = 6;
        let currentSearchQuery = '';
        let currentManpowerSearch = '';
        let currentManpowerViewMode = 'project'; // 'project' or 'org'
        let currentView = 'view-dashboard';
        let currentStatusFilter = 'all';
        let currentTableSearch = '';
        let calDate = new Date();
        let lastExpandedManpowerGroup = null;
        let ghConfig = JSON.parse(localStorage.getItem('taskGitHubConfig') || '{"repo":"uzenkaze/vibe","branch":"main","autoSync":true}');

        let tableSpecs = [];
        let selectedTableIds = [];
        let collapsedTsGroups = null; // null?대㈃ 珥덇린 濡쒕뵫 ??紐⑤뱺 洹몃９???묒쓬

        // ?곗씠??援ъ“ ?좎뿰?? ?ш??곸쑝濡?媛????諛곗뿴 ?먯깋 (怨듯넻 ?좏떥由ы떚)
        function getNormalizedData(data, depth = 0) {
            if (depth > 10) return []; // 怨쇰룄???ш? 諛⑹?

            if (Array.isArray(data)) return data;

            if (data && typeof data === 'object') {
                let bestArr = null;
                for (let key in data) {
                    try {
                        const result = getNormalizedData(data[key], depth + 1);
                        if (result && Array.isArray(result) && result.length > 0) {
                            if (!bestArr || result.length > bestArr.length) {
                                bestArr = result;
                            }
                        }
                    } catch (e) { continue; }
                }
                return bestArr || [];
            }

            if (typeof data === 'string' && data.trim().startsWith('[') || data.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(data);
                    return getNormalizedData(parsed, depth + 1);
                } catch (e) { return []; }
            }
            return [];
        }

        let menus = [
            { id: 'dashboard', name: '??쒕낫??, icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`, viewId: 'view-dashboard' },
            { id: 'task', name: '?쇨컧愿由?, icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`, viewId: 'view-task' },
            { id: 'manpower', name: 'Manpower', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`, viewId: 'view-manpower' },
            { id: 'table_spec', name: '?뚯씠釉??뺤쓽??, icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`, viewId: 'view-table-spec' },
            { id: 'query', name: 'Query 愿由?, icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`, viewId: 'view-query' },
            { id: 'news', name: '?ㅼ떆媛??댁뒪', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><path d="M18 14h-8"></path><path d="M15 18h-5"></path><path d="M10 6h8v4h-8V6Z"></path></svg>`, viewId: 'view-news' },
            { id: 'settings', name: '?ㅼ젙', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"></path></svg>`, viewId: 'view-settings' }
        ];

        async function init() {
            // iPad ?쒓퀎 ?낅뜲?댄듃
            function updateIpadTime() {
                const el = document.getElementById('ipad-time');
                if (el) {
                    const now = new Date();
                    el.textContent = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
                }
                const timeStr = new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0');
                document.querySelectorAll('.modal-ipad-time').forEach(el => el.textContent = timeStr);
            }
            updateIpadTime();
            setInterval(updateIpadTime, 30000);

            // 紐⑤뱺 紐⑤떖??iPad ?꾨젅?꾩쑝濡??숈쟻 ?섑븨
            document.querySelectorAll('.modal-content').forEach(modal => {
                if (modal.classList.contains('ipad-wrapped')) return;
                modal.classList.add('ipad-wrapped');

                const originalPadding = modal.style.padding || '2.5rem';
                const originalMaxWidth = modal.style.maxWidth || '900px';

                modal.style.padding = '16px';
                modal.style.background = '#1d1d1f';
                modal.style.borderRadius = '32px';
                modal.style.boxShadow = '0 0 0 2px #2a2a2c, 0 0 0 4px #3a3a3c, 0 30px 80px rgba(0, 0, 0, 0.25), 0 8px 30px rgba(0, 0, 0, 0.15)';
                modal.style.overflow = 'visible';
                modal.style.border = 'none';
                modal.style.display = 'flex';
                modal.style.flexDirection = 'column';
                modal.style.maxWidth = originalMaxWidth;

                const fragment = document.createDocumentFragment();
                while (modal.firstChild) {
                    fragment.appendChild(modal.firstChild);
                }

                const camera = document.createElement('div');
                camera.className = 'ipad-camera';

                const screen = document.createElement('div');
                screen.className = 'ipad-screen';
                screen.style.flex = '1';
                screen.style.display = 'flex';
                screen.style.flexDirection = 'column';
                screen.style.overflow = 'hidden';
                screen.style.position = 'relative';
                screen.style.background = 'var(--bg-card)';

                const statusBar = document.createElement('div');
                statusBar.className = 'ipad-status-bar';
                statusBar.style.background = 'transparent';
                statusBar.innerHTML = `
                    <div class="ipad-status-left"><span class="modal-ipad-time"></span></div>
                    <div class="ipad-status-right">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
                        <svg viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="21" y="10" width="2" height="4" rx="1"/><rect x="3" y="8" width="10" height="8" rx="1" opacity="0.4"/></svg>
                    </div>
                `;

                const contentArea = document.createElement('div');
                contentArea.className = 'ipad-content';
                contentArea.style.padding = originalPadding;
                contentArea.style.flex = '1';
                contentArea.style.overflowY = 'auto';
                contentArea.style.maxHeight = 'calc(90vh - 80px)';
                contentArea.style.position = 'relative'; // for absolute children like modal-close
                contentArea.appendChild(fragment);

                const homeInd = document.createElement('div');
                homeInd.className = 'ipad-home-indicator';
                homeInd.style.background = 'transparent';
                homeInd.innerHTML = '<div></div>';

                screen.appendChild(statusBar);
                screen.appendChild(contentArea);
                screen.appendChild(homeInd);

                modal.appendChild(camera);
                modal.appendChild(screen);

                // Fix modal-close position within new container (move to screen so it doesn't scroll)
                const closeBtn = contentArea.querySelector('.modal-close');
                if (closeBtn) {
                    closeBtn.style.top = '50px'; // Below status bar
                    closeBtn.style.right = '20px';
                    closeBtn.style.zIndex = '1000';
                    screen.appendChild(closeBtn);
                }
            });
            updateIpadTime(); // update newly created time spans

            // 1. 珥덇린 UI 諛?濡쒖뺄 ?곗씠??利됱떆 ?뚮뜑留?
            tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            queries = JSON.parse(localStorage.getItem('queries') || '[]');
            manpowers = JSON.parse(localStorage.getItem('manpowers') || '[]');
            customGroups = JSON.parse(localStorage.getItem('manpowerGroups') || '[]');
            tableSpecs = JSON.parse(localStorage.getItem('tableSpecs') || '[]');

            renderSidebar();
            render();
            renderManpower();
            renderTableSpecs(); // ?뚯씠釉붾챸???뚮뜑留??몄텧
            switchView(currentView);

            // ?ㅻ뒛 ?좎쭨 ?ㅻ뜑 ?쒖떆
            updateNewsTodayDate();

            // 2. 鍮꾨룞湲??곗씠???숆린??(諛깃렇?쇱슫??
            if (ghConfig.token) {
                backgroundSync();
            }

            // 3. ?댁뒪 ?곗씠?? 罹먯떆 ?곗꽑 利됱떆 ?뚮뜑 ???댁뒪??吏꾩엯 ??理쒖떊 fetch
            loadNewsCacheImmediate();

            // 4. 二쇨린???낅뜲?댄듃 ?ㅼ젙 (10遺꾨쭏??
            setInterval(() => {
                if (currentView === 'view-news') {
                    parallelNewsFetch(false);
                }
            }, 10 * 60 * 1000);
        }

        async function backgroundSync() {
            console.log('Background sync started...');
            try {
                // ?ㅼ슫濡쒕뱶 ?쒖뒪??蹂묐젹 泥섎━濡??띾룄 ?μ긽
                const results = await Promise.allSettled([
                    syncWithGitHub('download', 'task/task-manager.json'),
                    syncWithGitHub('download', 'task/manpower.json'),
                    syncWithGitHub('download', 'task/manpowerGroups.json'),
                    syncWithGitHub('download', 'task/tableSpecs.json'),
                    syncWithGitHub('download', 'task/queries.json')
                ]);

                let changed = false;
                if (results[0].status === 'fulfilled' && results[0].value) {
                    tasks = getNormalizedData(results[0].value);
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    changed = true;
                }
                if (results[1].status === 'fulfilled' && results[1].value) {
                    manpowers = getNormalizedData(results[1].value);
                    localStorage.setItem('manpowers', JSON.stringify(manpowers));
                    changed = true;
                }
                if (results[2] && results[2].status === 'fulfilled' && results[2].value) {
                    customGroups = getNormalizedData(results[2].value);
                    localStorage.setItem('manpowerGroups', JSON.stringify(customGroups));
                    changed = true;
                }
                if (results[3] && results[3].status === 'fulfilled' && results[3].value) {
                    tableSpecs = getNormalizedData(results[3].value);
                    localStorage.setItem('tableSpecs', JSON.stringify(tableSpecs));
                    changed = true;
                }
                if (results[4] && results[4].status === 'fulfilled' && results[4].value) {
                    queries = getNormalizedData(results[4].value);
                    localStorage.setItem('queries', JSON.stringify(queries));
                    changed = true;
                }

                if (changed) {
                    console.log('Background sync completed and data updated');
                    render();
                    renderManpower();
                    if (currentView === 'view-dashboard') renderCalendar();
                    
                    const indicator = document.getElementById('data-source-indicator');
                    if (indicator) {
                        indicator.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20';
                        indicator.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg><span>GitHub Sync</span>';
                    }
                    
                    showSyncToast();
                }
            } catch (e) {
                console.error('Background sync failed', e);
            }
        }



        function toggleClearBtn(inputId) {
            const input = document.getElementById(inputId);
            const btn = document.getElementById(inputId + '-clear');
            if (input && btn) {
                btn.style.display = input.value ? 'flex' : 'none';
            }
        }

        function clearSearchInput(inputId, callback) {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = '';
                toggleClearBtn(inputId);
                input.focus();
                if (callback) callback();
            }
        }

        let currentTableSpec = null;

        function filterTableSpecs() {
            currentTableSearch = document.getElementById('ts-search-input').value.toLowerCase();
            renderTableSpecs();
        }

        function scrollToTableListTop() {
            const listEl = document.getElementById('ts-table-list');
            if (listEl) {
                listEl.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        function renderTableSpecs() {
            const listEl = document.getElementById('ts-table-list');
            if (!listEl) return;
            listEl.innerHTML = '';

            tableSpecs = getNormalizedData(tableSpecs);

            // 鍮??곗씠???뚮┝
            if (tableSpecs.length === 0) {
                listEl.innerHTML = '<div style="padding:2rem 1rem; text-align:center; color:#86868b; font-size:0.95rem;">??λ맂 ?뚯씠釉?紐⑸줉???놁뒿?덈떎.<br>諛깆뾽 ?뚯씪??鍮꾩뼱?덉쓣 ???덉뒿?덈떎.</div>';
                renderTableSpecViewer();
                return;
            }

            // ?곗씠???뺢퇋?? ID媛 ?녿뒗 寃쎌슦 ?앹꽦
            tableSpecs.forEach(t => {
                if (!t.id) t.id = t.tableName || Math.random().toString(36).substr(2, 9);
            });

            // Filtering (?ъ슜???붿껌: ST_???묐몢??寃?? *ST*???ы븿 寃??
            const query = (currentTableSearch || '').toLowerCase().trim();
            let filtered = tableSpecs.filter(t => {
                const name = (t.tableName || '').toLowerCase();
                const comment = (t.tableComments || t.tableComment || '').toLowerCase();

                if (!query) return true;

                // ??쇰뱶移대뱶 ?⑦꽩 (*ST*)
                if (query.startsWith('*') && query.endsWith('*') && query.length > 2) {
                    const inner = query.substring(1, query.length - 1);
                    return name.includes(inner) || comment.includes(inner);
                }

                return name.startsWith(query) || comment.startsWith(query) || name.includes(query);
            });

            // ?꾩껜 ?좏깮 泥댄겕諛뺤뒪 ?곹깭 ?낅뜲?댄듃
            const checkAll = document.getElementById('ts-check-all');
            if (checkAll) {
                checkAll.checked = filtered.length > 0 && filtered.every(t => selectedTableIds.includes(t.id));
            }

            // Grouping by prefix (before first '_')
            const groups = {};
            const favorites = filtered.filter(t => t.isFavorite);

            filtered.forEach(t => {
                const prefix = (t.tableName || 'OTHER').split('_')[0].toUpperCase();
                if (!groups[prefix]) groups[prefix] = [];
                groups[prefix].push(t);
            });

            const sortedKeys = Object.keys(groups).sort();

            // 珥덇린 濡쒕뵫 ??紐⑤뱺 洹몃９???묓엺 ?곹깭濡??ㅼ젙 (利먭꺼李얘린???쒖쇅)
            if (collapsedTsGroups === null) {
                collapsedTsGroups = {};
                sortedKeys.forEach(k => collapsedTsGroups[k] = true);
                collapsedTsGroups['FAVORITES'] = false; // 利먭꺼李얘린??湲곕낯?곸쑝濡??쇱묠
            }

            // 1. 利먭꺼李얘린 ?곸뿭 (理쒖긽??
            if (favorites.length > 0) {
                const favKey = 'FAVORITES';
                const isCollapsed = collapsedTsGroups[favKey] === undefined ? false : collapsedTsGroups[favKey];

                const header = document.createElement('div');
                header.className = 'ts-group-header';
                header.style.cssText = `
                    cursor:pointer; 
                    display:flex; 
                    align-items:center; 
                    justify-content:space-between; 
                    user-select:none; 
                    transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                    padding:16px 20px; 
                    margin: 0 0 12px 0; 
                    background: ${isCollapsed ? 'rgba(255, 248, 225, 0.4)' : 'rgba(255, 236, 179, 0.3)'}; 
                    border: 1px solid ${isCollapsed ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.4)'}; 
                    border-radius: 14px; 
                    box-shadow: 0 2px 10px rgba(255, 193, 7, 0.05);
                `;

                header.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="letter-spacing:0.5px; color:#856404; font-weight:900; font-size: 0.95rem;">狩?FAVORITES</span>
                        <span style="font-size:0.8rem; color:#b45309; opacity:0.8; font-weight:700; margin-left:5px;">(${favorites.length})</span>
                    </div>
                    <span style="display:flex; align-items:center; transition:transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); transform:rotate(${isCollapsed ? '0deg' : '180deg'}); color:#856404;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                `;

                header.onclick = () => {
                    collapsedTsGroups[favKey] = !collapsedTsGroups[favKey];
                    renderTableSpecs();
                };

                listEl.appendChild(header);
                if (!isCollapsed) {
                    favorites.forEach(t => renderTableItem(listEl, t));
                }
            }

            // 2. ?쇰컲 洹몃９ ?곸뿭
            sortedKeys.forEach(key => {
                const isCollapsed = collapsedTsGroups[key];

                // Render Group Header
                const header = document.createElement('div');
                header.className = 'ts-group-header';
                header.style.cssText = `
                    cursor:pointer; 
                    display:flex; 
                    align-items:center; 
                    justify-content:space-between; 
                    user-select:none; 
                    transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                    padding:16px 20px; 
                    margin: 12px 0 6px 0; 
                    background: ${isCollapsed ? '#f5f5f7' : 'rgba(0, 113, 227, 0.08)'}; 
                    border-radius: 14px; 
                    color: ${isCollapsed ? '#1d1d1f' : '#0071e3'}; 
                    border: 1px solid ${isCollapsed ? 'rgba(0,0,0,0.03)' : 'rgba(0, 113, 227, 0.15)'};
                    box-shadow: ${isCollapsed ? 'none' : '0 4px 12px rgba(0, 113, 227, 0.05)'};
                `;

                header.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="letter-spacing:0.5px; font-weight:800; font-size: 0.95rem;">${key}</span>
                        <span style="font-size:0.8rem; color: ${isCollapsed ? '#86868b' : '#0071e3'}; font-weight:700;">(${groups[key].length})</span>
                    </div>
                    <span style="display:flex; align-items:center; transition:transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); transform:rotate(${isCollapsed ? '0deg' : '180deg'}); color: ${isCollapsed ? '#86868b' : '#0071e3'};">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                `;

                header.onclick = () => {
                    collapsedTsGroups[key] = !collapsedTsGroups[key];
                    renderTableSpecs();
                };

                header.onmouseenter = () => header.style.background = '#e5e5ea';
                header.onmouseleave = () => header.style.background = '#f5f5f7';

                listEl.appendChild(header);

                // Render Table Items in Group (?묓??덉? ?딆쓣 ?뚮쭔)
                if (!isCollapsed) {
                    groups[key].forEach(t => renderTableItem(listEl, t));
                }
            });

            renderTableSpecViewer();
        }

        function toggleTableSelection(id) {
            if (selectedTableIds.includes(id)) {
                selectedTableIds = selectedTableIds.filter(x => x !== id);
            } else {
                selectedTableIds.push(id);
            }
            renderTableSpecs();
        }

        function toggleAllTableSpecs(checked) {
            const search = (currentTableSearch || '').toLowerCase().trim();
            const filtered = tableSpecs.filter(t => {
                const name = (t.tableName || '').toLowerCase();
                const comment = (t.tableComments || t.tableComment || '').toLowerCase();
                if (!search) return true;
                if (search.startsWith('*') && search.endsWith('*') && search.length > 2) {
                    const inner = search.substring(1, search.length - 1);
                    return name.includes(inner) || comment.includes(inner);
                }
                return name.startsWith(search) || comment.startsWith(search) || name.includes(search);
            });

            if (checked) {
                const filteredIds = filtered.map(t => t.id);
                selectedTableIds = Array.from(new Set([...selectedTableIds, ...filteredIds]));
            } else {
                const filteredIds = filtered.map(t => t.id);
                selectedTableIds = selectedTableIds.filter(id => !filteredIds.includes(id));
            }
            renderTableSpecs();
        }

        async function deleteSelectedTables() {
            if (selectedTableIds.length === 0) {
                showToast('??젣???뚯씠釉붿쓣 ?좏깮?댁＜?몄슂.', '?좑툘');
                return;
            }

            if (!confirm(`?좏깮??${selectedTableIds.length}媛쒖쓽 ?뚯씠釉붿쓣 ?뺣쭚 ??젣?섏떆寃좎뒿?덇퉴?`)) return;

            tableSpecs = tableSpecs.filter(t => !selectedTableIds.includes(t.id));
            selectedTableIds = [];
            currentTableSpec = null;

            saveTableSpecs(false);
            renderTableSpecs();
            renderTableSpecViewer();
            showToast('?좏깮???뚯씠釉붿씠 ??젣?섏뿀?듬땲??', '??);
        }

        async function deleteAllTables() {
            if (tableSpecs.length === 0) {
                showToast('??젣???뚯씠釉붿씠 ?놁뒿?덈떎.', '?좑툘');
                return;
            }

            if (!confirm('?꾩껜 ?뚯씠釉??곗씠?곕? ??젣?섏떆寃좎뒿?덇퉴? ???묒뾽? ?섎룎由????놁뒿?덈떎.')) return;

            tableSpecs = [];
            selectedTableIds = [];
            currentTableSpec = null;

            saveTableSpecs(false);
            renderTableSpecs();
            renderTableSpecViewer();
            showToast('?꾩껜 ?뚯씠釉??곗씠?곌? ??젣?섏뿀?듬땲??', '??);
        }

        function renderTableItem(container, t) {
            const tid = t.id || t.tableName;
            const isActive = currentTableSpec && (currentTableSpec.id === tid || currentTableSpec.tableName === t.tableName);
            const isChecked = selectedTableIds.includes(tid);

            const item = document.createElement('div');
            item.className = 'ts-table-item';

            // ?꾨━誘몄뾼 由ъ뒪???꾩씠???ㅽ???
            item.style.cssText = `
                padding: 12px 16px; 
                border-radius: 12px; 
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
                cursor: pointer; 
                margin-bottom: 4px; 
                display: flex; 
                align-items: center; 
                gap: 12px; 
                position: relative;
                border: 1px solid ${isActive ? 'rgba(0,113,227,0.2)' : 'rgba(0,0,0,0.04)'};
                background: ${isActive ? 'rgba(0,113,227,0.04)' : 'transparent'};
                backdrop-filter: none;
            `;

            item.onclick = (e) => {
                if (e.target.type === 'checkbox' || e.target.closest('.ts-fav-btn')) return;
                selectTableSpec(tid);
            }
            item.setAttribute('data-ts-id', tid);

            const favClass = t.isFavorite ? 'active' : '';
            const comments = t.tableComments || t.tableComment || '';
            const commentsColor = isActive ? '#0071e3' : '#86868b';
            const nameColor = isActive ? '#0071e3' : (isChecked ? '#0071e3' : '#1d1d1f');

            item.innerHTML = `
                <input type="checkbox" ${isChecked ? 'checked' : ''} 
                       onclick="event.stopPropagation(); toggleTableSelection('${tid}')"
                       style="width:18px; height:18px; cursor:pointer; margin:0; accent-color:#0071e3;">
                <div style="flex:1; line-height:1.4; pointer-events:none; overflow:hidden;">
                    <div style="display:inline-block; font-size:0.95rem; font-weight:800; font-family:'SF Mono', monospace; word-break:break-all; color:${nameColor}; transition:color 0.2s;">${t.tableName || 'NEW_TABLE'}</div>
                    <div style="font-size:0.75rem; font-weight:500; color:${commentsColor}; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${comments || '?ㅻ챸 ?놁쓬'}</div>
                </div>
                <button class="ts-fav-btn ${favClass}" style="margin-top:0; pointer-events:auto; font-size:1.1rem; opacity:${t.isFavorite ? '1' : '0.3'}; transition:opacity 0.2s;" onclick="toggleTsFavorite('${t.id}', event)">${t.isFavorite ? '狩? : '??}</button>
            `;

            // ?몃쾭 ?④낵
            item.onmouseenter = () => {
                if (!isActive) {
                    item.style.background = 'rgba(0,0,0,0.04)';
                    item.style.borderColor = 'rgba(0,0,0,0.08)';
                }
            };
            item.onmouseleave = () => {
                if (!isActive) {
                    item.style.background = 'rgba(0,0,0,0.01)';
                    item.style.borderColor = 'rgba(0,0,0,0.04)';
                }
            };

            container.appendChild(item);
        }

        let lastTsHoverId = null;
        function handleTableListMouseOver(e) {
            const item = e.target.closest('.ts-table-item');
            if (item) {
                const id = item.getAttribute('data-ts-id');
                if (id !== lastTsHoverId) {
                    // 湲곗〈 ??대㉧ 痍⑥냼
                    if (erdHoverTimeout) clearTimeout(erdHoverTimeout);

                    lastTsHoverId = id;

                    // 500ms 吏?????쒖떆
                    erdHoverTimeout = setTimeout(() => {
                        showTablePreview(item, e, id);
                        erdHoverTimeout = null;
                    }, 500);
                }
            } else {
                // ?꾩씠???곸뿭??踰쀬뼱?섎㈃ ??대㉧ 痍⑥냼 諛??덉씠???④린湲?(?좏깮?ы빆)
                if (erdHoverTimeout) {
                    clearTimeout(erdHoverTimeout);
                    erdHoverTimeout = null;
                }
            }
        }

        // 留덉슦?ㅺ? 紐⑸줉 ?곸뿭??踰쀬뼱?섎㈃ ?곹깭 珥덇린??諛???대㉧ 痍⑥냼
        document.getElementById('ts-table-list')?.addEventListener('mouseleave', () => {
            lastTsHoverId = null;
            if (erdHoverTimeout) {
                clearTimeout(erdHoverTimeout);
                erdHoverTimeout = null;
            }
        });

        function toggleTsFavorite(id, e) {
            if (e) e.stopPropagation();
            const spec = tableSpecs.find(t => t.id === id);
            if (spec) {
                spec.isFavorite = !spec.isFavorite;
                saveTableSpecs(false);
                renderTableSpecs();
            }
        }

        function getOrCreatePreviewLayer() {
            let el = document.getElementById('ts-preview-layer');
            if (!el) {
                el = document.createElement('div');
                el.id = 'ts-preview-layer';
                document.body.appendChild(el);
            }
            return el;
        }

        function showTablePreview(el, e, id) {
            const spec = tableSpecs.find(t => t.id === id);
            if (!spec) return;

            const previewEl = getOrCreatePreviewLayer();

            // ?꾨━酉??덉씠???ㅽ???珥덇린??(?쇱씠??紐⑤뱶 媛뺤젣, ?붾㈃ ?뺤쨷??諛곗튂)
            previewEl.classList.remove('dark');
            previewEl.style.cssText = `
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 2147483647 !important;
                pointer-events: auto !important;
                background: rgba(255, 255, 255, 0.98) !important;
                color: #1d1d1f !important;
                border-radius: 24px !important;
                box-shadow: 0 40px 100px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05) !important;
            `;

            // ?꾩껜 而щ읆 ?쒖떆 濡쒖쭅
            let rowsHtml = (spec.columns || []).map(c => {
                const hasCode = /\[([A-Z0-9]+)\]/.test(c.comments || '') || (c.note && c.note.length > 0);
                const codeInfo = c.note ? c.note.replace(/"/g, "&quot;") : '';
                const helpStyle = hasCode ? 'text-decoration:underline dotted #0071e3; cursor:help;' : '';
                const onMouseEnter = hasCode ? `onmouseenter="showCodeTooltip(this)" onmouseleave="hideCodeTooltip()" data-note="${codeInfo}"` : '';

                return `
                    <tr class="ts-preview-row">
                        <td ${onMouseEnter} style="font-weight:700; color:${c.pk === 'Y' ? '#0071e3' : '#1d1d1f'}; ${helpStyle}">${c.columnName}</td>
                        <td style="color:#515154; font-size:0.85rem;">${c.comments || ''}</td>
                        <td style="color:#86868b; font-family:monospace; font-size:0.75rem;">${c.dataType}</td>
                        <td style="text-align:center">${c.pk === 'Y' ? '?뵎' : ''}</td>
                    </tr>
                `;
            }).join('');

            previewEl.innerHTML = `
                <div class="ts-preview-header">
                    <div class="ts-preview-title-area">
                        <div class="ts-preview-title">
                            ${spec.tableName} 
                            <span style="font-size:1.1rem; margin: 0 4px;">?뱥</span>
                            <span class="ts-preview-logical" style="font-size: 0.9rem; color: #86868b; font-weight: 400;">${spec.tableComments ? '(' + spec.tableComments + ')' : ''}</span>
                        </div>
                    </div>
                    <div class="ts-preview-search-wrapper">
                        <span class="ts-preview-search-icon">?뵇</span>
                        <div class="search-container" style="flex:1;">
                            <input type="text" id="ts-preview-search-input" class="ts-preview-search" placeholder="而щ읆紐??먮뒗 ?쇰━紐?寃??.." 
                                oninput="toggleClearBtn('ts-preview-search-input'); filterPreviewRows(this.value)">
                            <button class="search-clear-btn" id="ts-preview-search-input-clear" onclick="clearSearchInput('ts-preview-search-input', () => filterPreviewRows(''))">??/button>
                        </div>
                    </div>
                    <button class="ts-preview-close" onclick="hideTablePreview()"></button>
                </div>
                <div class="ts-preview-table-container ts-preview-body">
                    <table class="ts-preview-table">
                        <thead style="position:sticky; top:0; z-index:10; background:#f9f9fb;">
                            <tr>
                                <th style="width:30%; padding:12px 15px; background:#f9f9fb; border-bottom:2px solid rgba(0,0,0,0.05);">而щ읆紐?/th>
                                <th style="width:35%; padding:12px 15px; background:#f9f9fb; border-bottom:2px solid rgba(0,0,0,0.05);">?쇰━紐??ㅻ챸)</th>
                                <th style="width:25%; padding:12px 15px; background:#f9f9fb; border-bottom:2px solid rgba(0,0,0,0.05);">???/th>
                                <th style="width:10%; padding:12px 15px; background:#f9f9fb; border-bottom:2px solid rgba(0,0,0,0.05); text-align:center;">PK</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml || '<tr><td colspan="4" style="text-align:center; padding:30px; color:#c7c7cc;">?깅줉??而щ읆???놁뒿?덈떎.</td></tr>'}</tbody>
                    </table>
                </div>
            `;

            // (?꾩튂 怨꾩궛 濡쒖쭅? cssText??transform: translate(-50%, -50%)濡??泥대릺????젣??
        }

        function filterPreviewRows(query) {
            const lowerQuery = query.toLowerCase().trim();
            const rows = document.querySelectorAll('.ts-preview-row');

            rows.forEach(row => {
                const colName = row.cells[0].innerText.toLowerCase();
                const logicalName = row.cells[1].innerText.toLowerCase();

                if (colName.includes(lowerQuery) || logicalName.includes(lowerQuery)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        function hideTablePreview() {
            document.getElementById('ts-preview-layer').style.display = 'none';
        }

        // ?몃? ?대┃ ???꾨━酉??リ린 濡쒖쭅
        window.addEventListener('mousedown', function (e) {
            const previewEl = document.getElementById('ts-preview-layer');
            if (previewEl && previewEl.style.display === 'flex') {
                // ?대┃???붿냼媛 ?꾨━酉??덉씠???대?媛 ?꾨땲怨? ?ъ씠?쒕컮 ?꾩씠?쒕룄 ?꾨땶 寃쎌슦 ?リ린
                if (!previewEl.contains(e.target) && !e.target.closest('.ts-table-item')) {
                    hideTablePreview();
                }
            }
        });



        // --- Code Info Tooltip Logic ---
        function getOrCreateCodeTooltip() {
            let el = document.getElementById('ts-code-tooltip');
            if (!el) {
                el = document.createElement('div');
                el.id = 'ts-code-tooltip';
                document.body.appendChild(el);
            }
            return el;
        }

        function showCodeTooltip(target) {
            const text = target.getAttribute('data-note');
            const tooltip = getOrCreateCodeTooltip();

            // ?댄똻????긽 DOM ?앹쑝濡??대룞?쒖폒 理쒖긽?⑥뿉 ?ㅻ룄濡???
            if (tooltip.parentNode) {
                tooltip.parentNode.appendChild(tooltip);
            }

            tooltip.innerText = text && text.trim() ? text : '?깅줉??肄붾뱶 ?곸꽭 ?뺣낫媛 ?놁뒿?덈떎.';
            tooltip.style.display = 'block';

            const rect = target.getBoundingClientRect();
            let top = rect.bottom + 10;
            let left = rect.left;

            // Screen edge check
            if (left + 450 > window.innerWidth) {
                left = window.innerWidth - 470;
            }
            if (top + 200 > window.innerHeight) {
                top = rect.top - tooltip.offsetHeight - 10;
                if (top < 10) top = 10;
            }

            tooltip.style.top = top + 'px';
            tooltip.style.left = left + 'px';
        }

        function hideCodeTooltip() {
            const tooltip = document.getElementById('ts-code-tooltip');
            if (tooltip) tooltip.style.display = 'none';
        }


        // --- ERD Visualization Logic ---
        let erdNodes = [];
        let erdLinks = [];
        let isDraggingNode = false;
        let isPanning = false;
        let dragTarget = null;
        let dragOffset = { x: 0, y: 0 };

        // Load last view state
        const savedErdState = JSON.parse(localStorage.getItem('erdViewState') || '{"panX":0, "panY":0, "scale":1.0, "query":""}');
        let panX = savedErdState.panX;
        let panY = savedErdState.panY;
        let erdScale = savedErdState.scale;
        let erdLastQuery = savedErdState.query || "";
        let currentErdPrefix = "ALL";
        let erdAnimationFrame = null; // rAF 愿由щ? ?꾪븳 蹂??
        let erdHoverTimeout = null;   // ?몃쾭 吏??Debounce)???꾪븳 蹂??

        function showERDPrefixSelector() {
            const prefixes = [...new Set(tableSpecs.map(t => (t.tableName || "").split('_')[0]))].filter(x => x).sort();
            const listEl = document.getElementById('erd-prefix-list');
            listEl.innerHTML = '';

            prefixes.forEach(p => {
                const btn = document.createElement('button');
                btn.className = 'btn-mini';
                btn.style.cssText = 'padding:12px; font-weight:700; background:#f5f5f7; border:1px solid #d2d2d7; border-radius:10px; transition:all 0.2s;';
                btn.innerText = p;
                btn.onclick = () => {
                    document.getElementById('erd-prefix-modal').style.display = 'none';
                    openERDView(p);
                };
                btn.onmouseover = () => btn.style.borderColor = '#0071e3';
                btn.onmouseout = () => btn.style.borderColor = '#d2d2d7';
                listEl.appendChild(btn);
            });

            document.getElementById('erd-prefix-modal').style.display = 'flex';
        }

        function openERDView(prefix) {
            currentErdPrefix = prefix || currentErdPrefix;
            const overlay = document.getElementById('erd-view');
            const container = document.getElementById('erd-container');
            const content = document.getElementById('erd-content');

            overlay.style.display = 'flex';
            content.innerHTML = '<svg id="erd-svg" class="erd-svg"></svg>'; // Reset

            // Filter Specs by Prefix
            let filteredSpecs = tableSpecs;
            if (currentErdPrefix !== 'ALL') {
                filteredSpecs = tableSpecs.filter(t => (t.tableName || "").startsWith(currentErdPrefix + "_") || t.tableName === currentErdPrefix);
            }

            // Pan Event Binding
            container.onmousedown = (e) => {
                // ?꾨━酉??덉씠?닿? ?대젮?덈떎硫??リ린
                const preview = document.getElementById('ts-preview-layer');
                if (preview && preview.style.display !== 'none') {
                    preview.style.display = 'none';
                    if (e.target.closest('.erd-node')) return; // ?몃뱶瑜??대┃?댁꽌 ?レ? 寃쎌슦 ?쒕옒洹?諛⑹?
                }

                if (!e.target.closest('.erd-node') && !e.target.closest('.erd-zoom-controls')) {
                    isPanning = true;
                    dragOffset.x = e.clientX - panX;
                    dragOffset.y = e.clientY - panY;
                    container.style.cursor = 'grabbing';
                }
            };

            // Zoom Wheel Binding
            container.onwheel = (e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.05 : 0.05;
                zoomERD(delta);
            };

            window.addEventListener('mousemove', (e) => {
                if (isPanning) {
                    panX = e.clientX - dragOffset.x;
                    panY = e.clientY - dragOffset.y;

                    if (!erdAnimationFrame) {
                        erdAnimationFrame = requestAnimationFrame(() => {
                            updateERDTransform();
                            erdAnimationFrame = null;
                        });
                    }
                }
            });
            window.addEventListener('mouseup', () => {
                isPanning = false;
                if (container) container.style.cursor = 'grab';
            });

            // 1. Identify Relations (Heuristic: Table A column matches Table B PK)
            const relations = [];
            const pkMap = {};

            filteredSpecs.forEach(spec => {
                (spec.columns || []).forEach(col => {
                    if (col.pk === 'Y') {
                        if (!pkMap[col.columnName]) pkMap[col.columnName] = [];
                        pkMap[col.columnName].push(spec.id);
                    }
                });
            });

            filteredSpecs.forEach(sourceTable => {
                (sourceTable.columns || []).forEach(col => {
                    if (col.pk !== 'Y' && pkMap[col.columnName]) {
                        pkMap[col.columnName].forEach(targetId => {
                            if (sourceTable.id !== targetId) {
                                relations.push({ from: sourceTable.id, to: targetId });
                            }
                        });
                    }
                });
            });

            // 2. Create Nodes with Grid Layout
            const horizontalGap = 350;
            const verticalGap = 200;
            const cols = Math.ceil(Math.sqrt(filteredSpecs.length));

            const nodes = filteredSpecs.map((spec, i) => {
                const row = Math.floor(i / cols);
                const col = i % cols;
                // ??λ맂 ?꾩튂媛 ?덉쑝硫??ъ슜, ?놁쑝硫?洹몃━???덉씠?꾩썐 ?곸슜
                return {
                    id: spec.id,
                    name: spec.tableName,
                    comment: spec.tableComments,
                    color: spec.color || '', // ?됱긽 異붽?
                    x: spec.x !== undefined ? spec.x : (500 + (col * horizontalGap)),
                    y: spec.y !== undefined ? spec.y : (300 + (row * verticalGap))
                };
            });

            erdNodes = nodes;
            erdLinks = relations;

            // 3. Render Nodes
            nodes.forEach(node => {
                const nodeEl = document.createElement('div');
                nodeEl.className = `erd-node ${node.color ? 'theme-' + node.color : ''}`;
                nodeEl.id = `node-${node.id}`;
                nodeEl.style.left = node.x + 'px';
                nodeEl.style.top = node.y + 'px';
                nodeEl.innerHTML = `
                    <div class="node-title">${node.name}</div>
                    <div class="node-comment">${node.comment || ''}</div>
                    <div class="color-picker">
                        <div class="color-dot" style="background:#fff" onclick="changeNodeColor('${node.id}', '')"></div>
                        <div class="color-dot" style="background:#03a9f4" onclick="changeNodeColor('${node.id}', 'blue')"></div>
                        <div class="color-dot" style="background:#4caf50" onclick="changeNodeColor('${node.id}', 'green')"></div>
                        <div class="color-dot" style="background:#fbc02d" onclick="changeNodeColor('${node.id}', 'yellow')"></div>
                        <div class="color-dot" style="background:#f44336" onclick="changeNodeColor('${node.id}', 'red')"></div>
                        <div class="color-dot" style="background:#9c27b0" onclick="changeNodeColor('${node.id}', 'purple')"></div>
                    </div>
                `;

                nodeEl.onmousedown = (e) => {
                    // ?꾨━酉??덉씠???リ린
                    const preview = document.getElementById('ts-preview-layer');
                    if (preview && preview.style.display !== 'none') {
                        preview.style.display = 'none';
                    }

                    if (e.target.classList.contains('color-dot')) return; // ?됱긽 ?대┃ ???쒕옒洹?諛⑹?
                    e.stopPropagation();
                    startDragNode(e, node);
                };

                // 留덉슦???ㅻ쾭 ???띿꽦 ?뺣낫(?꾨━酉? ?쒖떆 (吏???쒓컙 ?곸슜)
                nodeEl.onmouseenter = (e) => {
                    if (isDraggingNode || isPanning) return;

                    // 湲곗〈 ??대㉧ 痍⑥냼
                    if (erdHoverTimeout) clearTimeout(erdHoverTimeout);

                    // 500ms ?숈븞 癒몃Ъ????뚮쭔 ?쒖떆
                    erdHoverTimeout = setTimeout(() => {
                        showTablePreview(nodeEl, e, node.id);
                        erdHoverTimeout = null;
                    }, 500);
                };

                nodeEl.onmouseleave = () => {
                    // ?뚯씠釉붿쓣 踰쀬뼱?섎㈃ ??대㉧ 痍⑥냼
                    if (erdHoverTimeout) {
                        clearTimeout(erdHoverTimeout);
                        erdHoverTimeout = null;
                    }
                };

                content.appendChild(nodeEl);
            });

            drawERDLinks();

            // 留덉?留??곹깭 蹂듭썝 (寃?됱뼱 ?ы븿)
            const searchInput = document.querySelector('.erd-search-input');
            if (searchInput && erdLastQuery) {
                searchInput.value = erdLastQuery;
                searchERDNodes(erdLastQuery, true); // true: ?먮룞 ?ъ빱???대룞 諛⑹? (?대? ?쒖젏????λ릺???덉쑝誘濡?
            }

            updateERDTransform();
        }

        function updateERDTransform() {
            const content = document.getElementById('erd-content');
            if (!content) return;
            // translate3d瑜??ъ슜?섏뿬 ?섎뱶?⑥뼱 媛??GPU) 媛뺤젣 ?곸슜
            content.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${erdScale})`;
            const label = document.getElementById('erd-zoom-label');
            if (label) label.innerText = Math.round(erdScale * 100) + '%';

            // ?곹깭 ???
            const query = document.querySelector('.erd-search-input')?.value || "";
            localStorage.setItem('erdViewState', JSON.stringify({ panX, panY, scale: erdScale, query: query }));
        }

        function zoomERD(delta) {
            erdScale = Math.min(Math.max(0.1, erdScale + delta), 2);
            updateERDTransform();
        }

        function resetERDZoom() {
            erdScale = 1.0;
            updateERDTransform();
        }

        function drawERDLinks() {
            const svg = document.getElementById('erd-svg');
            svg.innerHTML = '';

            const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            defs.innerHTML = `
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#0071e3" />
                </marker>
            `;
            svg.appendChild(defs);

            erdLinks.forEach(link => {
                const fromNode = erdNodes.find(n => n.id === link.from);
                const toNode = erdNodes.find(n => n.id === link.to);
                if (!fromNode || !toNode) return;

                const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
                updateLinePath(line, fromNode, toNode);
                line.setAttribute("class", "erd-link");
                line.setAttribute("marker-end", "url(#arrowhead)");
                svg.appendChild(line);
                link.element = line;
            });
        }

        function updateLinePath(line, from, to) {
            const fX = from.x + 90;
            const fY = from.y + 25;
            const tX = to.x + 90;
            const tY = to.y + 25;

            // Bezier curve
            const cp1x = fX + (tX - fX) * 0.5;
            const cp1y = fY;
            const cp2x = fX + (tX - fX) * 0.5;
            const cp2y = tY;

            line.setAttribute("d", `M ${fX} ${fY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${tX} ${tY}`);
        }

        function startDragNode(e, node) {
            isDraggingNode = true;
            dragTarget = node;
            const rect = document.getElementById(`node-${node.id}`).getBoundingClientRect();
            dragOffset.x = e.clientX - node.x;
            dragOffset.y = e.clientY - node.y;

            document.onmousemove = dragNode;
            document.onmouseup = stopDragNode;
            e.preventDefault();
        }

        function dragNode(e) {
            if (!isDraggingNode) return;
            dragTarget.x = e.clientX - dragOffset.x;
            dragTarget.y = e.clientY - dragOffset.y;

            if (!erdAnimationFrame) {
                erdAnimationFrame = requestAnimationFrame(() => {
                    const el = document.getElementById(`node-${dragTarget.id}`);
                    if (el) {
                        el.style.left = dragTarget.x + 'px';
                        el.style.top = dragTarget.y + 'px';
                    }

                    // Update related links
                    erdLinks.forEach(link => {
                        if (link.from === dragTarget.id || link.to === dragTarget.id) {
                            const from = erdNodes.find(n => n.id === link.from);
                            const to = erdNodes.find(n => n.id === link.to);
                            updateLinePath(link.element, from, to);
                        }
                    });
                    erdAnimationFrame = null;
                });
            }
        }

        function stopDragNode() {
            if (isDraggingNode && dragTarget) {
                // tableSpecs ?곗씠?곗뿉 ?꾩튂 ?뺣낫 ?곴뎄 ???
                const spec = tableSpecs.find(s => s.id === dragTarget.id);
                if (spec) {
                    spec.x = dragTarget.x;
                    spec.y = dragTarget.y;
                    saveTableSpecs(false); // 臾댁쓬 ???(?좎뒪??硫붿떆吏 ?놁씠)
                }
            }
            isDraggingNode = false;
            document.onmousemove = null;
            document.onmouseup = null;
        }

        function autoLayoutERD() {
            // ?ъ슜???뺤씤 硫붿떆吏 異붽?
            if (!confirm('?ъ슜?먭? 吏곸젒 ?몄쭛???뚯씠釉??꾩튂? ?붾㈃ ?ㅼ젙??紐⑤몢 珥덇린?붾맗?덈떎.\n?먮룞 ?뺣젹??吏꾪뻾?섏떆寃좎뒿?덇퉴?')) {
                return;
            }

            // ?꾩튂 ?뺣낫 諛?酉??곹깭 珥덇린??
            tableSpecs.forEach(spec => {
                delete spec.x;
                delete spec.y;
                delete spec.color; // ?됱긽??珥덇린?뷀븷吏 ?щ????뺤콉???곕씪 ?ㅻⅤ?? ?꾩쟾 珥덇린?붾씪硫??ы븿
            });
            panX = 0;
            panY = 0;
            erdScale = 1.0;
            erdLastQuery = "";

            // ???
            saveTableSpecs(false);
            localStorage.removeItem('erdViewState');

            openERDView();

            // Add a small bounce animation to show it's refreshed
            const nodes = document.querySelectorAll('.erd-node');
            nodes.forEach(el => {
                el.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                setTimeout(() => el.style.transition = 'none', 600);
            });
        }

        function closeERDView() {
            document.getElementById('erd-view').style.display = 'none';
        }

        function changeNodeColor(id, color) {
            const spec = tableSpecs.find(s => s.id === id);
            if (spec) {
                spec.color = color;
                saveTableSpecs(false);

                const el = document.getElementById(`node-${id}`);
                if (el) {
                    el.className = `erd-node ${color ? 'theme-' + color : ''}`;
                }
            }
        }

        function searchERDNodes(query, skipPan = false) {
            const lowerQuery = query.toLowerCase().trim();
            const nodes = document.querySelectorAll('.erd-node');
            const links = document.querySelectorAll('.erd-link');

            // ?곹깭 利됱떆 ???
            erdLastQuery = query;
            const currentState = JSON.parse(localStorage.getItem('erdViewState') || '{}');
            currentState.query = query;
            localStorage.setItem('erdViewState', JSON.stringify(currentState));

            if (!lowerQuery) {
                nodes.forEach(n => {
                    n.classList.remove('highlight', 'dimmed');
                    n.style.display = '';
                });
                links.forEach(l => {
                    l.classList.remove('dimmed');
                    l.style.display = '';
                });
                return;
            }

            // 1. 寃?됱뼱? ?쇱튂?섎뒗 以묒떖 ?뚯씠釉??? 李얘린
            const matchedNodeIds = [];
            nodes.forEach(node => {
                const title = node.querySelector('.node-title').innerText.toLowerCase();
                const comment = node.querySelector('.node-comment').innerText.toLowerCase();
                if (title.includes(lowerQuery) || comment.includes(lowerQuery)) {
                    matchedNodeIds.push(node.id.replace('node-', ''));
                }
            });

            // 2. 愿怨꾨맂 ?뚯씠釉?ID ?섏쭛 (以묒떖 ?뚯씠釉?+ ?곌껐???뚯씠釉?
            const visibleNodeIds = new Set(matchedNodeIds);
            erdLinks.forEach(link => {
                const fromId = String(link.from);
                const toId = String(link.to);
                if (matchedNodeIds.includes(fromId)) visibleNodeIds.add(toId);
                if (matchedNodeIds.includes(toId)) visibleNodeIds.add(fromId);
            });

            // 3. ?몃뱶 ?쒖떆/?④? 泥섎━
            let firstMatch = null;
            nodes.forEach(node => {
                const nodeId = node.id.replace('node-', '');
                const title = node.querySelector('.node-title').innerText.toLowerCase();

                if (visibleNodeIds.has(nodeId)) {
                    node.style.display = '';
                    node.classList.remove('dimmed');
                    // ?뺥솗??留ㅼ묶???뚯씠釉붾쭔 ?섏씠?쇱씠??泥섎━
                    if (title === lowerQuery) {
                        node.classList.add('highlight');
                        if (!firstMatch) firstMatch = node;
                    } else {
                        node.classList.remove('highlight');
                    }
                } else {
                    node.style.display = 'none';
                    node.classList.add('dimmed');
                }
            });

            // 4. 留곹겕 ?쒖떆/?④? 泥섎━ (?곌껐???묒そ ?몃뱶媛 紐⑤몢 蹂댁씪 ?뚮쭔 ?쒖떆)
            erdLinks.forEach(link => {
                const fromVisible = visibleNodeIds.has(String(link.from));
                const toVisible = visibleNodeIds.has(String(link.to));

                if (fromVisible && toVisible) {
                    // ?뱁엳 寃?됰맂 以묒떖 ?몃뱶? 愿?⑤맂 留곹겕留???媛뺤“?섍퀬 ?띕떎硫??ш린??異붽? 濡쒖쭅 媛??
                    link.element.style.display = '';
                    link.element.classList.remove('dimmed');
                } else {
                    link.element.style.display = 'none';
                    link.element.classList.add('dimmed');
                }
            });

            // 泥?踰덉㎏ 寃??寃곌낵濡??붾㈃ ?대룞 (?섎룞 寃???쒖뿉留?
            if (firstMatch && !skipPan) {
                const nodeId = firstMatch.id.replace('node-', '');
                const nodeData = erdNodes.find(n => n.id == nodeId);
                if (nodeData) {
                    panX = (window.innerWidth / 2) - nodeData.x - 110;
                    panY = (window.innerHeight / 2) - nodeData.y - 40;
                    updateERDTransform();
                }
            }
        }

        function selectTableSpec(id) {
            currentTableSpec = tableSpecs.find(t => t.id === id);
            if (typeof hideTablePreview === 'function') hideTablePreview();
            renderTableSpecs();
        }

        function renderTableSpecViewer() {
            if (!currentTableSpec) {
                if (document.getElementById('ts-empty-view')) document.getElementById('ts-empty-view').style.display = 'flex';
                if (document.getElementById('ts-main-view')) document.getElementById('ts-main-view').style.display = 'none';
                return;
            }
            if (document.getElementById('ts-empty-view')) document.getElementById('ts-empty-view').style.display = 'none';
            if (document.getElementById('ts-main-view')) document.getElementById('ts-main-view').style.display = 'flex';

            document.getElementById('ts-meta-name').value = currentTableSpec.tableName || '';
            document.getElementById('ts-meta-comments').value = currentTableSpec.tableComments || '';

            const tbody = document.getElementById('ts-column-list');
            tbody.innerHTML = '';
            const cols = currentTableSpec.columns || [];

            cols.sort((a, b) => a.seq - b.seq).forEach((c, idx) => {
                const hasCode = /\[([A-Z0-9]+)\]/.test(c.comments || '');
                const codeInfo = (hasCode && c.note) ? c.note.replace(/"/g, '&quot;') : '';
                const helpStyle = hasCode ? 'text-decoration:underline dotted #007aff !important;' : '';
                const onMouseEnter = hasCode && codeInfo ? `onmouseenter="showCodeTooltip(this, '${codeInfo}')" onmouseleave="hideCodeTooltip()"` : '';

                const tr = document.createElement('tr');
                tr.className = 'ts-column-tr';
                tr.style.cssText = `border-bottom: 1px solid var(--border); transition: background 0.3s ease;`;

                tr.innerHTML = `
                    <td style="padding:16px 8px; text-align:center;">
                        <div style="font-family:'SF Mono', monospace; background:rgba(0,113,227,0.08); padding:4px 10px; border-radius:10px; color:#0071e3; font-size:0.85rem; font-weight:700; display:inline-block;">${c.seq}</div>
                    </td>
                    <td style="padding:16px 8px;">
                        <input type="text" ${onMouseEnter} style="width:100%; border:none; font-weight:700; color:#0071e3; font-family:'SF Mono', monospace; background:transparent; ${helpStyle}" 
                               value="${c.columnName || ''}" placeholder="COLUMN_NAME" onchange="updateTsCol('${c.id}','columnName',this.value)">
                    </td>
                    <td style="padding:16px 8px;">
                        <input type="text" style="width:100%; border:none; background:transparent; color:#0a0a0a; font-weight:700;" 
                               value="${c.comments || ''}" placeholder="?ㅻ챸" onchange="updateTsCol('${c.id}','comments',this.value)">
                    </td>
                    <td style="padding:16px 8px;">
                        <input type="text" style="width:100%; border:none; font-family:'SF Mono', monospace; font-size:0.85rem; text-transform:uppercase; background:transparent; color:#86868b;" 
                               value="${c.dataType || ''}" placeholder="TYPE" onchange="updateTsCol('${c.id}','dataType',this.value)">
                    </td>
                    <td style="padding:16px 8px; text-align:center;">
                        <select onchange="updateTsCol('${c.id}','pk',this.value)">
                            <option value=""></option>
                            <option value="Y" ${c.pk === 'Y' ? 'selected' : ''}>Y</option>
                            <option value="N" ${c.pk === 'N' ? 'selected' : ''}>N</option>
                        </select>
                    </td>
                    <td style="padding:16px 8px; text-align:center;">
                        <select onchange="updateTsCol('${c.id}','nullable',this.value)">
                            <option value="Y" ${c.nullable === 'Y' ? 'selected' : ''}>Y</option>
                            <option value="N" ${c.nullable === 'N' ? 'selected' : ''}>N</option>
                        </select>
                    </td>
                    <td style="padding:16px 8px;">
                        <input type="text" style="width:100%; border:none; font-family:'SF Mono', monospace; font-size:0.8rem; color:#ff3b30; background:transparent;" 
                               value="${c.defaultValue || ''}" placeholder="DEFAULT" onchange="updateTsCol('${c.id}','defaultValue',this.value)">
                    </td>
                    <td style="padding:16px 8px;">
                        <input type="text" style="width:100%; border:none; color:#6b6b6b; font-size:0.85rem; background:transparent;" 
                               value="${c.note || ''}" placeholder="鍮꾧퀬" onchange="updateTsCol('${c.id}','note',this.value)">
                    </td>
                    <td style="padding:16px 8px; text-align:center;">
                        <button onclick="deleteTsCol('${c.id}')" style="background:transparent; border:none; color:#ff3b30; cursor:pointer; font-size:1.2rem; opacity:0.5; transition:0.3s;" 
                                onmouseover="this.style.opacity='1'; this.style.transform='scale(1.2)';" onmouseout="this.style.opacity='0.5'; this.style.transform='scale(1)';" title="??젣">??/button>
                    </td>
                `;

                // ???몃쾭 ?④낵
                tr.onmouseenter = () => tr.style.background = 'rgba(0,0,0,0.03)';
                tr.onmouseleave = () => tr.style.background = 'transparent';

                tbody.appendChild(tr);
            });
        }

        function updateTsMeta() {
            if (!currentTableSpec) return;
            currentTableSpec.tableName = document.getElementById('ts-meta-name').value.trim().toUpperCase();
            currentTableSpec.tableComments = document.getElementById('ts-meta-comments').value.trim();
            saveTableSpecs(false);
            renderTableSpecs();
        }

        function updateTsCol(id, field, val) {
            if (!currentTableSpec) return;
            const c = currentTableSpec.columns.find(x => x.id === id);
            if (c) {
                if (field === 'seq') val = parseInt(val) || 0;
                if (field === 'columnName') val = val.toUpperCase();
                c[field] = val;
            }
        }

        function deleteTsCol(id) {
            if (!currentTableSpec) return;
            currentTableSpec.columns = currentTableSpec.columns.filter(x => x.id !== id);
            renderTableSpecViewer();
        }

        function addTableSpecColumn() {
            if (!currentTableSpec) return;
            if (!currentTableSpec.columns) currentTableSpec.columns = [];
            const maxSeq = currentTableSpec.columns.reduce((m, c) => Math.max(m, c.seq), 0);
            currentTableSpec.columns.push({
                id: Math.random().toString(36).substr(2, 9),
                seq: maxSeq + 1,
                columnName: '', comments: '', dataType: 'VARCHAR2(100)', pk: '', nullable: 'Y', defaultValue: '', note: ''
            });
            renderTableSpecViewer();
        }

        function addNewTableSpec() {
            const t = {
                id: Math.random().toString(36).substr(2, 9),
                tableName: 'NEW_TABLE',
                tableComments: '?좉퇋 ?뚯씠釉?,
                columns: []
            };
            tableSpecs.push(t);
            currentTableSpec = t;
            renderTableSpecs();
        }

        function deleteCurrentTableSpec() {
            if (!currentTableSpec) return;
            if (confirm(`[${currentTableSpec.tableName}] ?뚯씠釉붿쓣 ??젣?섏떆寃좎뒿?덇퉴?`)) {
                tableSpecs = tableSpecs.filter(x => x.id !== currentTableSpec.id);
                currentTableSpec = null;
                saveTableSpecs();
                renderTableSpecs();
            }
        }

        function saveTableSpecs(notify = true) {
            localStorage.setItem('tableSpecs', JSON.stringify(tableSpecs));
            if (ghConfig && ghConfig.token && ghConfig.autoSync) {
                if (typeof syncWithGitHub === 'function') {
                    syncWithGitHub('upload', 'task/tableSpecs.json', tableSpecs).catch(e => console.error(e));
                }
            }
            if (notify) showToast('??λ릺?덉뒿?덈떎.', '??);
        }



        let serverTableSpecs = null;

        function showLoading(isVisible, text = '?쒕쾭? ?듭떊 以묒엯?덈떎...') {
            const overlay = document.getElementById('global-loading');
            const textEl = overlay.querySelector('.loading-text');
            if (textEl) textEl.innerText = text;
            overlay.style.display = isVisible ? 'flex' : 'none';
        }

        async function syncTableSpecsFromServer() {
            if (!ghConfig.token || !ghConfig.repo) {
                showToast('GitHub ?ㅼ젙??癒쇱? ?뺤씤?댁＜?몄슂.', '?좑툘');
                return;
            }

            showLoading(true, '?쒕쾭 ?곗씠?곕? 議고쉶?섎뒗 以?..');
            try {
                const mainPath = `task/tableSpecs.json`;
                const rawServerData = await syncWithGitHub('download', mainPath);

                if (!rawServerData) {
                    showLoading(false);
                    if (confirm('?쒕쾭???곗씠?곌? ?놁뒿?덈떎. ?꾩옱 ?곗씠?곕? ?쒕쾭??珥덇린 諛깆뾽?섏떆寃좎뒿?덇퉴?')) {
                        await executeSyncAction('upload');
                    }
                    return;
                }

                serverTableSpecs = getNormalizedData(rawServerData);
                const normalizedLocalSpecs = getNormalizedData(tableSpecs);

                const localStr = JSON.stringify(normalizedLocalSpecs);
                const serverStr = JSON.stringify(serverTableSpecs);

                if (localStr === serverStr) {
                    showLoading(false);
                    showToast('?대? ?쒕쾭? 理쒖떊 ?곹깭濡??숆린?붾릺???덉뒿?덈떎.', '??);
                    return;
                }

                // ?곗씠??鍮꾧탳 ?뺣낫 ?쒖떆
                const localSize = new Blob([localStr]).size;
                const serverSize = new Blob([serverStr]).size;

                document.getElementById('sync-local-info').innerText = `${normalizedLocalSpecs.length}媛?;
                document.getElementById('sync-server-info').innerText = `${serverTableSpecs.length}媛?;

                document.getElementById('sync-local-info').title = `?ш린: ${formatSize(localSize)}`;
                document.getElementById('sync-server-info').title = `?ш린: ${formatSize(serverSize)}`;

                showLoading(false);
                document.getElementById('ts-sync-modal').style.display = 'flex';
            } catch (e) {
                showLoading(false);
                console.error("Sync Check Error:", e);
                showToast('?숆린???뺤씤 ?ㅽ뙣: ' + e.message, '??);
            }
        }

        function formatSize(bytes) {
            return bytes > 1024 ? (bytes / 1024).toFixed(2) + ' KB' : bytes + ' Bytes';
        }

        function closeSyncModal() {
            document.getElementById('ts-sync-modal').style.display = 'none';
        }

        async function executeSyncAction(action) {
            closeSyncModal();
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const backupPath = `task/backup/table-specs-${dateStr}.json`;
            const mainPath = `task/tableSpecs.json`;

            try {
                if (action === 'download') {
                    if (serverTableSpecs) {
                        showLoading(true, '?곗씠?곕? ?곸슜?섎뒗 以?..');
                        tableSpecs = getNormalizedData(serverTableSpecs);
                        localStorage.setItem('tableSpecs', JSON.stringify(tableSpecs));
                        currentTableSpec = null;
                        renderTableSpecs();
                        renderTableSpecViewer();
                        showLoading(false);
                        showToast('?쒕쾭 ?곗씠?곕? ?깃났?곸쑝濡?遺덈윭?붿뒿?덈떎.', '??);
                    } else {
                        showToast('遺덈윭???쒕쾭 ?곗씠?곌? ?좏슚?섏? ?딆뒿?덈떎.', '?좑툘');
                    }
                } else if (action === 'upload') {
                    const jsonStr = JSON.stringify(tableSpecs, null, 2);
                    const sizeInBytes = new Blob([jsonStr]).size;
                    const sizeStr = formatSize(sizeInBytes);

                    showLoading(true, '?쒕쾭??諛깆뾽 諛??낅줈??以?..');
                    const success = await uploadToGitHub(backupPath, tableSpecs, `Sync Backup: ${dateStr}`);
                    if (success) {
                        // 硫붿씤 ?뚯씪 ?낅뜲?댄듃
                        await uploadToGitHub(mainPath, tableSpecs, `Master Sync: ${dateStr}`);

                        // ?낅줈???깃났 ??濡쒖뺄 ?곹깭媛 理쒖떊?대?濡?蹂꾨룄 ?ㅼ슫濡쒕뱶 寃利??놁씠 ?좎?
                        localStorage.setItem('tableSpecs', JSON.stringify(tableSpecs));
                        renderTableSpecs();
                        renderTableSpecViewer();

                        showLoading(false);
                        showToast(`?쒕쾭 諛깆뾽 ?꾨즺: ${dateStr} (${sizeStr})`, '??);
                    } else {
                        showLoading(false);
                        showToast('?쒕쾭 ?낅줈??以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.', '??);
                    }
                }
            } catch (e) {
                showLoading(false);
                console.error("Sync Execute Error:", e);
                showToast('?숆린???묒뾽 ?ㅽ뙣: ' + e.message, '??);
            }
        }

        async function showBackupHistory() {
            if (!ghConfig.token || !ghConfig.repo) {
                showToast('GitHub ?ㅼ젙??癒쇱? ?뺤씤?댁＜?몄슂.', '?좑툘');
                return;
            }

            const container = document.getElementById('backup-list-container');
            if (container) {
                container.innerHTML = `
                    <div style="display:flex; justify-content:center; align-items:center; padding:40px; color:#a2a2a6; flex-direction:column; gap:15px;">
                        <div class="loading-spinner"></div>
                        <div style="font-weight:600; font-size:0.95rem;">?쒕쾭 諛깆뾽 湲곕줉??議고쉶?섎뒗 以?..</div>
                    </div>
                `;
            }

            // 紐⑤떖 ?닿린
            const modal = document.getElementById('ts-history-modal');
            if (modal) modal.style.display = 'flex';

            try {
                // 1. 留덉뒪???뚯씪 議고쉶 (?꾩옱 ?쇱씠釉??곗씠??
                const masterPath = `task/tableSpecs.json`;
                const masterRes = await fetch(`https://api.github.com/repos/${ghConfig.repo}/contents/${masterPath}?ref=${ghConfig.branch}&t=${Date.now()}`, {
                    headers: { 'Authorization': `token ${ghConfig.token}`, 'Accept': 'application/vnd.github.v3+json' },
                    cache: 'no-store'
                });
                const masterExists = masterRes.ok;

                // 2. 諛깆뾽 紐⑸줉 議고쉶
                const backupUrl = `https://api.github.com/repos/${ghConfig.repo}/contents/task/backup?ref=${ghConfig.branch}&t=${Date.now()}`;
                const backupRes = await fetch(backupUrl, {
                    headers: { 'Authorization': `token ${ghConfig.token}`, 'Accept': 'application/vnd.github.v3+json' },
                    cache: 'no-store'
                });

                let files = [];
                if (backupRes.status === 200) {
                    files = await backupRes.json();
                }

                if (!Array.isArray(files)) files = [];
                const backups = files.filter(f => f.name.endsWith('.json'))
                    .sort((a, b) => b.name.localeCompare(a.name));

                renderBackupList(backups, masterExists);
                showLoading(false);
            } catch (e) {
                showLoading(false);
                console.error("Fetch History Error:", e);
                if (container) container.innerHTML = `<div style="padding:40px; color:#ff453a; text-align:center;">紐⑸줉 議고쉶 ?ㅽ뙣: ${e.message}</div>`;
            }
        }

        function renderBackupList(backups, masterExists) {
            const container = document.getElementById('backup-list-container');
            let html = '';

            // 1. ?쇱씠釉?留덉뒪???뺣낫 ?쒖떆
            if (masterExists) {
                html += `
                    <div style="margin-bottom:25px;">
                        <div style="font-size:0.8rem; font-weight:800; color:#0071e3; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:1.1rem;">?뙋</span> Live Server Master (?꾩옱 ?쒖꽦 ?곗씠??
                        </div>
                        <div style="background:rgba(0, 113, 227, 0.05); border:1px solid rgba(0, 113, 227, 0.15); border-radius:1.5rem; padding:20px; display:flex; justify-content:space-between; align-items:center; position:relative; overflow:hidden;">
                            <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:#0071e3;"></div>
                            <div>
                                <div style="font-weight:800; color:var(--text-main); font-size:1.1rem;">tableSpecs.json</div>
                                <div style="font-size:0.85rem; color:var(--text-muted); margin-top:6px; line-height:1.5;">?꾩옱 ???뚯씪?먯꽌 ?ㅼ떆媛꾩쑝濡??곗씠?곕? 遺덈윭?ㅺ퀬 ?덉뒿?덈떎.</div>
                            </div>
                            <div style="background:#0071e3; color:#fff; font-size:0.75rem; font-weight:900; padding:5px 12px; border-radius:2rem; box-shadow:0 2px 8px rgba(0, 113, 227, 0.3);">ACTIVE</div>
                        </div>
                    </div>
                    <div style="height:1px; background:rgba(0,0,0,0.06); margin-bottom:25px; margin-top:5px;"></div>
                `;
            }

            // 2. 諛깆뾽 ?ㅻ깄???ㅻ뜑
            html += `
                <div style="font-size:0.8rem; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">
                    Backup Snapshots (怨쇨굅 ?쒖젏 湲곕줉)
                </div>
            `;

            if (backups.length === 0) {
                html += `
                    <div style="padding:45px 25px; text-align:center; background:var(--bg-card); border-radius:1.8rem; border:1px dashed rgba(0,0,0,0.15);">
                        <div style="font-size:3rem; margin-bottom:20px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.05));">?뱛</div>
                        <div style="font-weight:800; color:var(--text-main); margin-bottom:10px; font-size:1.2rem;">諛깆뾽 ?ㅻ깄?룹씠 議댁옱?섏? ?딆뒿?덈떎.</div>
                        <div style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">
                            ?ъ슜?먭? '??? ?먮뒗 '?숆린??瑜??ㅽ뻾????諛깆뾽蹂몄씠 ?먮룞 ?앹꽦?⑸땲??<br>
                            ?꾩옱???쒕쾭??<b>留덉뒪???뚯씪留?議댁옱</b>?섎뒗 ?곹깭?낅땲??
                        </div>
                    </div>
                `;
            } else {
                backups.forEach(f => {
                    const dateMatch = f.name.match(/\d{4}-\d{2}-\d{2}/) || f.name.match(/\d{8}/);
                    let dateStr = dateMatch ? dateMatch[0] : 'Snapshot';
                    if (dateStr.length === 8 && !dateStr.includes('-')) {
                        dateStr = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
                    }
                    const sizeStr = formatSize(f.size);

                    html += `
                        <div class="ts-table-item" onclick="loadSpecificBackup('${f.path}', '${dateStr}')" 
                             style="justify-content:space-between; background:var(--bg-card); border:1px solid rgba(0,0,0,0.06); border-radius:1.5rem; padding:18px 22px; cursor:pointer; transition:0.3s; display:flex; align-items:center; gap:15px; margin-bottom:8px; box-shadow: 0 1px 4px rgba(0,0,0,0.04);"
                             onmouseenter="this.style.background='#f9f9fb'; this.style.borderColor='rgba(0,0,0,0.1)';" onmouseleave="this.style.background='var(--bg-card)'; this.style.borderColor='rgba(0,0,0,0.06)'">
                            <div style="display:flex; align-items:center; gap:15px; flex:1; overflow:hidden;">
                                <div style="font-size:1.6rem; background:rgba(0,0,0,0.03); width:50px; height:50px; display:flex; align-items:center; justify-content:center; border-radius:1rem;">?뱞</div>
                                <div style="overflow:hidden;">
                                    <div style="font-weight:800; color:var(--text-main); font-size:1rem; margin-bottom:4px;">${dateStr} 諛깆뾽</div>
                                    <div style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${f.name}</div>
                                </div>
                            </div>
                            <div style="display:flex; align-items:center; gap:15px; flex-shrink:0;">
                                <div style="text-align:right;">
                                    <div style="font-weight:800; color:#0071e3; font-size:0.9rem;">${sizeStr}</div>
                                    <div style="font-size:0.7rem; color:var(--text-muted); font-weight:600;">RESTORE &gt;</div>
                                </div>
                                <button onclick="event.stopPropagation(); deleteSpecificBackup('${f.path}', '${f.sha}', '${dateStr}')" 
                                        style="background:rgba(255,69,58,0.1); color:#ff453a; border:1px solid rgba(255,69,58,0.2); padding:6px 14px; border-radius:1rem; font-size:0.8rem; font-weight:800; cursor:pointer; transition:0.2s;"
                                        onmouseenter="this.style.background='rgba(255,69,58,0.2)'" onmouseleave="this.style.background='rgba(255,69,58,0.1)'">
                                    ??젣
                                </button>
                            </div>
                        </div>
                    `;
                });
            }
            container.innerHTML = html;
        }

        function closeBackupHistory() {
            document.getElementById('ts-history-modal').style.display = 'none';
        }

        async function loadSpecificBackup(path, dateLabel) {
            if (!confirm(`${dateLabel} ?쒖젏???곗씠?곕? ?쒕쾭?먯꽌 遺덈윭? ?꾩옱 ?붾㈃????뼱?곗떆寃좎뒿?덇퉴?`)) return;

            showLoading(true, `${dateLabel} ?곗씠?곕? 遺덈윭?ㅻ뒗 以?..`);
            try {
                let data = await syncWithGitHub('download', path);

                if (typeof data === 'string') {
                    try { data = JSON.parse(data); } catch (e) { }
                }

                if (data !== null && data !== undefined) {
                    console.log('Backup data fetched, normalizing...', typeof data);
                    const finalData = getNormalizedData(data);

                    if (!finalData || finalData.length === 0) {
                        console.warn('Normalized data is empty. Original data type:', typeof data);
                        showToast(`${dateLabel} 諛깆뾽??鍮꾩뼱?덇굅???뺤떇???섎せ?섏뿀?듬땲?? (?곗씠??0媛?`, '?좑툘');
                        showLoading(false);
                        return;
                    }

                    tableSpecs = finalData;
                    localStorage.setItem('tableSpecs', JSON.stringify(tableSpecs));

                    // ?곹깭 珥덇린??諛?寃?됱갹 鍮꾩슦湲?
                    currentTableSpec = null;
                    currentTableSearch = '';
                    const searchInput = document.getElementById('ts-search-input');
                    if (searchInput) {
                        searchInput.value = '';
                        toggleClearBtn('ts-search-input');
                    }

                    // 酉??꾪솚 諛??뚮뜑留?
                    switchView('view-table-spec');
                    renderTableSpecs();
                    renderTableSpecViewer();

                    closeBackupHistory();
                    showLoading(false);
                    showToast(`${dateLabel} 諛깆뾽(${tableSpecs.length}媛? 蹂듦뎄 ?꾨즺`, '??);
                } else {
                    throw new Error('?곗씠?곕? 媛?몄삤吏 紐삵뻽?듬땲??');
                }
            } catch (e) {
                showLoading(false);
                console.error("Restore Error:", e);
                showToast('蹂듦뎄 ?ㅽ뙣: ' + e.message, '??);
            }
        }

        async function deleteSpecificBackup(path, sha, dateLabel) {
            if (!confirm(`${dateLabel} 諛깆뾽 ?뚯씪???쒕쾭?먯꽌 ?곴뎄?곸쑝濡???젣?섏떆寃좎뒿?덇퉴?`)) return;

            showLoading(true, `${dateLabel} 諛깆뾽 ??젣 以?..`);
            try {
                const url = `https://api.github.com/repos/${ghConfig.repo}/contents/${path}`;
                const headers = {
                    'Authorization': `token ${ghConfig.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                };
                const body = JSON.stringify({
                    message: `Delete backup: ${path}`,
                    sha: sha,
                    branch: ghConfig.branch
                });

                const res = await fetch(url, { method: 'DELETE', headers, body });
                if (!res.ok) throw new Error('?뚯씪 ??젣???ㅽ뙣?덉뒿?덈떎.');

                // UI?먯꽌 利됱떆 ?쒓굅
                const itemEl = document.getElementById(`backup-item-${sha}`);
                if (itemEl) {
                    itemEl.style.opacity = '0';
                    itemEl.style.transform = 'translateX(20px)';
                    itemEl.style.transition = '0.3s';
                    setTimeout(() => itemEl.remove(), 300);
                }

                showToast(`${dateLabel} 諛깆뾽????젣?섏뿀?듬땲??`, '??);
                showLoading(false);

                // ?쎄컙??吏????紐⑸줉 ?덈줈怨좎묠 (?쒕쾭 諛섏쁺 ?湲?
                setTimeout(() => {
                    showBackupHistory();
                }, 1000);
            } catch (e) {
                showLoading(false);
                console.error("Delete Error:", e);
                showToast('??젣 ?ㅽ뙣: ' + e.message, '??);
            }
        }

        function openTableBulkModal() {
            document.getElementById('ts-bulk-modal').style.display = 'flex';
            document.getElementById('ts-bulk-data').value = '';
            document.getElementById('ts-bulk-data').focus();
        }
        function closeTableBulkModal() {
            document.getElementById('ts-bulk-modal').style.display = 'none';
        }
        function processTableBulkData() {
            const raw = document.getElementById('ts-bulk-data').value;
            if (!raw.trim()) { showToast('?낅젰???곗씠?곌? ?놁뒿?덈떎.', '?좑툘'); return; }

            // ?쒖? TSV ?뚯떛 (?곗샂??諛??대? 以꾨컮轅?泥섎━)
            const rows = [];
            let currentRow = [];
            let currentField = '';
            let inQuotes = false;

            for (let i = 0; i < raw.length; i++) {
                const char = raw[i];
                const nextChar = raw[i + 1];
                if (inQuotes) {
                    if (char === '"' && nextChar === '"') {
                        currentField += '"'; i++;
                    } else if (char === '"') {
                        inQuotes = false;
                    } else {
                        currentField += char;
                    }
                } else {
                    if (char === '"') {
                        inQuotes = true;
                    } else if (char === '\t') {
                        currentRow.push(currentField);
                        currentField = '';
                    } else if (char === '\n' || char === '\r') {
                        if (char === '\r' && nextChar === '\n') i++;
                        currentRow.push(currentField);
                        rows.push(currentRow);
                        currentRow = [];
                        currentField = '';
                    } else {
                        currentField += char;
                    }
                }
            }
            if (currentField || currentRow.length > 0) {
                currentRow.push(currentField);
                rows.push(currentRow);
            }

            let count = 0;
            let m = {};
            let lastTName = '';
            let lastTComm = '';

            rows.forEach(p => {
                // ?섎? ?덈뒗 ?곗씠?곌? ?녿뒗 ???ㅽ궢
                if (p.length < 4 || (!p[0]?.trim() && !p[3]?.trim())) return;

                let tName = p[0]?.trim().toUpperCase();
                let tComm = p[1]?.trim();

                if (!tName) {
                    tName = lastTName;
                    tComm = lastTComm;
                } else {
                    lastTName = tName;
                    lastTComm = tComm;
                }

                if (!tName) return;

                const cName = p[3]?.trim().toUpperCase();
                if (!cName) return;

                let pkVal = p[6]?.trim() || '';
                if (/^P\d+$/i.test(pkVal)) pkVal = 'Y';

                if (!m[tName]) m[tName] = { comments: tComm || '', cols: [] };
                m[tName].cols.push({
                    id: Math.random().toString(36).substr(2, 9),
                    seq: parseInt(p[2]) || (m[tName].cols.length + 1),
                    columnName: cName,
                    comments: p[4]?.trim() || '',
                    dataType: p[5]?.trim() || '',
                    pk: pkVal,
                    nullable: p[7]?.trim() || 'Y',
                    defaultValue: p[8]?.trim() || '',
                    note: p[9]?.trim() || ''
                });
                count++;
            });
            if (count === 0) { alert('?좏슚 ?곗씠???놁쓬. ??援щ텇???뺤씤?섏꽭??'); return; }
            Object.keys(m).forEach(k => {
                let e = tableSpecs.find(x => x.tableName === k);
                if (!e) {
                    e = { id: Math.random().toString(36).substr(2, 9), tableName: k, tableComments: m[k].comments, columns: [] };
                    tableSpecs.push(e);
                } else if (!e.tableComments && m[k].comments) {
                    e.tableComments = m[k].comments;
                }
                if (!e.columns) e.columns = [];
                e.columns.push(...m[k].cols);
            });
            saveTableSpecs(false);
            closeTableBulkModal();
            renderTableSpecs();
            alert(`${count}嫄??깅줉 ?꾨즺.`);
        }

        function renderSidebar() {
            const dock = document.getElementById('top-nav-dock');
            if (!dock) return;

            dock.innerHTML = menus.map(m => `
                <div class="top-nav-item ${currentView === m.viewId ? 'active' : ''}" onclick="handleMenuClick('${m.id}')">
                    <span class="top-nav-icon">${m.icon}</span>
                    <span class="top-nav-text">${m.name}</span>
                </div>
            `).join('');
        }

        function toggleSidebar() { document.getElementById('sidebar').classList.toggle('collapsed'); }

        function handleMenuClick(id) {
            console.log('handleMenuClick triggered for:', id);
            if (id === 'settings') {
                openGitHubSettings();
                return;
            }
            const menu = menus.find(m => m.id === id);
            if (!menu) return;
            currentView = menu.viewId || 'view-task';
            switchView(currentView);

            if (id === 'news') {
                updateNewsTodayDate();
                parallelNewsFetch(true);
            }

            // Sync Title
            setTimeout(() => {
                const activeViewEl = document.getElementById(currentView);
                if (activeViewEl) {
                    const titleH1 = activeViewEl.querySelector('h1');
                    if (titleH1) {
                        titleH1.innerText = menu.name;
                        document.title = menu.name + ' | Task Manager';
                    }
                }
            }, 50);
            renderSidebar();
        }

        function switchView(viewId) {
            currentView = viewId;
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            const target = document.getElementById(viewId);
            if (target) target.classList.add('active');
            renderSidebar();
            if (viewId === 'view-dashboard') renderCalendar();

            // ?뚯씠釉??뺤쓽??硫붾돱 吏꾩엯 ???먮룞 ?쒕쾭 ?숆린??泥댄겕
            if (viewId === 'view-table-spec') {
                syncTableSpecsFromServer();
            }
            if (viewId === 'view-query') {
                renderQueries();
            }
        }

        async function loadTasks() {
            const saved = localStorage.getItem('tasks');
            if (saved) tasks = JSON.parse(saved);
        }

        function render() {
            const container = document.getElementById('task-card-container');
            if (!container) return;
            const filtered = tasks.filter(t => {
                const matchesSearch = t.title.toLowerCase().includes(currentSearchQuery.toLowerCase());
                const matchesStatus = currentStatusFilter === 'all' || t.status === currentStatusFilter;
                return matchesSearch && matchesStatus;
            });

            updateStats();
            updateRecentTaskBanner();

            const displayTasks = filtered.slice(0, visibleCount);
            container.innerHTML = displayTasks.map(t => {
                const statusMap = { todo: '吏꾪뻾??, progress: '吏꾪뻾以?, hold: '蹂대쪟', done: '?꾨즺' };

                // 諛고룷 ?곹깭 怨꾩궛 濡쒖쭅
                const today = new Date().toISOString().split('T')[0];
                let devDate = (t.dev_deploy_date || '').split('(')[0].trim();
                let prodDate = (t.deploy_date || '').split('(')[0].trim();

                let devStatus = '媛쒕컻諛고룷??;
                if (devDate && devDate < today) devStatus = '媛쒕컻諛고룷?꾨즺';

                let prodStatus = '?댁쁺諛고룷??;
                if (prodDate && prodDate < today) prodStatus = '?댁쁺諛고룷?꾨즺';

                let devStr = devStatus === '媛쒕컻諛고룷?꾨즺' ? '諛고룷?꾨즺' : '諛고룷??;
                let prodStr = prodStatus === '?댁쁺諛고룷?꾨즺' ? '諛고룷?꾨즺' : '諛고룷??;

                const isPendingDeploy = prodStatus === '?댁쁺諛고룷??;

                return `
                    <div class="task-card-apple ${t.status} ${isPendingDeploy ? 'pending-deploy' : ''}" id="card-${t.id}" onclick="showDetail('${t.id}')">
                        <div class="card-header-info">#${t.task_no || '-'} [${t.work_no || '-'}]</div>
                        <div class="card-title" title="${t.title}">${t.title}</div>
                        <div class="card-dates">
                            <span>?뮲 媛쒕컻諛고룷: ${(t.dev_deploy_date || '-').split('(')[0].trim()}</span>
                            <span>?? ?댁쁺諛고룷: ${(t.deploy_date || '-').split('(')[0].trim()}</span>
                        </div>
                        <div class="card-deploy-status" style="display: flex; align-items: center; gap: 6px; margin-top: 10px;">
                            <div style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; background: ${devStatus === '媛쒕컻諛고룷?꾨즺' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(142, 142, 147, 0.08)'}; color: ${devStatus === '媛쒕컻諛고룷?꾨즺' ? '#34c759' : '#8e8e93'}; border: 1px solid ${devStatus === '媛쒕컻諛고룷?꾨즺' ? 'rgba(52, 199, 89, 0.2)' : 'transparent'}; letter-spacing: -0.02em;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    ${devStatus === '媛쒕컻諛고룷?꾨즺' ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'}
                                </svg>
                                媛쒕컻(${devStr})
                            </div>
                            
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d1d6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>

                            <div style="display: flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 700; background: ${prodStatus === '?댁쁺諛고룷?꾨즺' ? 'rgba(0, 113, 227, 0.1)' : 'rgba(142, 142, 147, 0.08)'}; color: ${prodStatus === '?댁쁺諛고룷?꾨즺' ? '#0071e3' : '#8e8e93'}; border: 1px solid ${prodStatus === '?댁쁺諛고룷?꾨즺' ? 'rgba(0, 113, 227, 0.2)' : 'transparent'}; letter-spacing: -0.02em;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    ${prodStatus === '?댁쁺諛고룷?꾨즺' ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'}
                                </svg>
                                ?댁쁺(${prodStr})
                            </div>
                        </div>
                        <div class="card-footer" style="margin-top: 14px;">
                            <div class="card-badge ${t.status}">${statusMap[t.status] || t.status}</div>
                            <div class="card-actions">
                                 <button class="btn-mini" onclick="event.stopPropagation(); openModal('${t.id}')">?섏젙</button>
                                 <button class="btn-mini delete" onclick="event.stopPropagation(); deleteTask('${t.id}')">??젣</button>
                             </div>
                         </div>
                     </div>
                 `;
            }).join('');

            const btnContainer = document.getElementById('btn-load-more-container');
            if (btnContainer) {
                if (filtered.length > visibleCount) {
                    btnContainer.innerHTML = `<button id="btn-load-more" class="btn-load-more" onclick="loadMore()">?붾낫湲?(+3)</button>`;
                    btnContainer.style.display = 'flex';
                } else if (filtered.length > 6) {
                    btnContainer.innerHTML = `<button id="btn-reset" class="btn-load-more reset" onclick="resetTasks()">泥섏쓬?쇰줈</button>`;
                    btnContainer.style.display = 'flex';
                } else {
                    btnContainer.style.display = 'none';
                }
            }
        }

        function updateStats() {
            const stats = { total: tasks.length, todo: 0, progress: 0, hold: 0, done: 0 };
            tasks.forEach(t => { if (stats[t.status] !== undefined) stats[t.status]++; });
            ['stat', 'dash-stat'].forEach(prefix => {
                ['total', 'todo', 'progress', 'hold', 'done'].forEach(key => {
                    const el = document.getElementById(`${prefix}-${key}`);
                    if (el) el.innerText = stats[key];
                });
            });

            // Update Manpower Dash Stat

            const mainManpowerTotal = document.getElementById('stat-manpower-total');
            if (mainManpowerTotal) mainManpowerTotal.innerText = manpowers.length;
        }

        function updateRecentTaskBanner() {
            const banner = document.getElementById('recent-task-banner');
            const section = document.getElementById('recent-task-section');
            if (!banner) return;

            const today = new Date().toISOString().split('T')[0];
            const activeTasks = tasks.filter(t => {
                if (t.status === 'done') return false;
                if (!t.deploy_date) return true;
                const cleanDate = t.deploy_date.split('(')[0].trim();
                return cleanDate >= today;
            });
            if (activeTasks.length === 0) {
                if (section) section.style.display = 'none';
                else banner.style.display = 'none';
                return;
            }

            if (section) section.style.display = 'block';
            else banner.style.display = 'flex';
            banner.innerHTML = activeTasks.map(t => {
                const badgeClass = t.status === 'todo' ? 'todo' : (t.status === 'progress' ? 'progress' : (t.status === 'hold' ? 'hold' : ''));
                const labelText = t.status === 'todo' ? 'TODO' : (t.status === 'progress' ? 'PROGRESS' : (t.status === 'hold' ? 'HOLD' : ''));

                // 蹂듭궗??諛??몄텧???띿뒪??(?쒖닔 ?띿뒪??議고빀)
                const mainInfoText = `#${t.task_no || '-'} [${t.work_no || '-'}] ${t.title}`;
                const deployText = t.deploy_date ? ` | 諛고룷: ${t.deploy_date.split('(')[0].trim()}` : '';
                const fullText = mainInfoText + deployText;

                return `
                    <div class="recent-task-item" onclick="focusOnCard('${t.id}')" style="cursor:pointer;">
                        <div class="recent-task-info">
                            <span class="recent-task-label ${badgeClass}">${labelText}</span>
                            <div class="recent-task-meta">
                                <span class="recent-task-title" title="${fullText}">${fullText}</span>
                            </div>
                        </div>
                        <button class="btn-copy-action" onclick="event.stopPropagation(); copySpecificTask('${fullText.replace(/'/g, "\\'")}', this)" title="?뺣낫 蹂듭궗">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>蹂듭궗</span>
                        </button>
                    </div>
                `;
            }).join('');
        }

        function copySpecificTask(text, btn) {
            navigator.clipboard.writeText(text).then(() => {
                const old = btn.innerText;
                btn.innerText = '蹂듭궗 ?꾨즺!';
                btn.style.color = 'var(--success)';
                setTimeout(() => {
                    btn.innerText = old;
                    btn.style.color = '';
                }, 1500);
            });
        }

        function focusOnCard(taskId) {
            const card = document.getElementById(`card-${taskId}`);
            if (!card) {
                // 移대뱶媛 ?꾩옱 ?꾪꽣留곷릺????蹂댁씪 ?섎룄 ?덉쑝誘濡??꾪꽣瑜??꾩껜濡?珥덇린???쒕룄
                setStatusFilter('all');
                setTimeout(() => {
                    const retryCard = document.getElementById(`card-${taskId}`);
                    if (retryCard) {
                        doFocusAction(retryCard);
                    }
                }, 100);
                return;
            }
            doFocusAction(card);
        }

        function doFocusAction(cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardEl.classList.add('rainbow-highlight');
            setTimeout(() => {
                cardEl.classList.remove('rainbow-highlight');
            }, 3000);
        }

        function setStatusFilter(status) {
            currentStatusFilter = status;
            const group = document.getElementById('status-filter-group');
            if (group) {
                const pills = group.querySelectorAll('.status-pill');
                pills.forEach(p => {
                    // 媛?踰꾪듉??onclick ?띿꽦???섍꺼吏??몄옄媛믨낵 ?꾩옱 ?좏깮??status瑜?鍮꾧탳
                    const isTarget = p.getAttribute('onclick').includes(`'${status}'`);
                    if (isTarget) p.classList.add('active');
                    else p.classList.remove('active');
                });
            }
            render();
        }

        function saveTask() {
            const id = document.getElementById('task-id').value;
            const task = {
                id: id || Date.now().toString(),
                title: document.getElementById('title').value,
                receive_date: document.getElementById('receive_date').value,
                status: document.getElementById('status').value,
                work_no: document.getElementById('work_no').value,
                task_no: document.getElementById('task_no').value,
                product_no: document.getElementById('product_no').value,
                task_content: document.getElementById('task_content').value,
                dev_deploy_date: document.getElementById('dev_deploy_date').value,
                deploy_date: document.getElementById('deploy_date').value,
                pub_content: document.getElementById('pub_content').value,
                remarks: document.getElementById('remarks').value,
                start_date: document.getElementById('start_date').value,
                end_date: document.getElementById('end_date').value,
                reference: document.getElementById('reference').value,
                updated_at: new Date().toISOString()
            };
            if (id) tasks = tasks.map(t => t.id === id ? task : t);
            else tasks.unshift(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            render();
            showToast('??λ릺?덉뒿?덈떎.');
            closeModal();

            if (ghConfig.token && ghConfig.autoSync) {
                const saveBtn = document.querySelector('.btn-save-main');
                if (saveBtn) {
                    const originalText = saveBtn.innerText;
                    saveBtn.innerText = '?숆린??以?..';
                    syncWithGitHub('upload').then(() => {
                        saveBtn.innerText = originalText;
                    }).catch(e => {
                        console.error(e);
                        saveBtn.innerText = originalText;
                    });
                } else {
                    syncWithGitHub('upload').catch(console.error);
                }
            }
        }

        function deleteTask(id) {
            if (!confirm('?뺣쭚 ??젣?섏떆寃좎뒿?덇퉴?')) return;
            tasks = tasks.filter(t => t.id !== id);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            render();
            if (ghConfig.token && ghConfig.autoSync) {
                syncWithGitHub('upload').catch(console.error);
            }
        }

        function openModal(id) {
            document.getElementById('modal').classList.add('active');
            const cleanDate = (d) => d ? d.split('(')[0].trim() : '';
            if (id) {
                const t = tasks.find(x => x.id === id);
                document.getElementById('task-id').value = t.id;
                document.getElementById('title').value = t.title;
                document.getElementById('status').value = t.status;
                document.getElementById('work_no').value = t.work_no;
                document.getElementById('task_no').value = t.task_no;
                document.getElementById('product_no').value = t.product_no || '';
                document.getElementById('task_content').value = t.task_content || '';
                document.getElementById('dev_deploy_date').value = cleanDate(t.dev_deploy_date);
                document.getElementById('deploy_date').value = cleanDate(t.deploy_date);
                document.getElementById('pub_content').value = t.pub_content || '';
                document.getElementById('remarks').value = t.remarks || '';
                document.getElementById('receive_date').value = cleanDate(t.receive_date);
                document.getElementById('start_date').value = cleanDate(t.start_date);
                document.getElementById('end_date').value = cleanDate(t.end_date);
                document.getElementById('reference').value = t.reference || '';
                document.getElementById('modal-title').innerText = '?쇨컧 ?섏젙';
            } else {
                document.getElementById('task-form').reset();
                document.getElementById('task-id').value = '';
                document.getElementById('modal-title').innerText = '???쇨컧 ?깅줉';
            }
            updateStatusColor();
        }

        function closeModal() { document.getElementById('modal').classList.remove('active'); }
        function closeDetail() { document.getElementById('detail-modal').classList.remove('active'); }

        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerText = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);
        }

        function showDetail(id) {
            const t = tasks.find(x => x.id === id);
            const statusMap = { todo: '吏꾪뻾??, progress: '吏꾪뻾以?, hold: '蹂대쪟', done: '?꾨즺' };
            const statusColorMap = { todo: '#ff3b30', progress: '#ff9500', hold: '#8e8e93', done: '#34c759' };
            const statusColor = statusColorMap[t.status] || '#1d1d1f';

            document.getElementById('detail-content').innerHTML = `
                <div class="modal-header" style="margin-bottom: 0.5rem;">
                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;">
                        <span style="color: #0071e3; font-weight: 700; font-size: 1.1rem;">#${t.task_no || '-'}</span>
                        <span style="color: #5e5ce6; font-weight: 700; font-size: 1.1rem;">[${t.work_no || '-'}]</span>
                    </div>
                    <h2 style="font-size: 1.8rem; font-weight: 800; color: #1d1d1f; margin-bottom: 0.5rem;">${t.title}</h2>
                </div>
                <div class="form-grid" style="margin-top: 2rem;">
                    <div class="form-divider" style="margin-top:0"></div>
                    
                    <div class="form-group col-span-6"><label class="form-label">?묒닔??/label><div class="form-control" style="background: #f5f5f7; border: none;">${t.receive_date ? t.receive_date.split('(')[0].trim() : '-'}</div></div>
                    <div class="form-group col-span-6"><label class="form-label">?곹깭</label><div class="form-control" style="background: #f5f5f7; border: none; color: ${statusColor}; font-weight: 800;">${statusMap[t.status] || t.status}</div></div>

                    <div class="form-group col-span-3"><label class="form-label">?쒖옉??/label><div class="form-control" style="background: #f5f5f7; border: none;">${t.start_date ? t.start_date.split('(')[0].trim() : '-'}</div></div>
                    <div class="form-group col-span-3"><label class="form-label">醫낅즺??/label><div class="form-control" style="background: #f5f5f7; border: none;">${t.end_date ? t.end_date.split('(')[0].trim() : '-'}</div></div>
                    <div class="form-group col-span-3"><label class="form-label">媛쒕컻諛고룷</label><div class="form-control" style="background: #f5f5f7; border: none;">${t.dev_deploy_date ? t.dev_deploy_date.split('(')[0].trim() : '-'}</div></div>
                    <div class="form-group col-span-3"><label class="form-label">?댁쁺諛고룷</label><div class="form-control" style="background: #f5f5f7; border: none;">${t.deploy_date ? t.deploy_date.split('(')[0].trim() : '-'}</div></div>

                    <div class="form-group col-span-12"><label class="form-label">?곹뭹踰덊샇</label><div class="form-control" style="background: #f5f5f7; border: none; min-height: 50px; white-space: pre-wrap;">${t.product_no || '-'}</div></div>
                    <div class="form-group col-span-12"><label class="form-label">?낅Т?댁슜</label><div class="form-control" style="background: #f5f5f7; border: none; min-height: 150px; white-space: pre-wrap;">${t.task_content || '?댁슜 ?놁쓬'}</div></div>
                    <div class="form-group col-span-12">
                        <label class="form-label">李멸퀬?댁슜</label>
                        <div class="form-control" style="background: #f5f5f7; border: none; min-height: 150px; white-space: pre-wrap;">${t.reference || '?댁슜 ?놁쓬'}</div>
                    </div>
                    <div class="form-group col-span-12"><label class="form-label">?쇰툝?댁슜</label><div class="form-control" style="background: #f5f5f7; border: none; min-height: 80px; white-space: pre-wrap;">${t.pub_content || '-'}</div></div>
                    <div class="form-group col-span-12"><label class="form-label">鍮꾧퀬</label><div class="form-control" style="background: #f5f5f7; border: none; min-height: 80px; white-space: pre-wrap;">${t.remarks || '-'}</div></div>
                </div>
                <button class="btn-floating-edit" title="?섏젙" onclick="closeDetail(); openModal('${t.id}')">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-floating-close" title="?リ린" onclick="closeDetail()">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;
            document.getElementById('detail-modal').classList.add('active');
        }


        // ??? ??쒕?援?怨듯쑕??怨꾩궛 ???????????????????????????????????????????
        // ?뚮젰?믪뼇??蹂???뚯씠釉??ㅻ궇/異붿꽍 湲곗?, 2020-2030)
        const lunarHolidayTable = {
            2020: { seollal: '01-25', chuseok: '10-01' },
            2021: { seollal: '02-12', chuseok: '09-21' },
            2022: { seollal: '02-01', chuseok: '09-10' },
            2023: { seollal: '01-22', chuseok: '09-29' },
            2024: { seollal: '02-10', chuseok: '09-17' },
            2025: { seollal: '01-29', chuseok: '10-06' },
            2026: { seollal: '02-17', chuseok: '09-25' },
            2027: { seollal: '02-06', chuseok: '09-15' },
            2028: { seollal: '01-26', chuseok: '10-03' },
            2029: { seollal: '02-13', chuseok: '09-22' },
            2030: { seollal: '02-03', chuseok: '09-12' },
        };

        function addDateStr(base, offset) {
            const d = new Date(base + 'T00:00:00');
            d.setDate(d.getDate() + offset);
            return d.toISOString().split('T')[0];
        }

        function getKoreanHolidays(year) {
            const holidays = {};
            const add = (dateStr, name) => { holidays[dateStr] = name; };

            // 怨좎젙 怨듯쑕??
            add(`${year}-01-01`, '?좎젙');
            add(`${year}-03-01`, '?쇱씪??);
            add(`${year}-05-05`, '?대┛?대궇');
            add(`${year}-06-06`, '?꾩땐??);
            add(`${year}-08-15`, '愿묐났??);
            add(`${year}-10-03`, '媛쒖쿇??);
            add(`${year}-10-09`, '?쒓???);
            add(`${year}-12-25`, '?щ━?ㅻ쭏??);

            // 遺泥섎떂 ?ㅼ떊 ??(?뚮젰 4??8???묐젰 蹂??洹쇱궗移??뚯씠釉?
            const buddhaDates = {
                2020: '04-30', 2021: '05-19', 2022: '05-08', 2023: '05-27',
                2024: '05-15', 2025: '05-05', 2026: '05-24', 2027: '05-13',
                2028: '05-02', 2029: '05-20', 2030: '05-09'
            };
            if (buddhaDates[year]) add(`${year}-${buddhaDates[year]}`, '遺泥섎떂 ?ㅼ떊 ??);

            // ?ㅻ궇 ?고쑕 (?ㅻ궇 ?꾨궇, ?ㅻ궇, ?ㅻ궇 ?ㅼ쓬??
            const lt = lunarHolidayTable[year];
            if (lt) {
                const seollalBase = `${year}-${lt.seollal}`;
                add(addDateStr(seollalBase, -1), '?ㅻ궇 ?고쑕');
                add(seollalBase, '?ㅻ궇');
                add(addDateStr(seollalBase, 1), '?ㅻ궇 ?고쑕');

                // 異붿꽍 ?고쑕 (異붿꽍 ?꾨궇, 異붿꽍, 異붿꽍 ?ㅼ쓬??
                const chuseokBase = `${year}-${lt.chuseok}`;
                add(addDateStr(chuseokBase, -1), '異붿꽍 ?고쑕');
                add(chuseokBase, '異붿꽍');
                add(addDateStr(chuseokBase, 1), '異붿꽍 ?고쑕');
            }

            // ?泥닿났?댁씪: 怨듯쑕?쇱씠 ?쇱슂?쇱씠硫??ㅼ쓬 ?붿슂??
            const substituteKeys = Object.keys(holidays);
            substituteKeys.forEach(d => {
                const day = new Date(d + 'T00:00:00').getDay();
                if (day === 0) {  // ?쇱슂??
                    const next = addDateStr(d, 1);
                    if (!holidays[next]) add(next, '?泥닿났?댁씪');
                } else if (day === 6 && d.endsWith('-05-05')) {  // ?대┛?대궇 ?좎슂??
                    const next = addDateStr(d, 2);
                    if (!holidays[next]) add(next, '?泥닿났?댁씪');
                }
            });

            return holidays;
        }
        // ????????????????????????????????????????????????????????????????????

        function renderCalendar() {
            const year = calDate.getFullYear();
            const month = calDate.getMonth();
            document.getElementById('cal-month-year').innerText = `${year}??${month + 1}??;
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const holidays = getKoreanHolidays(year);
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            let html = '<div class="cal-day-header sun">??/div><div class="cal-day-header">??/div><div class="cal-day-header">??/div><div class="cal-day-header">??/div><div class="cal-day-header">紐?/div><div class="cal-day-header">湲?/div><div class="cal-day-header sat">??/div>';
            for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell other-month"></div>';
            for (let i = 1; i <= daysInMonth; i++) {
                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const dayOfWeek = new Date(dStr + 'T00:00:00').getDay();
                const isHoliday = !!holidays[dStr];
                const isSun = dayOfWeek === 0;
                const isSat = dayOfWeek === 6;
                const isToday = dStr === todayStr;

                // ?대떦 ?좎쭨媛 ?댁쁺諛고룷(deploy_date)???쇨컧 ?꾪꽣留?
                const dayTasks = tasks.filter(t => (t.deploy_date || '').split('(')[0].trim() === dStr);

                const eventsHtml = dayTasks.map(t => `
                    <div class="cal-task-item" title="${t.title} [${t.work_no || '-'}]" onclick="event.stopPropagation(); showDetail('${t.id}')">
                        <div class="cal-event-dot ${t.status}"></div>
                        <span>${t.title}</span>
                    </div>
                `).join('');

                let cellClass = 'cal-cell';
                if (isToday) cellClass += ' today';
                if (isHoliday || isSun) cellClass += ' holiday';

                const dateNumStyle = isSat ? 'color: var(--primary);' : '';
                const holidayLabel = isHoliday ? `<div class="cal-holiday-label">${holidays[dStr]}</div>` : '';

                html += `<div class="${cellClass}"><div class="cal-date-num" style="${dateNumStyle}">${i}</div>${holidayLabel}<div class="cal-events">${eventsHtml}</div></div>`;
            }

            // 留덉?留?二??섎㉧吏 鍮?? 梨꾩슦湲?(?곗깋 諛곌꼍?쇰줈 ?듭씪)
            const totalCells = firstDay + daysInMonth;
            const trailingCount = (7 - (totalCells % 7)) % 7;
            for (let i = 0; i < trailingCount; i++) html += '<div class="cal-cell other-month"></div>';

            document.getElementById('calendar-grid').innerHTML = html;
        }

        function prevMonth() { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); }
        function nextMonth() { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); }

        function updateStatusColor() { const el = document.getElementById('status'); if (el) el.className = 'form-control status-' + el.value; }
        function confirmSearch() { currentSearchQuery = document.getElementById('search-input').value; render(); }
        function loadMore() {
            visibleCount += 3;
            render();
        }

        function resetTasks() {
            visibleCount = 6;
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // --- Manpower Logic ---
        let currentManpowerUIMode = 'list'; // 'list' or 'hierarchy'

        function setManpowerViewMode(mode) {
            currentManpowerViewMode = mode;
            document.querySelectorAll('.view-tab').forEach(tab => tab.classList.remove('active'));
            const tab = document.getElementById(`tab-${mode}`);
            if (tab) tab.classList.add('active');
            renderManpower();
        }

        function switchManpowerUI(mode) {
            currentManpowerUIMode = mode;
            document.querySelectorAll('.manpower-main-tab').forEach(t => t.classList.remove('active'));
            const activeTab = document.getElementById(mode === 'list' ? 'm-tab-list' : 'm-tab-hierarchy');
            if (activeTab) activeTab.classList.add('active');

            const listView = document.getElementById('manpower-list-view');
            const hierarchyView = document.getElementById('manpower-hierarchy-view');
            const subTabs = document.getElementById('manpower-sub-tabs');

            if (mode === 'list') {
                listView.style.display = 'block';
                hierarchyView.style.display = 'none';
                if (subTabs) subTabs.style.display = 'flex';
            } else {
                listView.style.display = 'none';
                hierarchyView.style.display = 'block';
                if (subTabs) subTabs.style.display = 'none';

                // 留덉씤?쒕㏊ 吏꾩엯 ??洹몃９ ?숆린??諛??뚮뜑留?
                syncGroupsFromManpower();
                renderManpower();

                setTimeout(() => {
                    fitHierarchyToScreen(); // 泥섏쓬 吏꾩엯 ???먮룞?쇰줈 ?붾㈃??留욎땄
                }, 100);
            }
        }

        function toggleManpowerSection(element) {
            const section = element.closest('.project-org-section');
            if (section) {
                const alreadyOpen = !section.classList.contains('collapsed');
                const groupName = section.getAttribute('data-group-name');

                // 紐⑤뱺 ?뱀뀡 ?リ린 諛??섏씠?쇱씠???쒓굅
                document.querySelectorAll('.project-org-section').forEach(sec => {
                    sec.classList.add('collapsed');
                    sec.classList.remove('active-highlight');
                });

                // ?대┃???뱀뀡???ロ? ?덉뿀?ㅻ㈃ ??
                if (!alreadyOpen) {
                    section.classList.remove('collapsed');
                    lastExpandedManpowerGroup = groupName;
                } else {
                    lastExpandedManpowerGroup = null;
                }
            }
        }

        function renderManpower() {
            // 以묐났 ?곗씠???먮룞 ?뺣━ (?대쫫+?됰꽕??湲곗?)
            const uniqueMaps = new Map();
            let hasDuplicates = false;
            manpowers.forEach(m => {
                const key = (m.name || '').trim() + '_' + (m.nickname || '').trim();
                if (!uniqueMaps.has(key)) {
                    uniqueMaps.set(key, m);
                } else {
                    hasDuplicates = true;
                    // 湲곗〈 ?곗씠?곗뿉 ?꾩튂 ?뺣낫媛 ?녾퀬 ???곗씠?곗뿉 ?덈떎硫?蹂묓빀
                    const existing = uniqueMaps.get(key);
                    if (!existing.hierarchyPos && m.hierarchyPos) {
                        uniqueMaps.set(key, { ...existing, hierarchyPos: m.hierarchyPos, parentId: m.parentId });
                    }
                }
            });
            if (hasDuplicates) {
                manpowers = Array.from(uniqueMaps.values());
                localStorage.setItem('manpowers', JSON.stringify(manpowers));
            }

            const container = document.getElementById('manpower-container');
            const summaryContainer = document.getElementById('manpower-summary');
            if (!container) return;

            const filtered = manpowers.filter(m =>
                (m.name && m.name.toLowerCase().includes(currentManpowerSearch.toLowerCase())) ||
                (m.nickname && m.nickname.toLowerCase().includes(currentManpowerSearch.toLowerCase())) ||
                (m.project && m.project.toLowerCase().includes(currentManpowerSearch.toLowerCase())) ||
                (m.org && m.org.toLowerCase().includes(currentManpowerSearch.toLowerCase()))
            );

            // Calculate counts based on Custom Groups (Hierarchy) instead of literal 'org' field
            const groupTotals = {};

            // Helper to get the top-level root group, either by parentId or by matching org name
            const getResolvedRootInfo = (member) => {
                // 1. Explicit hierarchy link exists
                if (member.parentId) {
                    const findRootId = (id) => {
                        const g = customGroups.find(x => x.id === id);
                        if (!g) return null;
                        if (!g.parentId || g.parentId === 'root') return { id: g.id, name: g.name };
                        return findRootId(g.parentId);
                    };
                    const rootInfo = findRootId(member.parentId);
                    if (rootInfo) return rootInfo;
                }

                // 2. Fallback: match by 'org' text field if mindmap connection is missing
                if (member.org) {
                    const matchedGroup = customGroups.find(g => g.name === member.org);
                    if (matchedGroup) {
                        // find the root of this matched group
                        const findRootCandidate = (g) => {
                            if (!g.parentId || g.parentId === 'root') return { id: g.id, name: g.name };
                            const p = customGroups.find(x => x.id === g.parentId);
                            return p ? findRootCandidate(p) : { id: g.id, name: g.name };
                        };
                        return findRootCandidate(matchedGroup);
                    }
                }
                return null;
            };

            // Summary calculation
            const summaryGroups = customGroups.filter(g => !g.parentId || g.parentId === 'root');
            summaryGroups.forEach(g => {
                // Count all members resolved to this root
                groupTotals[g.name] = manpowers.filter(m => {
                    const root = getResolvedRootInfo(m);
                    return root && root.id === g.id;
                }).length;
            });

            if (summaryContainer) {
                const orgsToShow = summaryGroups
                    .map(g => ({ name: g.name, count: groupTotals[g.name] }))
                    .filter(g => g.count > 0)
                    .sort((a, b) => {
                        const whitelist = ['蹂몄궗', 'USG', 'BSG', 'ESI', 'ESM', 'CCE', 'GSS', 'Sales'];
                        const aIdx = whitelist.indexOf(a.name);
                        const bIdx = whitelist.indexOf(b.name);
                        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                        if (aIdx !== -1) return -1;
                        if (bIdx !== -1) return 1;
                        return a.name.localeCompare(b.name);
                    });

                const getColorSet = (index) => {
                    const palettes = [
                        { bg: '#e8f0fe', border: '#a8c7fa', text: '#0b57d0', label: '#0842a0', shadow: 'rgba(232, 240, 254, 0.8)' },
                        { bg: '#e6f4ea', border: '#a8dab5', text: '#137333', label: '#0d5c28', shadow: 'rgba(230, 244, 234, 0.8)' },
                        { bg: '#fce8e6', border: '#f28b82', text: '#c5221f', label: '#a50e0e', shadow: 'rgba(252, 232, 230, 0.8)' },
                        { bg: '#fef7e0', border: '#fde293', text: '#e37400', label: '#b05a00', shadow: 'rgba(254, 247, 224, 0.8)' },
                        { bg: '#f3e8fd', border: '#c58af9', text: '#7627bb', label: '#5a198e', shadow: 'rgba(243, 232, 253, 0.8)' },
                        { bg: '#e4f7fb', border: '#78d9ec', text: '#007b83', label: '#005b61', shadow: 'rgba(228, 247, 251, 0.8)' },
                        { bg: '#fce4ec', border: '#f48fb1', text: '#c2185b', label: '#9c1449', shadow: 'rgba(252, 228, 236, 0.8)' }
                    ];
                    return palettes[index % palettes.length];
                };

                summaryContainer.innerHTML = orgsToShow.map((org, index) => {
                    const c = getColorSet(index);
                    return `
                    <div class="summary-item" onclick="navigateToManpowerGroup('${org.name}')" 
                         style="--item-bg:${c.bg}; --item-border:${c.border}; --item-text:${c.text}; --item-label:${c.label}; --item-shadow:${c.shadow};">
                        <span class="summary-label">${org.name}</span>
                        <span class="summary-value">${org.count}</span>
                    </div>
                `;
                }).join('') || '<div style="color: var(--text-muted); font-size: 0.9rem;">議곗쭅?꾩뿉 洹몃９??癒쇱? ?앹꽦??二쇱꽭??</div>';
            }

            updateStats();

            if (currentManpowerUIMode === 'hierarchy') {
                renderManpowerHierarchy(filtered);
                return;
            }

            // Grouping logic based on view mode (List Mode)
            const grouped = {};

            if (currentManpowerViewMode === 'org') {
                const rootGroups = customGroups.filter(g => !g.parentId || g.parentId === 'root');
                rootGroups.forEach(g => { grouped[g.name] = []; });

                filtered.forEach(m => {
                    const root = getResolvedRootInfo(m);
                    const groupName = root ? root.name : '誘몄???/ 湲고?';
                    if (!grouped[groupName]) grouped[groupName] = [];
                    grouped[groupName].push(m);
                });
            } else {
                filtered.forEach(m => {
                    const key = m.project || '誘몃같??/ 湲고?';
                    if (!grouped[key]) grouped[key] = [];
                    grouped[key].push(m);
                });
            }

            let groupNames = Object.keys(grouped).sort((a, b) => {
                const whitelist = ['蹂몄궗', 'USG', 'BSG', 'ESI', 'ESM', 'CCE', 'GSS', 'Sales'];
                const aIdx = whitelist.indexOf(a);
                const bIdx = whitelist.indexOf(b);
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                if (aIdx !== -1) return -1;
                if (bIdx !== -1) return 1;
                return a.localeCompare(b);
            });

            // Remove previous hardcoded filtering logic that restricted visibility
            if (groupNames.length === 0) {
                container.innerHTML = '<div style="grid-column: span 3; text-align: center; padding: 4rem; color: var(--text-muted);">?깅줉???몃젰???녾굅??寃??寃곌낵媛 ?놁뒿?덈떎.</div>';
                return;
            }

            container.style.display = 'block';
            container.innerHTML = groupNames.map(groupName => {
                const sectionLabel = currentManpowerViewMode === 'org' ? 'ORGANIZATION' : 'PROJECT';
                const onDropHandler = currentManpowerViewMode === 'org' ?
                    `handleDropOnOrg(event, '${groupName.replace(/'/g, "\\'")}')` :
                    `handleDropOnProject(event, '${groupName.replace(/'/g, "\\'")}')`;

                // 寃?됱뼱媛 ?덉쑝硫?紐⑤몢 ?쇱튂怨? ?놁쑝硫?留덉?留됱쑝濡??뺤옣??洹몃９留??쇱묠
                let isCollapsed = '';
                if (currentManpowerSearch === '') {
                    isCollapsed = (groupName === lastExpandedManpowerGroup) ? '' : 'collapsed';
                }
                const members = grouped[groupName] || [];

                // 誘몄???誘몃같??洹몃９? ?몄썝???놁쓣 寃쎌슦 ?몄텧?섏? ?딆쓬
                if ((groupName.includes('誘몄???) || groupName.includes('誘몃같??)) && members.length === 0) return '';

                // ?먮룞 吏곴툒 ?뺣젹 濡쒖쭅 ?쒓굅 (?섎룞 ?쒕옒洹??뺣젹 ?쒖꽌瑜??좎??섍린 ?꾪븿)
                // ?꾩슂 ????遺遺꾩쓣 二쇱꽍 ?댁젣?섍굅??媛?섎떎?쒖쑝濡?珥덇린 ?뺣젹???섑뻾?????덉뒿?덈떎.
                // members.sort((a, b) => getRankValue(a.position) - getRankValue(b.position) || (a.name || '').localeCompare(b.name || ''));

                return `
                    <div class="project-org-section ${isCollapsed}" data-group-name="${groupName.replace(/"/g, '&quot;')}" 
                         ondragover="handleDragOver(event)" 
                         ondragenter="this.classList.add('drag-over')"
                         ondragleave="this.classList.remove('drag-over')"
                         ondrop="${onDropHandler}">
                        
                        <div class="project-org-header" onclick="toggleManpowerSection(this)">
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${sectionLabel}</span>
                                <h2 style="font-size: 1.5rem; font-weight: 800; color: #1d1d1f; margin: 0; display: flex; align-items: center; gap: 12px; letter-spacing: -0.3px;">
                                    ${groupName}
                                    <span style="font-size: 0.85rem; background: #f0f0f5; color: #86868b; padding: 4px 12px; border-radius: 20px; font-weight: 600;">${members.length}紐?/span>
                                </h2>
                            </div>
                            <div class="section-toggle-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>

                        <div class="manpower-member-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
                            ${members.map(m => `
                                <div class="task-card-apple" 
                                     draggable="true"
                                     ondragstart="handleDragStart(event, '${m.id}')"
                                     ondragover="handleDragOver(event)"
                                     ondragenter="this.classList.add('drag-over')"
                                     ondragleave="this.classList.remove('drag-over')"
                                     ondragend="handleDragEnd(event)"
                                     ondrop="handleDropOnCard(event, '${m.id}')"
                                     style="height: auto; min-height: 150px; padding: 1.25rem; transition: all 0.2s; cursor: grab; background-color: ${m.status === '?댁궗' ? '#f2f2f7' : '#f0fdf4'}; border: 1px solid ${m.status === '?댁궗' ? '#e5e5ea' : '#dcfce7'}; opacity: ${m.status === '?댁궗' ? '0.7' : '1'};">
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                                        <div>
                                            <div style="font-size: 0.75rem; font-weight: 800; color: #5e5ce6; margin-bottom: 2px;">${m.jobGroup || '吏곴뎔誘몄젙'}</div>
                                            <div style="font-size: 1.3rem; font-weight: 800;">${m.name} <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">${m.position || ''}</span></div>
                                            <div style="font-size: 0.7rem; color: #86868b; margin-top: 4px;">
                                                ${m.org ? `<span style="background: #f0f0f5; padding: 1px 4px; border-radius: 3px; margin-right: 4px;">${m.org}</span>` : ''}
                                                ${m.project ? `<span style="background: #eef2ff; padding: 1px 4px; border-radius: 3px;">${m.project}</span>` : ''}
                                            </div>
                                        </div>
                                        ${m.status === '?댁궗'
                        ? '<div class="card-badge" style="background: #fff0f0; color: #ff3b30; font-size: 0.65rem;">?댁궗</div>'
                        : '<div class="card-badge done" style="background: #f0fdf4; color: #15803d; font-size: 0.65rem;">?ъ쭅</div>'}
                                    </div>
                                    <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
                                        <i class="far fa-user-circle"></i> @${m.nickname}
                                    </div>
                                    <div class="card-footer" style="padding-top: 1rem; border-top: 1px solid #f2f2f7; display: flex; align-items: center; justify-content: flex-end; gap: 10px;">
                                        <div class="card-actions" style="display: flex; gap: 6px;">
                                            <button class="btn-mini" style="margin:0; padding: 4px 12px;" onclick="openManpowerModal('${m.id}')">?섏젙</button>
                                            <button class="btn-mini delete" style="margin:0; padding: 4px 12px;" onclick="deleteManpower('${m.id}')">??젣</button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }

        let selectedHierarchyNodes = new Set();
        let hierarchySelectionState = { active: false, startX: 0, startY: 0 };
        function clearHierarchySelection() {
            selectedHierarchyNodes.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('selected-node');
            });
            selectedHierarchyNodes.clear();
        }

        let hierarchyDragState = { active: false, targetId: null, startX: 0, startY: 0, initialNodes: [] };

        function renderManpowerHierarchy(items) {
            const treeRoot = document.getElementById('hierarchy-tree-root');
            const svgLayer = document.getElementById('hierarchy-svg');
            if (!treeRoot || !svgLayer) return;

            treeRoot.innerHTML = '';
            svgLayer.innerHTML = '';

            const CANVAS_CENTER = 1500;
            const nodes = [];

            // 而ㅼ뒪? 洹몃９ ?몃뱶 (?붾㈃ ?곸뿭??踰쀬뼱??寃쎌슦 蹂댁젙)
            customGroups.forEach(g => {
                const safeX = Math.max(50, Math.min(g.x || CANVAS_CENTER, 2800));
                const safeY = Math.max(50, Math.min(g.y || 200, 1800));
                g.x = safeX;
                g.y = safeY;
                nodes.push({ id: g.id, type: 'org', name: g.name, x: safeX, y: safeY, parentId: g.parentId });
            });

            // org ?꾨뱶媛 ?덉?留?customGroups??留ㅼ묶 洹몃９???놁쑝硫?媛??洹몃９ ?몃뱶 ?먮룞 ?앹꽦
            const missingOrgs = new Set();
            manpowers.forEach(m => {
                if (m.org) {
                    const orgKey = m.org.trim().toLowerCase();
                    const exists = customGroups.some(g => g.name.trim().toLowerCase() === orgKey);
                    if (!exists) missingOrgs.add(m.org.trim());
                }
            });

            // 湲곗〈 洹몃９??以?媛???꾨옒履?Y 醫뚰몴 怨꾩궛
            let maxY = 150;
            if (customGroups.length > 0) {
                maxY = Math.max(...customGroups.map(g => g.y || 0)) + 150;
            }
            if (maxY > 1800) maxY = 1800; // 理쒕? ?쒓퀎 吏??

            let autoGroupX = 100;
            missingOrgs.forEach(orgName => {
                const virtualId = `__auto_${orgName}`;
                if (!nodes.some(n => n.id === virtualId)) {
                    nodes.push({ id: virtualId, type: 'org', name: `${orgName} ??, x: autoGroupX, y: maxY, parentId: null, isVirtual: true });
                    autoGroupX += 240;
                    if (autoGroupX > 2800) {
                        autoGroupX = 100;
                        maxY += 150;
                    }
                }
            });

            // 硫ㅻ쾭 ?몃뱶 (珥덇린 醫뚰몴 ?놁쓣 ??洹몃━???뺥깭 諛곗튂)
            let unpositionedCount = 0;
            items.forEach((m, mIdx) => {
                let effectiveParentId = m.parentId;

                // 1李??대갚: org ?꾨뱶濡?customGroups 留ㅼ묶
                if (!effectiveParentId && m.org) {
                    const orgKey = m.org.trim().toLowerCase();
                    const matchedGroup = customGroups.find(g => g.name.trim().toLowerCase() === orgKey);
                    if (matchedGroup) effectiveParentId = matchedGroup.id;
                    else {
                        const virtualId = `__auto_${m.org.trim()}`;
                        if (nodes.some(n => n.id === virtualId)) effectiveParentId = virtualId;
                    }
                }

                // 2李??대갚: parentId媛 ?좏슚?섏? ?딆쑝硫?org 湲곗??쇰줈 ?泥?
                if (effectiveParentId) {
                    const isValidId = customGroups.some(g => String(g.id) === String(effectiveParentId))
                        || nodes.some(n => String(n.id) === String(effectiveParentId));
                    if (!isValidId && m.org) {
                        const orgKey = m.org.trim().toLowerCase();
                        const matchedGroup = customGroups.find(g => g.name.trim().toLowerCase() === orgKey);
                        if (matchedGroup) effectiveParentId = matchedGroup.id;
                        else {
                            const virtualId = `__auto_${m.org.trim()}`;
                            if (nodes.some(n => n.id === virtualId)) effectiveParentId = virtualId;
                        }
                    }
                }

                const isRoot = !effectiveParentId;
                let pos = m.hierarchyPos;
                if (!pos) {
                    pos = { x: CANVAS_CENTER - 300 + (unpositionedCount % 4) * 180, y: 100 + Math.floor(unpositionedCount / 4) * 150 };
                    unpositionedCount++;
                }
                nodes.push({ id: m.id, type: 'member', data: m, x: pos.x, y: pos.y, parentId: effectiveParentId, isRoot: isRoot });
            });

            // 3. ?뚮뜑留?
            treeRoot.innerHTML = nodes.map(node => {
                const isSelected = selectedHierarchyNodes && selectedHierarchyNodes.has(`node-${node.id}`) ? 'selected-node' : '';
                if (node.type === 'member') {
                    const m = node.data;
                    const isRoot = node.isRoot;
                    return `
                        <div class="tree-node-card ${isRoot ? 'root-node' : ''} ${isSelected}" 
                             id="node-${node.id}"
                             onmousedown="startHierarchyDrag(event, '${node.id}')"
                             ondblclick="if(!event.defaultPrevented) openManpowerModal('${m.id}')"
                             oncontextmenu="showNodeContextMenu(event, '${node.id}', false)"
                             style="left: ${node.x}px; top: ${node.y}px;">
                            <div class="node-rank-label">${m.position || '?몄썝'}</div>
                            <div class="node-name">${m.name}</div>
                            <div class="node-subtext">@${m.nickname}</div>
                        </div>
                    `;
                } else {
                    return `
                        <div class="org-node-label ${isSelected}" id="node-${node.id}" 
                             onmousedown="startHierarchyDrag(event, '${node.id}', true)"
                             oncontextmenu="showNodeContextMenu(event, '${node.id}', true)"
                             title="${node.name}"
                             style="position: absolute; left: ${node.x}px; top: ${node.y}px; z-index: 2; height: auto; min-width: 140px; text-align: center; display: flex; flex-direction: column;">
                            <span>?룫 ${node.name}</span>
                        </div>
                    `;
                }
            }).join('');

            drawHierarchyLines(nodes, svgLayer);
        }

        function navigateToManpowerGroup(groupName) {
            if (currentManpowerUIMode === 'list') {
                // ?곷떒 吏묎퀎??議곗쭅 湲곗??대?濡? 由ъ뒪??酉곌? ?꾨줈?앺듃蹂꾩씤 寃쎌슦 議곗쭅蹂꾨줈 媛뺤젣 ?꾪솚
                if (currentManpowerViewMode !== 'org') {
                    setManpowerViewMode('org');
                }

                setTimeout(() => {
                    const target = document.querySelector(`.project-org-section[data-group-name="${groupName}"]`);

                    if (target) {
                        // ?ㅻⅨ 紐⑤뱺 ?뱀뀡 ?リ린 諛??댁쟾 ?쒖꽦 ?곹깭 ?쒓굅
                        document.querySelectorAll('.project-org-section').forEach(sec => {
                            sec.classList.add('collapsed');
                            sec.classList.remove('active-highlight');
                        });

                        // ?寃??뱀뀡 ?쒖꽦??諛??쇱묠
                        target.classList.remove('collapsed');
                        target.classList.add('active-highlight');
                        lastExpandedManpowerGroup = groupName;

                        // ?곷떒 諛??믪씠瑜?怨좊젮???뺣? ?ㅽ겕濡??대룞 (.main-content 湲곗?)
                        const mainContent = document.querySelector('.main-content');
                        if (mainContent) {
                            const headerOffset = 150;
                            const targetPosition = target.offsetTop - headerOffset;

                            mainContent.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }

                        // ?쒖꽦???ㅽ????곸슜 (媛뺤“)
                        target.classList.add('active-highlight');
                    } else {
                        showToast(`?꾩옱 寃???꾪꽣 ?곹깭?먯꽌 ${groupName} 洹몃９??李얠쓣 ???놁뒿?덈떎.`);
                    }
                }, 200);
            } else if (currentManpowerUIMode === 'hierarchy') {
                // Find org node label in Mindmap
                const nodes = document.querySelectorAll('.org-node-label');
                let target = null;
                nodes.forEach(node => {
                    if (node.innerText.includes(groupName)) target = node;
                });

                if (target) {
                    const container = document.getElementById('manpower-hierarchy-view');
                    const rect = target.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    // 以묒븰 ?뺣젹 ?대룞
                    container.scrollTo({
                        left: container.scrollLeft + (rect.left - containerRect.left) - (containerRect.width / 2) + (rect.width / 2),
                        top: container.scrollTop + (rect.top - containerRect.top) - (containerRect.height / 2) + (rect.height / 2),
                        behavior: 'smooth'
                    });

                    // 媛뺤“ ?쒖떆
                    target.classList.add('selected-node');
                    setTimeout(() => target.classList.remove('selected-node'), 3000);
                } else {
                    showToast(`${groupName} 洹몃９ ?몃뱶瑜?議곗쭅?꾩뿉??李얠쓣 ???놁뒿?덈떎.`);
                }
            }
        }

        function showToast(message, type = 'success') {
            let container = document.getElementById('toast-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `toast-item ${type}`;
            toast.innerText = message;

            container.appendChild(toast);

            // Trigger animation
            setTimeout(() => toast.classList.add('show'), 10);

            // Auto-remove
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }

        function drawHierarchyLines(nodes, svg) {
            svg.innerHTML = '';

            // setTimeout?쇰줈 DOM ?덉씠?꾩썐???꾩쟾??怨꾩궛??????洹몃━湲?
            setTimeout(() => {
                nodes.forEach(node => {
                    if (!node.parentId) return;

                    // 1) ID ?뺥솗 ?쇱튂 (???蹂???ы븿)
                    let parentNode = nodes.find(n => String(n.id) === String(node.parentId));

                    // 2) org 洹몃９紐???뚮Ц??臾닿? ?대갚 留ㅼ묶
                    if (!parentNode) {
                        const pid = String(node.parentId).trim().toLowerCase();
                        parentNode = nodes.find(n => n.type === 'org' && n.name.trim().toLowerCase() === pid);
                    }
                    if (!parentNode) return;

                    const childEl = document.getElementById(`node-${node.id}`);
                    const parentEl = document.getElementById(`node-${parentNode.id}`);
                    if (!childEl || !parentEl) return;

                    // offsetWidth/offsetHeight ?쎄린 (0?대㈃ 湲곕낯媛??ъ슜)
                    const pW = (parentEl.offsetWidth > 0 ? parentEl.offsetWidth : (parentNode.type === 'member' ? 160 : 140));
                    const pH = (parentEl.offsetHeight > 0 ? parentEl.offsetHeight : (parentNode.type === 'member' ? 80 : 40));
                    const cW = (childEl.offsetWidth > 0 ? childEl.offsetWidth : (node.type === 'member' ? 160 : 140));

                    const startX = parentNode.x + pW / 2;
                    const startY = parentNode.y + pH;
                    const endX = node.x + cW / 2;
                    const endY = node.y;

                    const midY = (startY + endY) / 2;
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.setAttribute('d', `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`);
                    path.setAttribute('stroke', 'rgba(0, 113, 227, 0.45)');
                    path.setAttribute('stroke-width', '2');
                    path.setAttribute('fill', 'none');
                    svg.appendChild(path);
                });
            }, 50);
        }

        // ??? ?몃뱶 而⑦뀓?ㅽ듃 硫붾돱 ?????????????????????????????????????????????
        let _ctxNodeId = null;
        let _ctxIsOrg = false;

        function showNodeContextMenu(e, nodeId, isOrg) {
            e.preventDefault();
            e.stopPropagation();
            _ctxNodeId = nodeId;
            _ctxIsOrg = isOrg;

            // ?꾩옱 ?곌껐 ?곹깭 ?뺤씤
            let currentParentId = null;
            if (isOrg) {
                const g = customGroups.find(x => String(x.id) === String(nodeId));
                if (g) currentParentId = g.parentId;
            } else {
                const m = manpowers.find(x => String(x.id) === String(nodeId));
                if (m) currentParentId = m.parentId;
            }

            const hasParent = !!currentParentId;
            const label = isOrg ? '洹몃９' : '?몃뱶';

            // ?곌껐 媛?ν븳 洹몃９ 紐⑸줉
            const connectable = isOrg
                ? customGroups.filter(g => String(g.id) !== String(nodeId) && String(g.id) !== String(currentParentId))
                : customGroups;

            const connectItems = connectable.map(g =>
                `<div class="ctx-menu-item" onclick="connectNodeToGroup('${nodeId}', '${g.id}', ${isOrg}); closeNodeContextMenu();">
                    ?뵕 ${g.name}???곌껐
                 </div>`
            ).join('');

            let menu = document.getElementById('node-context-menu');
            if (!menu) {
                menu = document.createElement('div');
                menu.id = 'node-context-menu';
                document.body.appendChild(menu);
            }

            menu.innerHTML = `
                ${hasParent ? `<div class="ctx-menu-item danger" onclick="disconnectNode('${nodeId}', ${isOrg}); closeNodeContextMenu();">?귨툘 ${label} 洹몃９?먯꽌 遺꾨━</div><div class="ctx-menu-divider"></div>` : ''}
                ${connectItems || `<div class="ctx-menu-item" style="color:#aaa; cursor:default;">?곌껐 媛?ν븳 洹몃９ ?놁쓬</div>`}
            `;

            menu.style.display = 'block';
            menu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
            menu.style.top = Math.min(e.clientY, window.innerHeight - menu.offsetHeight - 10) + 'px';

            setTimeout(() => {
                document.addEventListener('click', closeNodeContextMenu, { once: true });
            }, 10);
        }

        function closeNodeContextMenu() {
            const menu = document.getElementById('node-context-menu');
            if (menu) menu.style.display = 'none';
        }

        function disconnectNode(nodeId, isOrg) {
            if (isOrg) {
                const g = customGroups.find(x => String(x.id) === String(nodeId));
                if (g) { g.parentId = null; }
                saveCustomGroups().catch(console.error);
            } else {
                const m = manpowers.find(x => String(x.id) === String(nodeId));
                if (m) { m.parentId = null; }
                saveManpowerToPersistence().catch(console.error);
            }
            showToast('洹몃９?먯꽌 遺꾨━?섏뿀?듬땲??');
            renderManpower();
        }

        function connectNodeToGroup(nodeId, groupId, isOrg) {
            if (isOrg) {
                const g = customGroups.find(x => String(x.id) === String(nodeId));
                if (g) { g.parentId = groupId; }
                saveCustomGroups().catch(console.error);
            } else {
                const m = manpowers.find(x => String(x.id) === String(nodeId));
                if (m) { m.parentId = groupId; }
                saveManpowerToPersistence().catch(console.error);
            }
            const targetGroup = customGroups.find(g => String(g.id) === String(groupId));
            showToast(`${targetGroup ? targetGroup.name : ''} 洹몃９???곌껐?섏뿀?듬땲??`);
            renderManpower();
        }
        // ????????????????????????????????????????????????????????????????????

        let currentHierarchyScale = 1.0;

        function changeHierarchyZoom(delta) {
            currentHierarchyScale = Math.min(Math.max(0.2, currentHierarchyScale + delta), 2.0);
            updateHierarchyScaleUI();
        }

        function resetHierarchyZoom() {
            currentHierarchyScale = 1.0;
            updateHierarchyScaleUI();
        }

        function updateHierarchyScaleUI() {
            const wrapper = document.getElementById('hierarchy-zoom-wrapper');
            const label = document.getElementById('hierarchy-zoom-label');
            const floatingLabel = document.getElementById('hierarchy-zoom-label-floating');
            const displayZoom = `${Math.round(currentHierarchyScale * 100)}%`;

            if (wrapper) wrapper.style.transform = `scale(${currentHierarchyScale})`;
            if (label) label.innerText = displayZoom;
            if (floatingLabel) floatingLabel.innerText = displayZoom;
        }

        function fitHierarchyToScreen() {
            const container = document.getElementById('manpower-hierarchy-view');
            const wrapper = document.getElementById('hierarchy-zoom-wrapper');
            const treeRoot = document.getElementById('hierarchy-tree-root');
            if (!container || !treeRoot) return;

            // ?꾩옱 諛곗튂???몃뱶?ㅼ쓽 Bounding Box 怨꾩궛
            const nodes = Array.from(treeRoot.children);
            if (nodes.length === 0) return;

            let minX = 3000, minY = 2000, maxX = 0, maxY = 0;
            nodes.forEach(node => {
                const x = parseInt(node.style.left);
                const y = parseInt(node.style.top);
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x + 160); // ?몃뱶 ?덈퉬 蹂댁젙
                maxY = Math.max(maxY, y + 100); // ?몃뱶 ?믪씠 蹂댁젙
            });

            const contentWidth = (maxX - minX) + 200;
            const contentHeight = (maxY - minY) + 200;
            const containerWidth = container.clientWidth - 40;
            const containerHeight = container.clientHeight - 40;

            const scaleX = containerWidth / contentWidth;
            const scaleY = containerHeight / contentHeight;
            const targetScale = Math.min(Math.max(0.1, Math.min(scaleX, scaleY)), 1.2); // 理쒕? 1.2諛?

            currentHierarchyScale = targetScale;
            updateHierarchyScaleUI();

            // 以묒븰 ?뺣젹???꾪븳 ?ㅽ겕濡??꾩튂 怨꾩궛
            container.scrollLeft = (minX - 100) * currentHierarchyScale;
            container.scrollTop = (minY - 50) * currentHierarchyScale;
        }

        function getDescendantNodeIds(parentId) {
            let results = [];
            // ?몄썝 ?몃뱶 留ㅼ묶
            manpowers.forEach(m => {
                const nodeElId = `node-${m.id}`;
                // 吏곸젒 parentId ?곌껐 ?먮뒗 議곗쭅紐??띿뒪??留ㅼ묶
                if (m.parentId === parentId) {
                    results.push(nodeElId);
                } else if (!m.parentId && m.org) {
                    const pg = customGroups.find(g => g.id === parentId);
                    if (pg && pg.name.trim().toLowerCase() === m.org.trim().toLowerCase()) {
                        results.push(nodeElId);
                    }
                }
            });
            // ?섏쐞 洹몃９ ?몃뱶 留ㅼ묶
            customGroups.forEach(g => {
                if (g.parentId === parentId) {
                    const gid = `node-${g.id}`;
                    results.push(gid);
                    results = results.concat(getDescendantNodeIds(g.id));
                }
            });
            return results;
        }

        function startHierarchyDrag(e, id, isOrg = false) {
            if (e.button !== 0) return;
            // e.preventDefault(); // dblclick ???꾩냽 ?대깽??諛⑺빐 諛⑹?瑜??꾪빐 ?쒓굅
            e.stopPropagation(); // 諛곌꼍 Panning??諛쒖깮?섏? ?딅룄濡??대깽???꾪뙆 李⑤떒

            const nodeElId = `node-${id}`;
            const targetNodes = new Set();
            targetNodes.add(nodeElId);

            // 洹몃９??寃쎌슦 ?섏쐞 紐⑤뱺 ?몃뱶(?臾쇰┝)瑜??④퍡 ?좏깮 泥섎━
            if (isOrg) {
                getDescendantNodeIds(id).forEach(cid => targetNodes.add(cid));
            }

            // ?좏깮 ?낅뜲?댄듃
            targetNodes.forEach(nid => {
                if (!selectedHierarchyNodes.has(nid)) {
                    if (!e.shiftKey && targetNodes.size === 1) clearHierarchySelection();
                    selectedHierarchyNodes.add(nid);
                    const el = document.getElementById(nid);
                    if (el) el.classList.add('selected-node');
                }
            });

            if (e.shiftKey && selectedHierarchyNodes.has(nodeElId) && targetNodes.size === 1) {
                // Shift ?대┃ ???⑥씪 ?몃뱶 ?좏깮 ?댁젣 諛?由ы꽩
                selectedHierarchyNodes.delete(nodeElId);
                const el = document.getElementById(nodeElId);
                if (el) el.classList.remove('selected-node');
                return;
            }

            hierarchyDragState = {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                moved: false, // ?ㅼ젣 ?쒕옒洹??щ? 泥댄겕
                initialNodes: [],
                rafId: null
            };

            selectedHierarchyNodes.forEach(selId => {
                const el = document.getElementById(selId);
                if (el) {
                    hierarchyDragState.initialNodes.push({
                        id: selId,
                        el: el,
                        initialX: parseInt(el.style.left) || 0,
                        initialY: parseInt(el.style.top) || 0,
                        isOrg: el.classList.contains('org-node-label')
                    });
                    el.classList.add('active-drag');
                }
            });

            const moveHandler = (me) => {
                if (!hierarchyDragState.active) return;

                if (hierarchyDragState.rafId) {
                    cancelAnimationFrame(hierarchyDragState.rafId);
                }

                hierarchyDragState.rafId = requestAnimationFrame(() => {
                    const dx = (me.clientX - hierarchyDragState.startX) / currentHierarchyScale;
                    const dy = (me.clientY - hierarchyDragState.startY) / currentHierarchyScale;

                    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                        hierarchyDragState.moved = true;
                    }

                    if (hierarchyDragState.moved) {
                        hierarchyDragState.initialNodes.forEach(item => {
                            item.el.style.left = `${item.initialX + dx}px`;
                            item.el.style.top = `${item.initialY + dy}px`;
                        });
                    }
                });
            };

            const upHandler = async (me) => {
                if (hierarchyDragState.rafId) {
                    cancelAnimationFrame(hierarchyDragState.rafId);
                }
                hierarchyDragState.active = false;

                hierarchyDragState.initialNodes.forEach(item => {
                    item.el.classList.remove('active-drag');
                    item.el.style.display = 'none';
                });

                window.removeEventListener('mousemove', moveHandler);
                window.removeEventListener('mouseup', upHandler);

                const dropTarget = document.elementFromPoint(me.clientX, me.clientY);

                hierarchyDragState.initialNodes.forEach(item => {
                    item.el.style.display = '';
                });

                let targetParentId = null;
                const targetNode = dropTarget ? dropTarget.closest('.tree-node-card, .org-node-label') : null;

                if (targetNode && !selectedHierarchyNodes.has(targetNode.id)) {
                    targetParentId = targetNode.id.replace('node-', '');
                }

                for (const item of hierarchyDragState.initialNodes) {
                    const rawId = item.id.replace('node-', '');
                    const finalX = parseInt(item.el.style.left);
                    const finalY = parseInt(item.el.style.top);

                    if (item.isOrg) {
                        const groupIdx = customGroups.findIndex(g => g.id === rawId);
                        if (groupIdx !== -1) {
                            customGroups[groupIdx].x = finalX;
                            customGroups[groupIdx].y = finalY;
                            if (targetParentId !== null) customGroups[groupIdx].parentId = targetParentId;

                            const isParentDragged = hierarchyDragState.initialNodes.some(n => n.id.replace('node-', '') === customGroups[groupIdx].parentId);
                            if (me.shiftKey && !isParentDragged) customGroups[groupIdx].parentId = null;
                        }
                    } else {
                        const mIdx = manpowers.findIndex(m => m.id === rawId);
                        if (mIdx !== -1) {
                            manpowers[mIdx].hierarchyPos = { x: finalX, y: finalY };
                            if (targetParentId !== null) manpowers[mIdx].parentId = targetParentId;

                            const isParentDragged = hierarchyDragState.initialNodes.some(n => n.id.replace('node-', '') === manpowers[mIdx].parentId);
                            if (me.shiftKey && !isParentDragged) manpowers[mIdx].parentId = null;
                        }
                    }
                }

                saveCustomGroups().catch(console.error);
                saveManpowerToPersistence().catch(console.error);

                // ?ㅼ젣 ?대룞???덉뿀???뚮쭔 ?뚮뜑留?(?щ젋?붾쭅 ??DOM???뚭눼?섏뼱 dblclick???뚮㈇?섎뒗 臾몄젣 蹂댁셿)
                if (hierarchyDragState.moved) {
                    renderManpower();
                }
            };

            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);
        }

        function updateLinesOnDrag() {
            // Disabled: Querying DOM and parsing styles during mousemove causes heavy layout thrashing.
            // SVG lines will correctly snap to position upon mouseup via renderManpower().
        }

        let hierarchyPanState = { active: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 };

        function startHierarchySelection(e) {
            const container = document.getElementById('manpower-hierarchy-view');
            const wrapper = document.getElementById('hierarchy-zoom-wrapper');
            const rect = container.getBoundingClientRect();

            const getPos = (clientX, clientY) => {
                return {
                    x: (clientX - rect.left + container.scrollLeft) / currentHierarchyScale,
                    y: (clientY - rect.top + container.scrollTop) / currentHierarchyScale
                };
            };

            const startPos = getPos(e.clientX, e.clientY);
            hierarchySelectionState = {
                active: true,
                startX: startPos.x,
                startY: startPos.y
            };

            let box = document.getElementById('hierarchy-selection-box');
            if (!box) {
                box = document.createElement('div');
                box.id = 'hierarchy-selection-box';
                box.className = 'selection-box';
                wrapper.appendChild(box);
            }
            box.style.display = 'block';
            box.style.left = startPos.x + 'px';
            box.style.top = startPos.y + 'px';
            box.style.width = '0px';
            box.style.height = '0px';

            let rafId = null;
            const moveHandler = (me) => {
                if (!hierarchySelectionState.active) return;

                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    const currentPos = getPos(me.clientX, me.clientY);

                    const minX = Math.min(hierarchySelectionState.startX, currentPos.x);
                    const minY = Math.min(hierarchySelectionState.startY, currentPos.y);
                    const maxX = Math.max(hierarchySelectionState.startX, currentPos.x);
                    const maxY = Math.max(hierarchySelectionState.startY, currentPos.y);

                    box.style.left = minX + 'px';
                    box.style.top = minY + 'px';
                    box.style.width = (maxX - minX) + 'px';
                    box.style.height = (maxY - minY) + 'px';
                });
            };

            const upHandler = (me) => {
                hierarchySelectionState.active = false;
                box.style.display = 'none';
                window.removeEventListener('mousemove', moveHandler);
                window.removeEventListener('mouseup', upHandler);

                const currentPos = getPos(me.clientX, me.clientY);
                const minX = Math.min(hierarchySelectionState.startX, currentPos.x);
                const minY = Math.min(hierarchySelectionState.startY, currentPos.y);
                const maxX = Math.max(hierarchySelectionState.startX, currentPos.x);
                const maxY = Math.max(hierarchySelectionState.startY, currentPos.y);

                if (!me.shiftKey) clearHierarchySelection();

                const nodes = document.querySelectorAll('#hierarchy-tree-root > div');
                nodes.forEach(node => {
                    const nx = parseInt(node.style.left);
                    const ny = parseInt(node.style.top);
                    const nw = node.classList.contains('tree-node-card') ? 160 : 140;
                    const nh = node.classList.contains('tree-node-card') ? 80 : 40;

                    const intersect = !(
                        nx > maxX ||
                        nx + nw < minX ||
                        ny > maxY ||
                        ny + nh < minY
                    );

                    if (intersect) {
                        selectedHierarchyNodes.add(node.id);
                        node.classList.add('selected-node');
                    }
                });
            };

            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);
        }

        function startHierarchyPan(e) {
            if (e.target.closest('.tree-node-card') || e.target.closest('.org-node-label') || e.target.closest('.hierarchy-controls')) return;

            if (e.button === 0) {
                if (e.shiftKey) {
                    startHierarchySelection(e);
                    return;
                } else {
                    clearHierarchySelection();
                }
            } else if (e.button !== 1 && e.button !== 2) {
                return;
            }

            const container = document.getElementById('manpower-hierarchy-view');
            hierarchyPanState = {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                scrollLeft: container.scrollLeft,
                scrollTop: container.scrollTop
            };

            let panRafId = null;
            const panMoveHandler = (me) => {
                if (!hierarchyPanState.active) return;

                if (panRafId) cancelAnimationFrame(panRafId);
                panRafId = requestAnimationFrame(() => {
                    const dx = me.clientX - hierarchyPanState.startX;
                    const dy = me.clientY - hierarchyPanState.startY;
                    container.scrollLeft = hierarchyPanState.scrollLeft - dx;
                    container.scrollTop = hierarchyPanState.scrollTop - dy;
                });
            };

            const panUpHandler = () => {
                hierarchyPanState.active = false;
                window.removeEventListener('mousemove', panMoveHandler);
                window.removeEventListener('mouseup', panUpHandler);
            };

            window.addEventListener('mousemove', panMoveHandler);
            window.addEventListener('mouseup', panUpHandler);
        }

        async function resetHierarchyPositions() {
            if (!confirm('紐⑤뱺 ?꾩튂 ?뺣낫? 洹몃９ 怨꾩링 ?뺣낫瑜?珥덇린?뷀븯?쒓쿋?듬땲源? (而ㅼ뒪? 洹몃９ ??젣??')) return;
            customGroups = [];
            manpowers.forEach(m => {
                delete m.hierarchyPos;
                delete m.parentId;
            });
            saveCustomGroups().catch(console.error);
            saveManpowerToPersistence().catch(console.error);
            renderManpowerHierarchy(manpowers);
        }

        async function saveManpowerPosition(id, x, y) {
            const idx = manpowers.findIndex(m => m.id === id);
            if (idx === -1) return;

            manpowers[idx].hierarchyPos = { x, y };
            saveManpowerToPersistence().catch(console.error);
        }

        async function saveCustomGroups() {
            localStorage.setItem('manpowerGroups', JSON.stringify(customGroups));
            if (ghConfig.token && ghConfig.autoSync) {
                await syncWithGitHub('upload', 'task/manpowerGroups.json', customGroups);
            }
        }

        async function addCustomGroup() {
            const name = prompt('??洹몃９ ?대쫫???낅젰?섏꽭??(?? ?꾨줎?몄뿏???뚰듃):');
            if (!name || name.trim() === '') return;

            const container = document.getElementById('manpower-hierarchy-view');
            const x = (container.scrollLeft + container.clientWidth / 2) / currentHierarchyScale;
            const y = (container.scrollTop + container.clientHeight / 2) / currentHierarchyScale;

            customGroups.push({
                id: 'group-' + Date.now(),
                name: name.trim(),
                x: x - 70,
                y: y - 20,
                parentId: null
            });
            saveCustomGroups().catch(console.error);
            renderManpower();
        }

        async function editCustomGroup(id) {
            console.log('editCustomGroup triggered for:', id);
            const group = customGroups.find(g => g.id === id);
            if (!group) {
                console.error('Group not found for id:', id);
                return;
            }

            // ?섏쐞 ?몃뱶 泥댄겕 (?몄썝 ?먮뒗 ?섏쐞 洹몃９)
            const childMembers = manpowers.filter(m => m.parentId === id);
            const childGroups = customGroups.filter(g => g.parentId === id);
            const hasChildren = childMembers.length > 0 || childGroups.length > 0;

            let promptMsg = `[${group.name}] 洹몃９?????대쫫???낅젰?섏꽭??\n--------------------------------------`;
            if (!hasChildren) {
                promptMsg += `\n(??젣?섏떆?ㅻ㈃ '??젣'瑜??낅젰?섏꽭??`;
            } else {
                promptMsg += `\n(?섏쐞 ?몃뱶媛 ${childMembers.length + childGroups.length}媛??덉뼱 ??젣媛 遺덇??ν빀?덈떎)`;
            }

            const action = prompt(promptMsg, group.name);
            if (action === null) return;

            const trimmedAction = action.trim();
            if (trimmedAction === '??젣') {
                if (hasChildren) {
                    showToast("?섏쐞 ?몃뱶媛 ?덈뒗 洹몃９? ??젣?????놁뒿?덈떎. ?곌껐??癒쇱? ?댁젣??二쇱꽭??", "error");
                    return;
                }

                customGroups = customGroups.filter(g => g.id !== id);
                saveCustomGroups().catch(console.error);
                showToast(`'${group.name}' 洹몃９????젣?섏뿀?듬땲??`);
            } else if (trimmedAction !== '') {
                group.name = trimmedAction;
                saveCustomGroups().catch(console.error);
                showToast("洹몃９ ?대쫫??蹂寃쎈릺?덉뒿?덈떎.");
            }
            renderManpower();
        }

        function syncGroupsFromManpower() {
            let changed = false;
            const existingGroupNames = new Set(customGroups.map(g => g.name.trim().toLowerCase()));
            // ?몄썝 紐⑸줉??議댁옱?섎뒗 怨좎쑀???곸쐞 議곗쭅紐?異붿텧
            const orgs = [...new Set(manpowers.map(m => (m.org || '').trim()))].filter(o => o !== '');

            orgs.forEach((orgName, idx) => {
                if (!existingGroupNames.has(orgName.toLowerCase())) {
                    const gId = 'group-' + Date.now() + '-' + idx;
                    // ??議곗쭅 諛쒓껄 ??以묒븰 遺洹쇱뿉 湲곕낯 ?앹꽦
                    customGroups.push({
                        id: gId,
                        name: orgName,
                        x: 1500 + (Math.random() * 400 - 200),
                        y: 300 + (Math.random() * 200),
                        parentId: null
                    });
                    changed = true;
                }
            });

            if (changed) {
                saveCustomGroups().catch(console.error);
                showToast("?덈줈??議곗쭅 洹몃９???숆린?붾릺?덉뒿?덈떎.");
            }
        }

        async function autoGenerateGroupsByOrg() {
            if (!confirm("湲곗〈 留덉씤?쒕㏊ 諛곗튂媛 珥덇린?붾릺怨??깅줉??'議곗쭅(org)' 湲곗??쇰줈 ?먮룞 ?앹꽦?⑸땲?? 吏꾪뻾?좉퉴??")) return;

            customGroups = [];
            manpowers.forEach(m => { delete m.hierarchyPos; m.parentId = null; });

            const orgs = [...new Set(manpowers.map(m => m.org || '誘몄???))].filter(o => o);
            orgs.forEach((orgName, idx) => {
                const gId = 'group-' + Date.now() + '-' + idx;
                customGroups.push({
                    id: gId,
                    name: orgName,
                    x: 1500 + (idx - orgs.length / 2) * 350,
                    y: 200,
                    parentId: null
                });

                manpowers.forEach(m => {
                    if ((m.org || '誘몄???) === orgName) {
                        m.parentId = gId;
                        m.hierarchyPos = {
                            x: 1500 + (idx - orgs.length / 2) * 350 + (Math.random() * 100 - 50),
                            y: 400 + (Math.random() * 300)
                        };
                    }
                });
            });
            saveCustomGroups().catch(console.error);
            saveManpowerToPersistence().catch(console.error);
            showToast('議곗쭅 湲곗??쇰줈 洹몃９???먮룞 ?앹꽦?섏뿀?듬땲??');
            renderManpower();
        }

        // 湲곗〈 諛곗튂 ?좎??섎㈃??customGroups???녿뒗 org留?異붽?
        async function syncMissingOrgGroups() {
            const existing = new Set(customGroups.map(g => g.name.trim().toLowerCase()));
            const missing = [...new Set(
                manpowers
                    .filter(m => m.org && !existing.has(m.org.trim().toLowerCase()))
                    .map(m => m.org.trim())
            )];

            if (missing.length === 0) {
                showToast('?꾨씫??議곗쭅 洹몃９???놁뒿?덈떎.', 'info');
                return;
            }

            let addedX = 200;
            // 湲곗〈 洹몃９ ?몃뱶 以?媛???ㅻⅨ履?x 醫뚰몴 ?댄썑??諛곗튂
            if (customGroups.length > 0) {
                addedX = Math.max(...customGroups.map(g => (g.x || 0))) + 280;
            }

            missing.forEach((orgName, idx) => {
                const gId = 'group-sync-' + Date.now() + '-' + idx;
                customGroups.push({ id: gId, name: orgName, x: addedX + idx * 260, y: 200, parentId: null });
                // ?대떦 org 硫ㅻ쾭?먭쾶 parentId ?먮룞 ?곌껐
                manpowers.forEach(m => {
                    if (m.org && m.org.trim().toLowerCase() === orgName.toLowerCase() && !m.parentId) {
                        m.parentId = gId;
                    }
                });
            });

            await saveCustomGroups().catch(console.error);
            await saveManpowerToPersistence().catch(console.error);
            showToast(`${missing.join(', ')} 洹몃９??異붽??섏뿀?듬땲??`);
            renderManpower();
        }


        function confirmManpowerSearch() {
            currentManpowerSearch = document.getElementById('manpower-search-input').value;
            renderManpower();
        }

        function openManpowerModal(id) {
            document.getElementById('manpower-modal').classList.add('active');
            if (id) {
                const m = manpowers.find(x => x.id === id);
                document.getElementById('manpower-id').value = m.id;
                document.getElementById('m-org').value = m.org || '';
                document.getElementById('m-project').value = m.project || '';
                document.getElementById('m-name').value = m.name;
                document.getElementById('m-nickname').value = m.nickname;
                document.getElementById('m-position').value = m.position || '';
                document.getElementById('m-jobgroup').value = m.jobGroup || '';

                const statusVal = m.status || '?ъ쭅';
                const statusRadio = document.querySelector(`input[name="m-status"][value="${statusVal}"]`);
                if (statusRadio) statusRadio.checked = true;

                document.getElementById('manpower-modal-title').innerText = '?몃젰 ?뺣낫 ?섏젙';
            } else {
                document.getElementById('manpower-form').reset();
                document.getElementById('manpower-id').value = '';
                const activeRadio = document.querySelector('input[name="m-status"][value="?ъ쭅"]');
                if (activeRadio) activeRadio.checked = true;
                document.getElementById('manpower-modal-title').innerText = '?몃젰 ?깅줉';
            }
        }

        function closeManpowerModal() { document.getElementById('manpower-modal').classList.remove('active'); }

        async function saveManpower() {
            const id = document.getElementById('manpower-id').value;
            const manpower = {
                id: id || Date.now().toString(),
                org: document.getElementById('m-org').value,
                project: document.getElementById('m-project').value,
                name: document.getElementById('m-name').value,
                nickname: document.getElementById('m-nickname').value,
                position: document.getElementById('m-position').value,
                jobGroup: document.getElementById('m-jobgroup').value,
                status: document.querySelector('input[name="m-status"]:checked')?.value || '?ъ쭅',
                updated_at: new Date().toISOString()
            };

            if (id) {
                const existingIndex = manpowers.findIndex(m => m.id === id);
                if (existingIndex !== -1) {
                    manpowers[existingIndex] = { ...manpowers[existingIndex], ...manpower };
                }
            } else {
                const isDupe = manpowers.some(m => m.name === manpower.name || (m.nickname && m.nickname === manpower.nickname));
                if (isDupe) {
                    alert('?숈씪???대쫫?대굹 ?됰꽕?꾩쓣 媛吏??몄썝???대? ?깅줉?섏뼱 ?덉뒿?덈떎.');
                    return;
                }
                manpowers.push(manpower);
            }

            localStorage.setItem('manpowers', JSON.stringify(manpowers));
            closeManpowerModal();
            renderManpower();

            if (ghConfig.token && ghConfig.autoSync) {
                await syncWithGitHub('upload', 'task/manpower.json', manpowers);
            }
        }

        async function deleteManpower(id) {
            if (!confirm('?대떦 ?몃젰????젣?섏떆寃좎뒿?덇퉴?')) return;
            manpowers = manpowers.filter(m => m.id !== id);
            localStorage.setItem('manpowers', JSON.stringify(manpowers));
            renderManpower();
            if (ghConfig.token && ghConfig.autoSync) {
                await syncWithGitHub('upload', 'task/manpower.json', manpowers);
            }
        }

        // --- Drag and Drop Sorting ---
        let draggedId = null;

        function handleDragStart(e, id) {
            draggedId = id;
            e.dataTransfer.effectAllowed = 'move';
            e.target.style.opacity = '0.5';
            e.target.style.transform = 'scale(0.95)';
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }

        function handleDragEnd(e) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'none';
            draggedId = null;
            // Ensure all indicators are removed
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        }

        function handleDropOnCard(e, targetId) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            if (draggedId === targetId) return;

            const draggedIdx = manpowers.findIndex(m => m.id === draggedId);
            if (draggedIdx === -1) return;

            const [draggedItem] = manpowers.splice(draggedIdx, 1);

            const targetIdxAfterSplice = manpowers.findIndex(m => m.id === targetId);
            if (targetIdxAfterSplice === -1) {
                manpowers.push(draggedItem);
            } else {
                // Sync property based on current view mode
                if (currentManpowerViewMode === 'org') {
                    draggedItem.org = manpowers[targetIdxAfterSplice].org;
                } else {
                    draggedItem.project = manpowers[targetIdxAfterSplice].project;
                }
                manpowers.splice(targetIdxAfterSplice, 0, draggedItem);
            }

            saveManpowerToPersistence();
        }

        function handleDropOnProject(e, projectName) {
            e.preventDefault();
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            if (draggedId === null) return;

            const draggedIdx = manpowers.findIndex(m => m.id === draggedId);
            if (draggedIdx === -1) return;

            const [draggedItem] = manpowers.splice(draggedIdx, 1);
            draggedItem.project = projectName;
            manpowers.push(draggedItem);

            saveManpowerToPersistence();
        }

        function handleDropOnOrg(e, orgName) {
            e.preventDefault();
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            if (draggedId === null) return;

            const draggedIdx = manpowers.findIndex(m => m.id === draggedId);
            if (draggedIdx === -1) return;

            const [draggedItem] = manpowers.splice(draggedIdx, 1);
            draggedItem.org = orgName;
            manpowers.push(draggedItem);

            saveManpowerToPersistence();
        }

        async function saveManpowerToPersistence() {
            localStorage.setItem('manpowers', JSON.stringify(manpowers));
            renderManpower();
            if (ghConfig.token && ghConfig.autoSync) {
                await syncWithGitHub('upload', 'task/manpower.json', manpowers);
            }
        }
        // --- News Logic (v3 - 蹂묐젹 fetch + ?ㅼ쨷 ?꾨줉??+ ?ㅻ뒛 ?쇱옄 ?꾧꺽 ?꾪꽣) ---
        let googleNewsItems = [];
        let googleVisibleCount = 20;
        let stockPlusNewsItems = [];
        let stockPlusVisibleCount = 20;
        let itNewsItemsList = [];
        let itVisibleCount = 20;

        // ?ㅻ뒛 ?좎쭨 臾몄옄??(YYYY-MM-DD) - 罹먯떆 ?ㅼ뿉 ?ъ슜?섏뿬 ?먯젙 ?섍린硫??먮룞 留뚮즺
        function getTodayDateStr() {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }

        function updateNewsTodayDate() {
            const el = document.getElementById('news-today-date');
            if (el) {
                const now = new Date();
                el.innerText = `?뱟 ${now.getFullYear()}??${now.getMonth() + 1}??${now.getDate()}??湲곗?`;
            }
        }

        // ?ㅼ펷?덊넠 濡쒕뵫 UI
        function showNewsSkeleton(containerId) {
            const el = document.getElementById(containerId);
            if (!el) return;
            el.innerHTML = Array.from({ length: 5 }, () => `
                <div style="padding:1.25rem 0; border-bottom:1px solid #f0f0f2;">
                    <div style="height:16px; background:linear-gradient(90deg,#f0f0f5 25%,#e8e8ed 50%,#f0f0f5 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; margin-bottom:8px; width:${70 + Math.random() * 30}%;"></div>
                    <div style="height:12px; background:linear-gradient(90deg,#f0f0f5 25%,#e8e8ed 50%,#f0f0f5 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:6px; width:35%;"></div>
                </div>
            `).join('');
        }

        // ?ㅼ쨷 RSS ?꾨줉??(?섎굹 ?ㅽ뙣???ㅼ쓬 ?꾨줉?쒕줈 ?먮룞 ?꾪솚)
        const RSS_PROXIES = [
            { url: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`, parse: 'xml' },
            { url: (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, parse: 'xml' },
            { url: (url) => `https://api.codetabs.com/v1/proxy/?quest=${url}`, parse: 'xml' },
            { url: (url) => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`, parse: 'json' }
        ];

        async function fetchGoogleNewsRSS(rssUrl) {
            const cacheBuster = Math.floor(Date.now() / 600000); // 10遺??⑥쐞
            const finalRssUrl = rssUrl + (rssUrl.includes('?') ? '&' : '?') + 'v=' + cacheBuster;

            // ?щ윭 ?꾨줉?쒕? ?숈떆???몄텧?섏뿬 媛??鍮좊Ⅸ ?묐떟??諛섑솚 (Promise.any ?쒖슜 ?띾룄 洹밸???
            const fetchPromises = RSS_PROXIES.map(async (proxy) => {
                const ctrl = new AbortController();
                // ??꾩븘?껋쓣 8珥덈줈 ?⑥텞?섏뿬 ?먮┛ ?묐떟? 鍮좊Ⅴ寃??ш린
                const timer = setTimeout(() => ctrl.abort(), 8000);

                try {
                    const proxyUrl = proxy.url(finalRssUrl);
                    const res = await fetch(proxyUrl, { signal: ctrl.signal });
                    clearTimeout(timer);

                    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

                    if (proxy.parse === 'json') {
                        const data = await res.json();
                        if (data.status === 'ok' && data.items && data.items.length > 0) return data.items;
                        throw new Error('Invalid JSON RSS data');
                    } else if (proxy.parse === 'xml') {
                        const xmlText = await res.text();
                        const items = parseRSSXml(xmlText);
                        if (items && items.length > 0) return items;
                        throw new Error('Invalid XML RSS data');
                    }
                    throw new Error('Unknown parse format');
                } catch (e) {
                    clearTimeout(timer);
                    throw e; // Promise.any?먯꽌 媛쒕퀎 ?ㅽ뙣瑜??몄떇?섎룄濡??먮윭瑜??섏쭚
                }
            });

            try {
                // 媛??癒쇱? ?깃났?섎뒗 ?꾨줉?쒖쓽 寃곌낵瑜?諛섑솚
                return await Promise.any(fetchPromises);
            } catch (e) {
                console.warn('[NEWS] All proxy fetches failed');
                throw new Error('?댁뒪 ?쒕쾭 ?묐떟??吏?곕릺怨??덉뒿?덈떎. ?좎떆 ???ㅼ떆 ?쒕룄??二쇱꽭??');
            }
        }

        // XML RSS 吏곸젒 ?뚯꽌
        function parseRSSXml(xmlText) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlText, 'text/xml');
            const items = doc.querySelectorAll('item');
            return Array.from(items).map(item => ({
                title: item.querySelector('title')?.textContent || '',
                link: item.querySelector('link')?.textContent || '',
                pubDate: item.querySelector('pubDate')?.textContent || '',
                description: item.querySelector('description')?.textContent || ''
            }));
        }

        // ?댁뒪 ?꾪꽣留?(?쒖쇅 ?ㅼ썙?쒕쭔 ?곸슜, 理쒕? 20媛?- Google News RSS媛 ?대? 理쒖떊??諛섑솚)
        function filterTodayNews(items, excludeKeywords = []) {
            const filtered = items.filter(item => {
                // ?쒖쇅 ?ㅼ썙???꾪꽣
                const title = (item.title || '').toLowerCase();
                const desc = (item.description || '').toLowerCase();
                for (const kw of excludeKeywords) {
                    if (title.includes(kw) || desc.includes(kw)) return false;
                }
                return true;
            });

            return filtered.slice(0, 20); // 理쒕? 20媛?
        }

        // 罹먯떆 愿由? ?ㅻ뒛 ?쇱옄 湲곕컲 + 30遺?TTL
        function getNewsCache(keyword, category) {
            const todayStr = getTodayDateStr();
            const cacheKey = `news_v3_${category}_${keyword}_${todayStr}`;
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const { items, timestamp } = JSON.parse(cached);
                    // 0嫄?罹먯떆??臾댁떆 (?ъ“???꾩슂)
                    if (items && items.length > 0 && Date.now() - timestamp < 30 * 60 * 1000) {
                        return items;
                    }
                }
            } catch (e) { }
            return null;
        }

        function setNewsCache(keyword, category, items) {
            const todayStr = getTodayDateStr();
            const cacheKey = `news_v3_${category}_${keyword}_${todayStr}`;
            try {
                localStorage.setItem(cacheKey, JSON.stringify({ items, timestamp: Date.now() }));
                // ?댁젣 ?댁쟾 罹먯떆 ?뺣━
                cleanOldNewsCache(todayStr);
            } catch (e) { }
        }

        function cleanOldNewsCache(todayStr) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('news_v3_') || key.startsWith('news_cache_')) {
                    if (!key.includes(todayStr)) {
                        localStorage.removeItem(key);
                    }
                }
            });
        }

        // 利됱떆 罹먯떆 濡쒕뱶 (?섏씠吏 濡쒕뵫 ???쒕젅???놁씠)
        function loadNewsCacheImmediate() {
            const kw1 = document.getElementById('news-keyword')?.value.trim() || '__top__';
            const kw2 = document.getElementById('stockplus-keyword')?.value.trim() || '__biz__';
            const kw3 = document.getElementById('it-news-keyword')?.value.trim() || '__tech__';

            const c1 = getNewsCache(kw1, 'google');
            const c2 = getNewsCache(kw2, 'stock');
            const c3 = getNewsCache(kw3, 'it');

            if (c1 && c1.length > 0) { googleNewsItems = c1; renderGoogleNews(); }
            if (c2 && c2.length > 0) { stockPlusNewsItems = c2; renderStockPlusNews(); }
            if (c3 && c3.length > 0) { itNewsItemsList = c3; renderITNews(); }
        }

        // 蹂묐젹 ?댁뒪 fetch (3媛??숈떆 ?붿껌?쇰줈 ?띾룄 3諛?媛쒖꽑)
        async function parallelNewsFetch(reset = false) {
            if (!reset && googleNewsItems.length > 0 && stockPlusNewsItems.length > 0 && itNewsItemsList.length > 0) return;

            console.log('Parallel news fetch started (reset:', reset, ')');

            // 3媛??댁뒪 ?숈떆 ?붿껌
            const results = await Promise.allSettled([
                searchGoogleNews(reset),
                fetchStockPlusNews(reset),
                fetchITNews(reset)
            ]);

            results.forEach((r, i) => {
                if (r.status === 'rejected') {
                    console.warn(`News fetch ${i} failed:`, r.reason);
                }
            });
        }

        // ?꾩껜 ?덈줈怨좎묠 踰꾪듉
        function refreshAllNews() {
            showNewsSkeleton('news-left-content');
            showNewsSkeleton('news-right-content');
            showNewsSkeleton('news-it-content');
            googleNewsItems = [];
            stockPlusNewsItems = [];
            itNewsItemsList = [];
            parallelNewsFetch(true);
        }

        async function searchGoogleNews(reset = false) {
            const keyword = document.getElementById('news-keyword').value.trim();
            const contentEl = document.getElementById('news-left-content');

            if (reset) {
                googleNewsItems = [];
                googleVisibleCount = 20;
            }

            // 罹먯떆 ?뺤씤
            const cacheCategory = keyword || '__top__';
            if (!reset && googleNewsItems.length === 0) {
                const cached = getNewsCache(cacheCategory, 'google');
                if (cached) {
                    googleNewsItems = cached;
                    renderGoogleNews();
                    return;
                }
            }

            if (googleNewsItems.length === 0) {
                showNewsSkeleton('news-left-content');
                try {
                    // 湲곕낯: ?쒓뎅 ???ㅻ뱶?쇱씤 RSS / 寃?됱뼱 ?낅젰??search RSS
                    const url = keyword
                        ? `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`
                        : `https://news.google.com/rss?hl=ko&gl=KR&ceid=KR:ko`;
                    const items = await fetchGoogleNewsRSS(url);
                    googleNewsItems = filterTodayNews(items, ['議곗꽑?쇰낫']);
                    setNewsCache(cacheCategory, 'google', googleNewsItems);
                } catch (e) {
                    contentEl.innerHTML = `<div style="color:var(--danger); padding:1.5rem; text-align:center; background:#fff1f0; border-radius:1rem;">
                        <p style="font-weight:700; margin-bottom:0.5rem;">?좑툘 議고쉶 ?ㅻ쪟</p>
                        <p style="font-size:0.9rem; margin-bottom:1rem;">${e.message}</p>
                        <button class="btn-purple" style="font-size:0.85rem; padding:0.5rem 1.5rem;" onclick="searchGoogleNews(true)">?ㅼ떆 ?쒕룄</button>
                    </div>`;
                    return;
                }
            }
            renderGoogleNews();
        }

        function renderGoogleNews() {
            const contentEl = document.getElementById('news-left-content');
            const countEl = document.getElementById('google-news-count');
            if (countEl) countEl.innerText = `(?ㅻ뒛: ${googleNewsItems.length}嫄?`;

            if (googleNewsItems.length === 0) {
                contentEl.innerHTML = '<div style="color:#86868b; padding:1rem;">?ㅻ뒛 ?깅줉??愿???댁뒪媛 ?놁뒿?덈떎.</div>';
                return;
            }
            const itemsToShow = googleNewsItems.slice(0, googleVisibleCount);
            contentEl.innerHTML = itemsToShow.map(item => {
                const title = item.title || '?쒕ぉ ?놁쓬';
                const link = item.link || '#';
                const pubDateText = formatNewsDate(item.pubDate);
                const descTxt = (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 300);
                return `
                    <div class="news-item-card" onclick="showArticleModal(this)" data-title="${title.replace(/"/g, '&quot;')}" data-link="${link}" data-desc="${descTxt.replace(/"/g, '&quot;')}">
                        <div class="news-item-title">${title}</div>
                        <div class="news-item-date">??${pubDateText}</div>
                    </div>
                `;
            }).join('');
            if (googleNewsItems.length > googleVisibleCount) {
                contentEl.innerHTML += `<div style="text-align:center; padding:1rem;"><button class="btn-mini" style="padding:0.5rem 1.5rem;" onclick="googleVisibleCount+=10; renderGoogleNews()">?붾낫湲?(+10)</button></div>`;
            }
        }

        async function fetchStockPlusNews(reset = false) {
            const contentEl = document.getElementById('news-right-content');
            const keyword = document.getElementById('stockplus-keyword').value.trim();

            if (reset) {
                stockPlusNewsItems = [];
                stockPlusVisibleCount = 20;
            }

            const cacheCategory = keyword || '__biz__';
            if (!reset && stockPlusNewsItems.length === 0) {
                const cached = getNewsCache(cacheCategory, 'stock');
                if (cached) {
                    stockPlusNewsItems = cached;
                    renderStockPlusNews();
                    return;
                }
            }

            if (stockPlusNewsItems.length === 0) {
                showNewsSkeleton('news-right-content');
                try {
                    // 湲곕낯: Google News ?쒓뎅 寃쎌젣 ?뱀뀡 RSS (?댁쟾 rss2json ?먮윭 ?고쉶?섍린 ?꾪빐 allorigins ?깆쑝濡?泥섎━??
                    const url = keyword
                        ? `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`
                        : `https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtdHZHZ0pMVWlnQVAB?hl=ko&gl=KR&ceid=KR:ko`;
                    const items = await fetchGoogleNewsRSS(url);
                    stockPlusNewsItems = filterTodayNews(items);
                    setNewsCache(cacheCategory, 'stock', stockPlusNewsItems);
                } catch (e) {
                    contentEl.innerHTML = `
                        <div style="color:var(--danger); padding:1.5rem; text-align:center; background:#fff1f0; border-radius:1rem;">
                            <p style="font-weight:700; margin-bottom:0.5rem;">?좑툘 議고쉶 ?ㅻ쪟</p>
                            <p style="font-size:0.9rem; margin-bottom:1rem;">${e.message}</p>
                            <button class="btn-purple" style="font-size:0.85rem; padding:0.5rem 1.5rem;" onclick="fetchStockPlusNews(true)">?ㅼ떆 ?쒕룄</button>
                        </div>`;
                    return;
                }
            }
            renderStockPlusNews();
        }

        async function fetchITNews(reset = false) {
            const contentEl = document.getElementById('news-it-content');
            const keyword = document.getElementById('it-news-keyword').value.trim();

            if (reset) {
                itNewsItemsList = [];
                itVisibleCount = 20;
            }

            const cacheCategory = keyword || '__tech__';
            if (!reset && itNewsItemsList.length === 0) {
                const cached = getNewsCache(cacheCategory, 'it');
                if (cached) {
                    itNewsItemsList = cached;
                    renderITNews();
                    return;
                }
            }

            if (itNewsItemsList.length === 0) {
                showNewsSkeleton('news-it-content');
                try {
                    // 湲곕낯: Google News IT 愿???쒓뎅???ㅼ썙??寃??RSS (?좏뵿 URL ?먮윭 ?泥?
                    const url = keyword
                        ? `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`
                        : `https://news.google.com/rss/search?q=${encodeURIComponent('IT OR ?뚰겕 OR ?멸났吏??)}&hl=ko&gl=KR&ceid=KR:ko`;
                    const items = await fetchGoogleNewsRSS(url);
                    itNewsItemsList = filterTodayNews(items);
                    setNewsCache(cacheCategory, 'it', itNewsItemsList);
                } catch (e) {
                    contentEl.innerHTML = `
                        <div style="color:var(--danger); padding:1.5rem; text-align:center; background:#fff1f0; border-radius:1rem;">
                            <p style="font-weight:700; margin-bottom:0.5rem;">?좑툘 議고쉶 ?ㅻ쪟</p>
                            <p style="font-size:0.9rem; margin-bottom:1rem;">${e.message}</p>
                            <button class="btn-purple" style="font-size:0.85rem; padding:0.5rem 1.5rem;" onclick="fetchITNews(true)">?ㅼ떆 ?쒕룄</button>
                        </div>`;
                    return;
                }
            }
            renderITNews();
        }

        function renderITNews() {
            const contentEl = document.getElementById('news-it-content');
            const countEl = document.getElementById('it-news-count');
            if (countEl) countEl.innerText = `(?ㅻ뒛: ${itNewsItemsList.length}嫄?`;

            if (itNewsItemsList.length === 0) {
                contentEl.innerHTML = '<div style="color:#86868b; padding:1rem;">?ㅻ뒛 ?깅줉??愿???댁뒪媛 ?놁뒿?덈떎.</div>';
                return;
            }
            const itemsToShow = itNewsItemsList.slice(0, itVisibleCount);
            contentEl.innerHTML = itemsToShow.map(item => {
                const title = item.title || '?쒕ぉ ?놁쓬';
                const link = item.link || '#';
                const pubDate = formatNewsDate(item.pubDate);
                const descTxt = (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 300);

                return `
                    <div class="news-item-card" onclick="showArticleModal(this)" data-title="${title.replace(/"/g, '&quot;')}" data-link="${link}" data-desc="${descTxt.replace(/"/g, '&quot;')}">
                        <div class="news-item-title" style="color: #6a11cb;">${title}</div>
                        <div class="news-item-date">??${pubDate}</div>
                    </div>
                `;
            }).join('');
            if (itNewsItemsList.length > itVisibleCount) {
                contentEl.innerHTML += `<div style="text-align:center; padding:1rem;"><button class="btn-mini" style="padding:0.5rem 1.5rem;" onclick="itVisibleCount+=10; renderITNews()">?붾낫湲?(+10)</button></div>`;
            }
        }

        function renderStockPlusNews() {
            const contentEl = document.getElementById('news-right-content');
            const countEl = document.getElementById('stock-news-count');
            if (countEl) countEl.innerText = `(?ㅻ뒛: ${stockPlusNewsItems.length}嫄?`;

            if (stockPlusNewsItems.length === 0) {
                contentEl.innerHTML = '<div style="color:#86868b; padding:1rem;">?ㅻ뒛 ?깅줉??愿???댁뒪媛 ?놁뒿?덈떎.</div>';
                return;
            }
            const itemsToShow = stockPlusNewsItems.slice(0, stockPlusVisibleCount);
            contentEl.innerHTML = itemsToShow.map(item => {
                const title = item.title || '?쒕ぉ ?놁쓬';
                const link = item.link || '#';
                const pubDate = formatNewsDate(item.pubDate);
                const descTxt = (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 300);

                return `
                    <div class="news-item-card" onclick="showArticleModal(this)" data-title="${title.replace(/"/g, '&quot;')}" data-link="${link}" data-desc="${descTxt.replace(/"/g, '&quot;')}">
                        <div class="news-item-title" style="color: #0071e3;">${title}</div>
                        <div class="news-item-date">??${pubDate}</div>
                    </div>
                `;
            }).join('');
            if (stockPlusNewsItems.length > stockPlusVisibleCount) {
                contentEl.innerHTML += `<div style="text-align:center; padding:1rem;"><button class="btn-mini" style="padding:0.5rem 1.5rem;" onclick="stockPlusVisibleCount+=10; renderStockPlusNews()">?붾낫湲?(+10)</button></div>`;
            }
        }

        // ?댁뒪 ?좎쭨 ?щ㎎ ?ы띁
        function formatNewsDate(pubDateStr) {
            if (!pubDateStr) return '';
            let d = new Date(pubDateStr);
            if (isNaN(d.getTime())) d = new Date(pubDateStr.replace(/-/g, '/'));
            if (isNaN(d.getTime())) return pubDateStr;
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        }



        async function showArticleModal(el) {
            const title = el.getAttribute('data-title');
            const link = el.getAttribute('data-link');
            const desc = el.getAttribute('data-desc');

            const titleEl = document.getElementById('article-title');
            const summaryEl = document.getElementById('article-summary');

            titleEl.innerHTML = title;
            summaryEl.innerHTML = `
                <div style="text-align:center; padding: 4rem 2rem;">
                    <div style="font-size:2rem; animation: spin 1s linear infinite; display:inline-block; margin-bottom:1rem;">??/div>
                    <div style="color:#86868b; font-weight:600;">湲곗궗 ?먮Ц??媛?몄? ?뺣━?섍퀬 ?덉뒿?덈떎...</div>
                    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
                </div>
            `;
            document.getElementById('article-link').href = link;
            document.getElementById('article-modal').classList.add('active');

            try {
                // corsproxy瑜?嫄곗튂怨?援ш? ?댁뒪 由щ떎?대젆?몃? ?곕씪媛湲??꾪빐 泥섎━
                const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(link)}`;

                const ctrl = new AbortController();
                const timer = setTimeout(() => ctrl.abort(), 12000);

                const res = await fetch(proxyUrl, { signal: ctrl.signal });
                clearTimeout(timer);

                if (res.ok) {
                    const htmlText = await res.text();

                    const doc = new DOMParser().parseFromString(htmlText, 'text/html');

                    // Base URI 蹂댁젙 (?곷? 寃쎈줈 ?대?吏 蹂듦뎄??
                    const base = document.createElement('base');
                    base.href = link;
                    doc.head.appendChild(base);

                    if (typeof Readability !== 'undefined') {
                        const reader = new Readability(doc);
                        const article = reader.parse();

                        if (article && article.content) {
                            summaryEl.innerHTML = article.content;
                        } else {
                            throw new Error('蹂몃Ц ?댁슜 ?뚯떛 寃곌낵媛 ?놁뒿?덈떎.');
                        }
                    } else {
                        // Readability ?쇱씠釉뚮윭由?濡쒕뱶 ?ㅽ뙣 ??
                        throw new Error('臾몄꽌 ?뺣━ ?쇱씠釉뚮윭由щ? 遺덈윭?ㅼ? 紐삵뻽?듬땲??');
                    }
                } else {
                    throw new Error('?먮Ц ?ъ씠???묎렐 李⑤떒??(CORS/蹂댁븞)');
                }
            } catch (err) {
                console.warn('[NEWS] Article Extract Failed:', err.message);
                summaryEl.innerHTML = `
                    <div style="padding: 1.5rem; background: #ffffff; border-radius: 12px;">
                        <h4 style="color:#111; margin-bottom:1.5rem; font-size:1.1rem; border-left: 4px solid #0071e3; padding-left: 10px; font-weight: 800;">?뱷 二쇱슂 ?댁슜 ?붿빟</h4>
                        <div style="color: #48484a; line-height: 1.8; font-size: 0.95rem;">
                            ${(desc || '?쒓났???붿빟 ?뺣낫媛 ?놁뒿?덈떎.')
                        .split(/ - | \.\.\. |\. /) // ??? 留먯쨪?꾪몴, 留덉묠??湲곗??쇰줈 遺꾨━
                        .filter(line => line.trim().length > 5) // ?덈Т 吏㏃? ?쇱씤 ?쒖쇅
                        .map(line => `<div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #efeff2; display: flex; align-items: flex-start;"><span style="color:#0071e3; margin-right:8px; font-weight:bold;">??/span>${line.trim()}</div>`)
                        .join('')}
                        </div>
                    </div>
                `;
            }
        }

        function closeArticleModal() {
            document.getElementById('article-modal').classList.remove('active');
        }




        async function syncWithGitHub(action = 'upload', specificPath = null, specificData = null) {
            if (!ghConfig.token || !ghConfig.repo) return null;
            const filePath = specificPath || `task/task-manager.json`;
            const dataToUpload = specificData || (filePath.includes('manpower') ? manpowers : tasks);

            const url = `https://api.github.com/repos/${ghConfig.repo}/contents/${filePath}?ref=${ghConfig.branch}`;
            const headers = {
                'Authorization': `token ${ghConfig.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            };
            try {
                if (action === 'download') {
                    const res = await fetch(url, { headers });
                    if (res.status === 404) return null;
                    if (!res.ok) {
                        const errJson = await res.json().catch(() => ({}));
                        throw new Error(errJson.message || `HTTP Error ${res.status}`);
                    }
                    let json = await res.json();
                    if (Array.isArray(json)) throw new Error('?붿껌??寃쎈줈媛 ?뚯씪???꾨땶 ?붾젆?좊━?낅땲??');

                    let base64 = '';
                    // 1MB ?댁긽??寃쎌슦 content ?꾨뱶媛 ?꾨씫??(sha瑜??댁슜??蹂꾨룄 blob ?붿껌 ?꾩슂)
                    if (!json.content || json.size > 1000000) {
                        if (json.sha) {
                            console.log('Fetching large blob via SHA:', json.sha, 'Size:', json.size);
                            const blobUrl = `https://api.github.com/repos/${ghConfig.repo}/git/blobs/${json.sha}`;
                            // Blob API ?몄텧 ??Accept ?ㅻ뜑瑜??⑥닚?뷀븯???명솚??媛뺥솕
                            const blobRes = await fetch(blobUrl, {
                                headers: { 'Authorization': `token ${ghConfig.token}` }
                            });
                            if (!blobRes.ok) throw new Error(`??⑸웾 ?곗씠??議고쉶 ?ㅽ뙣 (${blobRes.status})`);
                            const blobJson = await blobRes.json();
                            base64 = blobJson.content;
                        } else {
                            throw new Error('?곗씠?곕? 李얠쓣 ???녾굅??SHA ?뺣낫媛 ?놁뒿?덈떎.');
                        }
                    } else {
                        base64 = json.content;
                    }

                    if (!base64) throw new Error('?뚯씪 ?댁슜??鍮꾩뼱?덉뒿?덈떎.');

                    // Base64 ?붿퐫??(怨듬갚 諛?以꾨컮轅??쒓굅)
                    const cleanBase64 = base64.replace(/[\s\r\n\t]/g, '');
                    const binString = atob(cleanBase64);
                    const bytes = new Uint8Array(binString.length);
                    for (let i = 0; i < binString.length; i++) {
                        bytes[i] = binString.charCodeAt(i);
                    }
                    const content = new TextDecoder().decode(bytes);
                    const parsed = JSON.parse(content);
                    console.log('Sync Download Success. Data type:', Array.isArray(parsed) ? 'Array' : typeof parsed);
                    return parsed;
                } else {
                    const success = await uploadToGitHub(filePath, dataToUpload, `Update data: ${filePath}`);
                    if (success) showSyncToast();
                    return success;
                }
            } catch (e) {
                console.error("GitHub Sync Error:", e);
                throw e;
            }
        }

        function showToast(msg, icon = '?뱄툘') {
            const toast = document.createElement('div');
            toast.style.cssText = `position:fixed; bottom:20px; right:20px; background:rgba(0,0,0,0.8); color:white; padding:10px 20px; border-radius:30px; font-size:0.85rem; z-index:10001; animation: fadeOut 3s forwards; pointer-events:none; display:flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(0,0,0,0.15);`;
            toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        function showSyncToast() {
            showToast('GitHub ?숆린???꾨즺', '?곻툘');
        }

        function openGitHubSettings() {
            document.getElementById('gh-token').value = ghConfig.token || '';
            document.getElementById('gh-repo').value = ghConfig.repo || 'uzenkaze/vibe';
            document.getElementById('gh-branch').value = ghConfig.branch || 'main';
            document.getElementById('gh-autosync').checked = ghConfig.autoSync;
            document.getElementById('settings-modal').classList.add('active');
        }

        function saveGitHubSettings() {
            ghConfig = {
                token: document.getElementById('gh-token').value.trim(),
                repo: document.getElementById('gh-repo').value.trim(),
                branch: document.getElementById('gh-branch').value.trim(),
                autoSync: document.getElementById('gh-autosync').checked
            };
            localStorage.setItem('taskGitHubConfig', JSON.stringify(ghConfig));
            document.getElementById('settings-modal').classList.remove('active');
            showToast('GitHub ?ㅼ젙????λ릺?덉뒿?덈떎.');
            init();
        }

        async function manualSyncTasks() {
            if (!ghConfig.token) { showToast('GitHub ?좏겙??癒쇱? ?ㅼ젙?댁＜?몄슂.'); return; }
            if (confirm('?꾩옱 ?곗씠?곕? GitHub濡?利됱떆 ?낅줈???섏떆寃좎뒿?덇퉴?')) {
                await syncWithGitHub('upload');
                showToast('?숆린???꾨즺');
            }
        }

        async function backupTasksToGitHub() {
            if (!ghConfig.token || !ghConfig.repo) { showToast('GitHub ?ㅼ젙??癒쇱? ?뺤씤?댁＜?몄슂.'); return; }

            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const backupPath = `task/backup/task-manager-${dateStr}.json`;
            const message = `Daily Backup: ${dateStr}`;

            const originalBtn = document.querySelector('button[onclick="backupTasksToGitHub()"]');
            if (originalBtn) originalBtn.innerText = '諛깆뾽 以?..';

            try {
                const success = await uploadToGitHub(backupPath, tasks, message);
                if (success) {
                    showToast(`${dateStr} 諛깆뾽 ?뚯씪???앹꽦?섏뿀?듬땲??`);
                } else {
                    showToast('諛깆뾽 ?낅줈??以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.');
                }
            } catch (e) {
                console.error("Backup Error:", e);
                showToast('諛깆뾽 ?ㅽ뙣: ' + e.message);
            } finally {
                if (originalBtn) originalBtn.innerText = '?뮶 諛깆뾽';
            }
        }

        async function uploadToGitHub(filePath, data, message) {
            const url = `https://api.github.com/repos/${ghConfig.repo}/contents/${filePath}?ref=${ghConfig.branch}`;
            const headers = {
                'Authorization': `token ${ghConfig.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            };

            try {
                let sha = null;
                const checkRes = await fetch(url, { headers });
                if (checkRes.ok) {
                    const checkJson = await checkRes.json();
                    sha = checkJson.sha;
                }

                const jsonStr = JSON.stringify(data, null, 2);
                const bytes = new TextEncoder().encode(jsonStr);
                const binString = Array.from(bytes, byte => String.fromCharCode(byte)).join("");
                const base64 = btoa(binString);

                const body = {
                    message: message,
                    content: base64,
                    branch: ghConfig.branch
                };
                if (sha) body.sha = sha;

                const putRes = await fetch(url, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(body)
                });

                return putRes.ok;
            } catch (e) {
                console.error("Upload Error:", e);
                return false;
            }
        }

        window.onload = init;
    
