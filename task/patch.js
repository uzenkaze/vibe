const fs = require('fs');
const file = 'D:\\VibeCoding\\task\\task-manager.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add queries array
content = content.replace(/let tasks = \[\];\r?\n/, 'let tasks = [];\n        let queries = [];\n');

// 2. Add query to menus
content = content.replace(/\{ id: 'news', name: '실시간 뉴스',/, 
    '{ id: \'query\', name: \'Query 관리\', icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`, viewId: \'view-query\' },\n            { id: \'news\', name: \'실시간 뉴스\',');

// 3. Init load queries
content = content.replace(/tasks = JSON\.parse\(localStorage\.getItem\('tasks'\) \|\| '\[\]'\);\r?\n/, 
    'tasks = JSON.parse(localStorage.getItem(\'tasks\') || \'[]\');\n            queries = JSON.parse(localStorage.getItem(\'queries\') || \'[]\');\n');

// 4. Background Sync download
content = content.replace(/syncWithGitHub\('download', 'task\/tableSpecs\.json'\)\r?\n\s*\]\);/,
    'syncWithGitHub(\'download\', \'task/tableSpecs.json\'),\n                    syncWithGitHub(\'download\', \'task/queries.json\')\n                ]);');

// 5. Background Sync apply
content = content.replace(/tableSpecs = getNormalizedData\(results\[3\]\.value\);\r?\n\s*localStorage\.setItem\('tableSpecs', JSON\.stringify\(tableSpecs\)\);\r?\n\s*changed = true;\r?\n\s*\}/,
    'tableSpecs = getNormalizedData(results[3].value);\n                    localStorage.setItem(\'tableSpecs\', JSON.stringify(tableSpecs));\n                    changed = true;\n                }\n                if (results[4] && results[4].status === \'fulfilled\' && results[4].value) {\n                    queries = getNormalizedData(results[4].value);\n                    localStorage.setItem(\'queries\', JSON.stringify(queries));\n                    changed = true;\n                }');

// 6. switchView
content = content.replace(/if \(viewId === 'view-table-spec'\) \{\r?\n\s*syncTableSpecsFromServer\(\);\r?\n\s*\}/,
    'if (viewId === \'view-table-spec\') {\n                syncTableSpecsFromServer();\n            }\n            if (viewId === \'view-query\') {\n                renderQueries();\n            }');

// 7. Insert HTML before </main>
const viewQueryHTML = `
                <div id="view-query" class="view-section">
                    <style>
                        .query-card { background: var(--bg-card); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow); transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; display: flex; flex-direction: column; gap: 10px; border: 1px solid var(--border); }
                        .query-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); border-color: var(--primary-accent); }
                        .query-card-title { font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 4px; }
                        .query-card-content { font-family: 'Consolas', monospace; font-size: 0.85rem; color: var(--text-main); background: #f8f8fa; padding: 12px; border-radius: 8px; white-space: pre-wrap; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; }
                        .query-card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px; }
                        .query-card-tag { background: rgba(0, 113, 227, 0.1); color: var(--primary-accent); padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
                    </style>
                    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2.5rem;">
                        <div>
                            <h1 style="margin-bottom:0.5rem">Query Management</h1>
                            <p style="color:#86868b; font-size:1rem; font-weight:500;">유용한 쿼리 및 코드 스니펫 관리</p>
                        </div>
                        <div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; align-items: center;">
                            <div class="search-container" style="width: 250px;">
                                <input type="text" id="query-search-input" class="news-search-input" placeholder="쿼리 검색..." oninput="renderQueries()">
                            </div>
                            <button class="btn-ts btn-primary" onclick="openQueryModal()">➕ 새 쿼리 추가</button>
                        </div>
                    </div>
                    <div id="query-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; max-height: calc(100vh - 200px); overflow-y: auto; padding-right: 10px;">
                    </div>
                </div>
`;
content = content.replace(/<\/main>\r?\n\s*<\/div>\r?\n\s*<!-- Sync Conflict Modal -->/,
    viewQueryHTML + '\n            </div>\n        </main>\n    </div>\n\n    <!-- Sync Conflict Modal -->');

