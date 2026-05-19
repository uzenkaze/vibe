const fs = require('fs');
const file = 'D:\\VibeCoding\\task\\task-manager.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add queries array
if (!content.includes('let queries = [];')) {
    content = content.replace(/let tasks = \[\];\r?\n/, 'let tasks = [];\n        let queries = [];\n');
}

// 2. Add query to menus
if (!content.includes('{ id: \'query\',')) {
    content = content.replace(/\{ id: 'news', name: '실시간 뉴스',/, 
        '{ id: \'query\', name: \'Query 관리\', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>`, viewId: \'view-query\' },\n            { id: \'news\', name: \'실시간 뉴스\',');
}

// 3. Init load queries
if (!content.includes('queries = JSON.parse(localStorage.getItem(\'queries\')')) {
    content = content.replace(/tasks = JSON\.parse\(localStorage\.getItem\('tasks'\) \|\| '\[\]'\);\r?\n/, 
        'tasks = JSON.parse(localStorage.getItem(\'tasks\') || \'[]\');\n            queries = JSON.parse(localStorage.getItem(\'queries\') || \'[]\');\n');
}

// 4. Background Sync download
if (!content.includes('syncWithGitHub(\'download\', \'task/queries.json\')')) {
    content = content.replace(/syncWithGitHub\('download', 'task\/tableSpecs\.json'\)\r?\n\s*\]\);/,
        'syncWithGitHub(\'download\', \'task/tableSpecs.json\'),\n                    syncWithGitHub(\'download\', \'task/queries.json\')\n                ]);');
}

// 5. Background Sync apply
if (!content.includes('queries = getNormalizedData(results[4].value);')) {
    content = content.replace(/tableSpecs = getNormalizedData\(results\[3\]\.value\);\r?\n\s*localStorage\.setItem\('tableSpecs', JSON\.stringify\(tableSpecs\)\);\r?\n\s*changed = true;\r?\n\s*\}/,
        'tableSpecs = getNormalizedData(results[3].value);\n                    localStorage.setItem(\'tableSpecs\', JSON.stringify(tableSpecs));\n                    changed = true;\n                }\n                if (results[4] && results[4].status === \'fulfilled\' && results[4].value) {\n                    queries = getNormalizedData(results[4].value);\n                    localStorage.setItem(\'queries\', JSON.stringify(queries));\n                    changed = true;\n                }');
}

// 6. switchView
if (!content.includes('if (viewId === \'view-query\') {')) {
    content = content.replace(/if \(viewId === 'view-table-spec'\) \{\r?\n\s*syncTableSpecsFromServer\(\);\r?\n\s*\}/,
        'if (viewId === \'view-table-spec\') {\n                syncTableSpecsFromServer();\n            }\n            if (viewId === \'view-query\') {\n                renderQueries();\n            }');
}

