
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
                return '<div class="query-card" onclick="openQueryModal(\'' + q.id + '\')">' +
                    '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
                        '<div class="query-card-title">' + escapeHTML(q.title || '') + '</div>' +
                        '<button onclick="event.stopPropagation(); copyQuery(\'' + q.id + '\')" style="background:none; border:none; cursor:pointer; font-size: 1.2rem;" title="蹂듭궗">?뱥</button>' +
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
                navigator.clipboard.writeText(q.content).then(() => showToast('荑쇰━媛 蹂듭궗?섏뿀?듬땲??'));
            }
        }

        function openQueryModal(id = null) {
            const modal = document.getElementById('query-modal');
            const delBtn = document.getElementById('query-delete-btn');
            if (id) {
                const q = queries.find(x => x.id === id);
                if (q) {
                    document.getElementById('query-modal-title').innerText = '荑쇰━ ?섏젙';
                    document.getElementById('query-id').value = q.id;
                    document.getElementById('query-title').value = q.title || '';
                    document.getElementById('query-content').value = q.content || '';
                    document.getElementById('query-tags').value = (q.tags || []).join(', ');
                    delBtn.style.display = 'block';
                }
            } else {
                document.getElementById('query-modal-title').innerText = '??荑쇰━ 異붽?';
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

            if (!title) { alert('?쒕ぉ???낅젰?섏꽭??'); return; }
            if (!content) { alert('?댁슜???낅젰?섏꽭??'); return; }

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
            if (id && confirm('?뺣쭚 ??젣?섏떆寃좎뒿?덇퉴?')) {
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
            if (notify && typeof showToast === 'function') showToast('Query媛 ??λ릺?덉뒿?덈떎.');
        }
    