// 8. Insert Modal after </main>
const modalHTML = `
    <!-- Query Modal -->
    <div class="modal-overlay" id="query-modal" style="z-index: 5000;">
        <div class="modal-content" style="width: 100%; max-width:800px; padding:2.5rem; border-radius:1.5rem; background: var(--bg-card); box-shadow: var(--shadow-lg);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 id="query-modal-title" style="margin: 0; font-size: 1.5rem;">새 쿼리 추가</h2>
                <button class="modal-close" onclick="closeQueryModal()" style="position: static;">&times;</button>
            </div>
            <input type="hidden" id="query-id">
            <div style="margin-bottom:1.2rem;">
                <label style="font-weight:600; font-size:0.9rem; color: var(--text-muted);">제목</label>
                <input type="text" id="query-title" class="ts-input" style="width:100%; margin-top:0.5rem; padding: 12px; font-size: 1rem;" placeholder="쿼리 제목 입력">
            </div>
            <div style="margin-bottom:1.2rem;">
                <label style="font-weight:600; font-size:0.9rem; color: var(--text-muted);">쿼리 내용</label>
                <textarea id="query-content" class="ts-input" style="width:100%; height:300px; margin-top:0.5rem; font-family: 'Consolas', monospace; font-size: 0.95rem; padding: 12px; resize: vertical;" placeholder="SELECT * FROM ..."></textarea>
            </div>
            <div style="margin-bottom:2rem;">
                <label style="font-weight:600; font-size:0.9rem; color: var(--text-muted);">태그 (쉼표로 구분)</label>
                <input type="text" id="query-tags" class="ts-input" style="width:100%; margin-top:0.5rem; padding: 12px;" placeholder="sql, tip, etc...">
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button type="button" class="btn-ts btn-danger" id="query-delete-btn" style="display:none;" onclick="deleteQuery()">삭제</button>
                <div style="flex:1"></div>
                <button type="button" class="btn-ts btn-secondary" onclick="closeQueryModal()">취소</button>
                <button type="button" class="btn-ts btn-primary" onclick="saveQueryFromModal()">저장</button>
            </div>
        </div>
    </div>
`;
content = content.replace(/<!-- Sync Conflict Modal -->/, modalHTML + '\n    <!-- Sync Conflict Modal -->');

// 9. Insert JS Logic at the end before </body>
const jsHTML = `
    <script>
        function renderQueries() {
            const container = document.getElementById('query-grid');
            if (!container) return;
            const searchVal = (document.getElementById('query-search-input')?.value || '').toLowerCase();
            
            const filtered = queries.filter(q => {
                return (q.title && q.title.toLowerCase().includes(searchVal)) || 
                       (q.content && q.content.toLowerCase().includes(searchVal)) ||
                       (q.tags && q.tags.join(',').toLowerCase().includes(searchVal));
            });

            container.innerHTML = filtered.map(q => {
                const tagHtml = (q.tags || []).map(t => '<span class="query-card-tag">' + escapeHTML(t) + '</span>').join('');
                return '<div class="query-card" onclick="openQueryModal(\\'' + q.id + '\\')">' +
                    '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
                        '<div class="query-card-title">' + escapeHTML(q.title || '') + '</div>' +
                        '<button onclick="event.stopPropagation(); copyQuery(\\'' + q.id + '\\')" style="background:none; border:none; cursor:pointer; font-size: 1.2rem;" title="복사">📋</button>' +
                    '</div>' +
                    '<div class="query-card-tags">' + tagHtml + '</div>' +
                    '<div class="query-card-content">' + escapeHTML(q.content || '') + '</div>' +
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
                navigator.clipboard.writeText(q.content).then(() => showToast('쿼리가 복사되었습니다.'));
            }
        }

        function openQueryModal(id = null) {
            const modal = document.getElementById('query-modal');
            const delBtn = document.getElementById('query-delete-btn');
            if (id) {
                const q = queries.find(x => x.id === id);
                if (q) {
                    document.getElementById('query-modal-title').innerText = '쿼리 수정';
                    document.getElementById('query-id').value = q.id;
                    document.getElementById('query-title').value = q.title || '';
                    document.getElementById('query-content').value = q.content || '';
                    document.getElementById('query-tags').value = (q.tags || []).join(', ');
                    delBtn.style.display = 'block';
                }
            } else {
                document.getElementById('query-modal-title').innerText = '새 쿼리 추가';
                document.getElementById('query-id').value = '';
                document.getElementById('query-title').value = '';
                document.getElementById('query-content').value = '';
                document.getElementById('query-tags').value = '';
                delBtn.style.display = 'none';
            }
            modal.style.display = 'flex';
        }

        function closeQueryModal() {
            document.getElementById('query-modal').style.display = 'none';
        }

        function saveQueryFromModal() {
            const id = document.getElementById('query-id').value;
            const title = document.getElementById('query-title').value.trim();
            const content = document.getElementById('query-content').value.trim();
            const tagsStr = document.getElementById('query-tags').value;
            const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);

            if (!title) { alert('제목을 입력하세요.'); return; }
            if (!content) { alert('내용을 입력하세요.'); return; }

            if (id) {
                const idx = queries.findIndex(q => q.id === id);
                if (idx > -1) {
                    queries[idx] = Object.assign({}, queries[idx], { title, content, tags, updatedAt: new Date().toISOString() });
                }
            } else {
                queries.push({
                    id: Math.random().toString(36).substr(2, 9),
                    title,
                    content,
                    tags,
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
content = content.replace(/<\/body>\r?\n\s*<\/html>/, jsHTML + '\n</html>');

fs.writeFileSync(file, content, 'utf8');
console.log('Script done.');