// 7. Insert HTML inside .container (before the closing </div> of container)
const viewQueryHTML = `
                <div id="view-query" class="view-section">
                    <header class="header">
                        <div class="header-left" style="display: flex; flex-direction: column; gap: 0.5rem; justify-content: flex-start;">
                            <h1 style="margin: 0; line-height: 1;">Query 관리</h1>
                            <p style="color:#8e8e93; font-size:0.9rem; margin:0; font-weight:600;">유용한 쿼리 및 코드 스니펫 모음</p>
                        </div>
                        <div class="header-right" style="display: flex; gap: 10px; align-items: center;">
                            <div class="search-container">
                                <input type="text" id="query-search-input" class="news-search-input" placeholder="메모 검색..." oninput="renderQueries()" style="border-radius: 20px; padding: 0.6rem 1.2rem; border: 1px solid rgba(0,0,0,0.1); font-size: 0.95rem;">
                            </div>
                            <button class="btn-ts btn-primary" onclick="openQueryModal()" style="border-radius: 20px; padding: 0.6rem 1.5rem; font-weight: 700; background: #0071e3; color: white; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(0,113,227,0.3); transition: transform 0.2s;">➕ 새 쿼리 추가</button>
                        </div>
                    </header>
                    <style>
                        .query-card {
                            position: relative;
                            padding: 1.5rem;
                            border-radius: 1.2rem;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            cursor: pointer;
                            overflow: hidden;
                            display: flex;
                            flex-direction: column;
                            min-height: 220px;
                            color: #1e293b;
                        }
                        .query-card:hover {
                            transform: translateY(-5px) scale(1.02) !important;
                            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
                            z-index: 10;
                        }
                        .query-card::before {
                            content: '';
                            position: absolute;
                            inset: 0;
                            background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%);
                            pointer-events: none;
                        }
                        .query-card-title {
                            font-size: 1.1rem;
                            font-weight: 800;
                            margin-bottom: 0.8rem;
                            display: -webkit-box;
                            -webkit-line-clamp: 1;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                        .query-card-content {
                            font-family: 'Pretendard', sans-serif;
                            font-size: 0.95rem;
                            line-height: 1.6;
                            flex: 1;
                            white-space: pre-wrap;
                            display: -webkit-box;
                            -webkit-line-clamp: 6;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                            font-weight: 500;
                            opacity: 0.85;
                        }
                        .query-card-footer {
                            margin-top: 1rem;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            font-size: 0.75rem;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            opacity: 0.5;
                        }
                        .query-card-tags {
                            display: flex;
                            gap: 6px;
                            flex-wrap: wrap;
                            margin-top: 0.8rem;
                        }
                        .query-card-tag {
                            background: rgba(0, 0, 0, 0.06);
                            padding: 3px 10px;
                            border-radius: 12px;
                            font-size: 0.75rem;
                            font-weight: 700;
                            color: inherit;
                        }
                        .query-copy-btn {
                            position: absolute;
                            top: 1rem;
                            right: 1rem;
                            opacity: 0;
                            background: rgba(0,0,0,0.08);
                            border: none;
                            width: 32px;
                            height: 32px;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 5;
                        }
                        .query-copy-btn:hover {
                            background: rgba(0,0,0,0.15);
                        }
                        .query-card:hover .query-copy-btn {
                            opacity: 1;
                        }
                    </style>
                    <div id="query-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.8rem; padding-bottom: 4rem;">
                        <!-- 쿼리 카드 렌더링 -->
                    </div>
                </div>
`;
if (!content.includes('id="view-query"')) {
    content = content.replace(/(?=\s*<\/div>\r?\n\s*<\/main>\r?\n\s*<\/div>\r?\n\s*<!-- Sync Conflict Modal -->)/,
        '\n' + viewQueryHTML + '\n');
}

// 8. Insert Modal before <!-- Sync Conflict Modal -->
const modalHTML = `
    <!-- Query Modal -->
    <div class="modal-overlay" id="query-modal" style="z-index: 5000;">
        <div class="modal-content" style="width: 100%; max-width:800px; padding:2.5rem; border-radius:1.5rem; background: var(--bg-card); box-shadow: var(--shadow-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 id="query-modal-title" style="margin: 0; font-size: 1.8rem; font-weight: 800; color: #1d1d1f;">새 쿼리 추가</h2>
                <button class="modal-close" onclick="closeQueryModal()" style="position: static;">&times;</button>
            </div>
            <input type="hidden" id="query-id">
            <input type="hidden" id="query-color-value">
            
            <div style="display:flex; gap: 2rem; margin-bottom: 1.5rem;">
                <div style="flex:1;">
                    <label style="font-weight:600; font-size:0.9rem; color: #86868b; display:block; margin-bottom: 0.5rem;">제목</label>
                    <input type="text" id="query-title" class="ts-input" style="width:100%; padding: 12px; font-size: 1rem; border-radius: 12px;" placeholder="쿼리 제목 입력">
                </div>
                <div>
                    <label style="font-weight:600; font-size:0.9rem; color: #86868b; display:block; margin-bottom: 0.5rem;">배경 색상</label>
                    <div id="query-color-selector" style="display: flex; gap: 10px;"></div>
                </div>
            </div>

            <div style="margin-bottom:1.5rem;">
                <label style="font-weight:600; font-size:0.9rem; color: #86868b; display:block; margin-bottom: 0.5rem;">쿼리 내용</label>
                <textarea id="query-content" class="ts-input" style="width:100%; height:250px; font-family: 'Consolas', monospace; font-size: 0.95rem; padding: 15px; border-radius: 12px; resize: vertical; line-height: 1.5; background: #f9f9fb;" placeholder="SELECT * FROM ..."></textarea>
            </div>
            <div style="margin-bottom:2rem;">
                <label style="font-weight:600; font-size:0.9rem; color: #86868b; display:block; margin-bottom: 0.5rem;">태그 (쉼표로 구분)</label>
                <input type="text" id="query-tags" class="ts-input" style="width:100%; padding: 12px; font-size: 0.95rem; border-radius: 12px;" placeholder="sql, tip, etc...">
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button type="button" class="btn-ts btn-danger" id="query-delete-btn" style="display:none; padding: 0.8rem 1.5rem; border-radius: 20px;" onclick="deleteQuery()">삭제</button>
                <div style="flex:1"></div>
                <button type="button" class="btn-ts btn-secondary" onclick="closeQueryModal()" style="padding: 0.8rem 1.5rem; border-radius: 20px;">취소</button>
                <button type="button" class="btn-ts btn-primary" onclick="saveQueryFromModal()" style="padding: 0.8rem 2rem; border-radius: 20px; font-weight: 700; background: #0071e3;">저장</button>
            </div>
        </div>
    </div>
`;
if (!content.includes('id="query-modal"')) {
    content = content.replace(/<!-- Sync Conflict Modal -->/, modalHTML + '\n    <!-- Sync Conflict Modal -->');
}

// 9. Insert JS Logic at the end before </body>
const jsHTML = `
    <script>
        const QUERY_COLORS = [
            '#fef9c3', // Yellow
            '#fee2e2', // Red/Pink
            '#dcfce7', // Green
            '#dbeafe', // Blue
            '#f3e8ff', // Purple
            '#ffedd5', // Orange
        ];

        function renderQueries() {
            const container = document.getElementById('query-grid');
            if (!container) return;
            const searchVal = (document.getElementById('query-search-input')?.value || '').toLowerCase();
            
            const filtered = queries.filter(q => {
                return (q.title && q.title.toLowerCase().includes(searchVal)) || 
                       (q.content && q.content.toLowerCase().includes(searchVal)) ||
                       (q.tags && q.tags.join(',').toLowerCase().includes(searchVal));
            });

            container.innerHTML = filtered.map((q, idx) => {
                const tagHtml = (q.tags || []).map(t => '<span class="query-card-tag">' + escapeHTML(t) + '</span>').join('');
                const color = q.color || QUERY_COLORS[idx % QUERY_COLORS.length];
                const rotate = (idx % 3 - 1) * 0.8;
                const dateStr = q.createdAt ? new Date(q.createdAt).toLocaleDateString('ko-KR') : '';
                
                return '<div class="query-card" onclick="openQueryModal(\\'' + q.id + '\\')" style="background-color: ' + color + '; transform: rotate(' + rotate + 'deg);">' +
                    '<button class="query-copy-btn" onclick="event.stopPropagation(); copyQuery(\\'' + q.id + '\\')" title="복사">📋</button>' +
                    '<div class="query-card-title">' + escapeHTML(q.title || '') + '</div>' +
                    '<div class="query-card-content">' + escapeHTML(q.content || '') + '</div>' +
                    '<div class="query-card-tags">' + tagHtml + '</div>' +
                    '<div class="query-card-footer"><span>' + dateStr + '</span></div>' +
                '</div>';
            }).join('');
        }

        function escapeHTML(str) {
            if (!str) return '';
            return str.replace(/[&<>'"]/g, tag => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
            }[tag]));
        }

        function copyQuery(id) {
            const q = queries.find(x => x.id === id);
            if (q) {
                navigator.clipboard.writeText(q.content).then(() => {
                    if (typeof showToast === 'function') showToast('쿼리가 복사되었습니다.');
                    else alert('쿼리가 복사되었습니다.');
                });
            }
        }

        function openQueryModal(id = null) {
            const modal = document.getElementById('query-modal');
            const delBtn = document.getElementById('query-delete-btn');
            
            // 색상 선택 UI
            const colorContainer = document.getElementById('query-color-selector');
            if (colorContainer) {
                colorContainer.innerHTML = QUERY_COLORS.map(c => 
                    '<div onclick="selectQueryColor(\\'' + c + '\\')" style="width: 32px; height: 32px; border-radius: 50%; cursor: pointer; background-color: ' + c + '; border: 2px solid transparent; transition: all 0.2s;" class="color-dot" data-color="' + c + '"></div>'
                ).join('');
            }

            if (id) {
                const q = queries.find(x => x.id === id);
                if (q) {
                    document.getElementById('query-modal-title').innerText = '쿼리 수정';
                    document.getElementById('query-id').value = q.id;
                    document.getElementById('query-title').value = q.title || '';
                    document.getElementById('query-content').value = q.content || '';
                    document.getElementById('query-tags').value = (q.tags || []).join(', ');
                    document.getElementById('query-color-value').value = q.color || QUERY_COLORS[0];
                    selectQueryColor(q.color || QUERY_COLORS[0]);
                    delBtn.style.display = 'block';
                }
            } else {
                document.getElementById('query-modal-title').innerText = '새 쿼리 추가';
                document.getElementById('query-id').value = '';
                document.getElementById('query-title').value = '';
                document.getElementById('query-content').value = '';
                document.getElementById('query-tags').value = '';
                document.getElementById('query-color-value').value = QUERY_COLORS[0];
                selectQueryColor(QUERY_COLORS[0]);
                delBtn.style.display = 'none';
            }
            modal.style.display = 'flex';
        }

        function selectQueryColor(color) {
            document.getElementById('query-color-value').value = color;
            document.querySelectorAll('#query-color-selector .color-dot').forEach(el => {
                if (el.getAttribute('data-color') === color) {
                    el.style.border = '2px solid rgba(0,0,0,0.3)';
                    el.style.transform = 'scale(1.2)';
                } else {
                    el.style.border = '2px solid transparent';
                    el.style.transform = 'scale(1)';
                }
            });
        }

        function closeQueryModal() {
            document.getElementById('query-modal').style.display = 'none';
        }

        function saveQueryFromModal() {
            const id = document.getElementById('query-id').value;
            const title = document.getElementById('query-title').value.trim();
            const content = document.getElementById('query-content').value.trim();
            const tagsStr = document.getElementById('query-tags').value;
            const color = document.getElementById('query-color-value').value || QUERY_COLORS[0];
            const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);

            if (!title) { alert('제목을 입력하세요.'); return; }
            if (!content) { alert('내용을 입력하세요.'); return; }

            if (id) {
                const idx = queries.findIndex(q => q.id === id);
                if (idx > -1) {
                    queries[idx] = Object.assign({}, queries[idx], { title, content, tags, color, updatedAt: new Date().toISOString() });
                }
            } else {
                queries.push({
                    id: Math.random().toString(36).substr(2, 9),
                    title,
                    content,
                    tags,
                    color,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            saveQueries();
            renderQueries();
            closeQueryModal();
        }

        function deleteQuery() {
            const id = document.getElementById('query-id').value;
            if (id && confirm('정말 삭제하시겠습니까?')) {
                queries = queries.filter(q => q.id !== id);
                saveQueries();
                renderQueries();
                closeQueryModal();
            }
        }

        function saveQueries(notify = true) {
            localStorage.setItem('queries', JSON.stringify(queries));
            if (typeof ghConfig !== 'undefined' && ghConfig.autoSync) {
                if (typeof syncWithGitHub === 'function') {
                    syncWithGitHub('upload', 'task/queries.json', queries).catch(e => console.error(e));
                }
            }
            if (notify && typeof showToast === 'function') showToast('Query가 저장되었습니다.');
        }
    </script>
\n</body>\n`;
if (!content.includes('function renderQueries()')) {
    content = content.replace(/<\/body>\r?\n\s*<\/html>/, jsHTML + '\n</html>');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Script done.');
