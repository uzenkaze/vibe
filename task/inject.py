import codecs

path = r'd:\VibeCoding\task\task-manager.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# Insert Tailwind CSS in head
if '<script src="https://cdn.tailwindcss.com"></script>' not in content:
    tailwind_script = '\n    <script src="https://cdn.tailwindcss.com"></script>\n    <script>tailwind.config={corePlugins:{preflight:false}}</script>'
    content = content.replace('</head>', tailwind_script + '\n</head>')

# Insert the view section before <!-- Article Summary Modal -->
view_html = '''
                <div id="view-table-spec" class="view-section">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                        <div>
                            <h1 style="margin-bottom:0.3rem">테이블 명세서</h1>
                            <p style="color:#86868b; font-size:0.95rem; font-weight:600;">테이블명세 등록 및 관리</p>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button class="btn-purple" style="font-size:0.9rem; padding:0.6rem 1.5rem; border-radius:2rem; background:#0071e3;" onclick="openTableBulkModal()">일괄 등록(Excel/TSV)</button>
                            <button class="btn-purple" style="font-size:0.9rem; padding:0.6rem 1.5rem; border-radius:2rem; background:#34c759;" onclick="addNewTableSpec()">신규 테이블</button>
                        </div>
                    </div>
                    <div style="display:flex; gap:20px; height:calc(100vh - 200px);">
                        <!-- Left sidebar for tables -->
                        <div style="width:280px; background:#fff; border-radius:1rem; border:1px solid #efeff2; display:flex; flex-direction:column; overflow:hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                            <div style="padding:15px; border-bottom:1px solid #efeff2; font-weight:800; font-size:1.1rem; color:#1d1d1f;">🗄️ 테이블 목록</div>
                            <div id="ts-table-list" style="flex:1; overflow-y:auto; padding:10px; display:flex; flex-direction:column; gap:5px;"></div>
                        </div>
                        
                        <!-- Right main content -->
                        <div style="flex:1; background:#fff; border-radius:1rem; border:1px solid #efeff2; display:flex; flex-direction:column; overflow:hidden; position:relative; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
                            <div id="ts-empty-view" style="display:flex; flex-direction:column; justify-content:center; align-items:center; flex:1; color:#86868b;">
                                <div style="font-size:4rem; margin-bottom:1.5rem;">🗂️</div>
                                <div style="font-size:1.1rem; font-weight:600;">좌측에서 테이블을 선택하거나 신규 테이블을 생성하세요.</div>
                            </div>
                            <div id="ts-main-view" style="display:none; flex-direction:column; height:100%;">
                                <div style="padding:24px; border-bottom:1px solid #efeff2; display:flex; flex-direction:column; gap:15px; background: #fafafa;">
                                    <div style="display:flex; gap:20px;">
                                        <div style="flex:1;">
                                            <label style="font-size:0.85rem; color:#86868b; font-weight:bold; letter-spacing:0.5px;">TABLE_NAME (물리명)</label>
                                            <input type="text" id="ts-meta-name" onchange="updateTsMeta()" style="width:100%; padding:10px 12px; margin-top:5px; border:1px solid #d2d2d7; border-radius:0.5rem; font-family:'SF Mono', monospace; font-size:1.1rem; font-weight:800; text-transform:uppercase; transition:border-color 0.2s;" />
                                        </div>
                                        <div style="flex:2;">
                                            <label style="font-size:0.85rem; color:#86868b; font-weight:bold; letter-spacing:0.5px;">Table_Comments (논리명 / 설명)</label>
                                            <input type="text" id="ts-meta-comments" onchange="updateTsMeta()" style="width:100%; padding:10px 12px; margin-top:5px; border:1px solid #d2d2d7; border-radius:0.5rem; font-size:1.1rem; font-weight:500; transition:border-color 0.2s;" />
                                        </div>
                                    </div>
                                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                                        <button onclick="deleteCurrentTableSpec()" style="padding:8px 18px; border-radius:2rem; border:none; background:#ff3b30; color:#fff; font-weight:600; cursor:pointer; transition:transform 0.1s;">테이블 삭제</button>
                                        <button onclick="addTableSpecColumn()" style="padding:8px 18px; border-radius:2rem; border:none; background:#1d1d1f; color:#fff; font-weight:600; cursor:pointer; transition:transform 0.1s;">+ 컬럼 추가</button>
                                        <button onclick="saveTableSpecs()" style="padding:8px 18px; border-radius:2rem; border:none; background:#0071e3; color:#fff; font-weight:600; cursor:pointer; transition:transform 0.1s;">저장하기</button>
                                    </div>
                                </div>
                                <div style="flex:1; overflow:auto;">
                                    <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.85rem;">
                                        <thead style="position:sticky; top:0; z-index:10;">
                                            <tr style="background:#f2f2f7;">
                                                <th style="padding:12px; border-bottom:1px solid #d2d2d7; width:60px; text-align:center; font-weight:700; color:#86868b;">SEQ</th>
                                                <th style="padding:12px; border-bottom:1px solid #d2d2d7; font-weight:700; color:#86868b;">COLUMN_NAME</th>
                                                <th style="padding:12px; border-bottom:1px solid #d2d2d7; font-weight:700; color:#86868b;">COMMENTS</th>
                                                <th style="padding:12px; border-bottom:1px solid #d2d2d7; font-weight:700; color:#86868b;">DATA_TYPE</th>
                                                <th style="padding:12px; border-bottom:1px solid #d2d2d7; width:60px; text-align:center; font-weight:700; color:#86868b;">PK</th>
                                                <th style="padding:12px; border-bottom:1px solid #d2d2d7; width:90px; text-align:center; font-weight:700; color:#86868b;">NULLABLE</th>
                                                <th style="padding:12px; border-bottom:1px solid #d2d2d7; font-weight:700; color:#86868b;">DEFAULT</th>
                                                <th style="padding:12px; border-bottom:1px solid #d2d2d7; font-weight:700; color:#86868b;">비고</th>
                                                <th style="padding:12px; border-bottom:1px solid #d2d2d7; width:60px; text-align:center; font-weight:700; color:#86868b;">관리</th>
                                            </tr>
                                        </thead>
                                        <tbody id="ts-column-list"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Table Spec Bulk Modal -->
                <div class="modal-overlay" id="ts-bulk-modal">
                    <div class="modal-content" style="max-width:800px; padding:2.5rem; background:#fff; border-radius:1.5rem;">
                        <button class="modal-close" onclick="closeTableBulkModal()" style="font-size:1.5rem; color:#86868b;">&times;</button>
                        <h2 style="margin-top:0; font-size:1.8rem; font-weight:800; margin-bottom:1.5rem;">테이블 명세 일괄 등록</h2>
                        <div style="background:#f5f5f7; padding:15px; border-radius:1rem; font-size:0.95rem; margin-bottom:1.5rem; line-height:1.5; color:#1d1d1f; border: 1px solid #e5e5ea;">
                            <strong>💡 엑셀에서 복사한 데이터를 아래에 붙여넣으세요.</strong><br>
                            <span style="color:#0071e3; font-weight:600;">데이터 순서:</span> TABLE_NAME | Table_Comments | SEQ | COLUMN_NAME | COMMENTS | DATA_TYPE | PK | NULLABLE | DEFAULT | 비고
                        </div>
                        <textarea id="ts-bulk-data" style="width:100%; height:250px; padding:15px; border:1px solid #d2d2d7; border-radius:1rem; font-family:'SF Mono', monospace; font-size:0.85rem; line-height:1.6; resize:none;" placeholder="탭(Tab)으로 구분된 데이터를 입력하세요..."></textarea>
                        <div style="text-align:right; margin-top:20px;">
                            <button onclick="processTableBulkData()" style="padding:12px 30px; background:#0071e3; color:#fff; font-size:1rem; font-weight:700; border:none; border-radius:2rem; cursor:pointer; box-shadow:0 4px 12px rgba(0,113,227,0.3);">📥 파싱 및 저장</button>
                        </div>
                    </div>
                </div>
'''
if 'id="view-table-spec"' not in content:
    content = content.replace('<!-- Article Summary Modal -->', view_html + '\n                <!-- Article Summary Modal -->')

# Insert JS logic
js_code = '''
        /* =============== Table Specification Module =============== */
        let currentTableSpec = null;
        
        function renderTableSpecs() {
            const listEl = document.getElementById('ts-table-list');
            if(!listEl) return;
            listEl.innerHTML = '';
            tableSpecs.forEach(t => {
                const isActive = currentTableSpec && currentTableSpec.id === t.id;
                const bg = isActive ? 'background:#0071e3; color:#fff;' : 'background:transparent; color:#1d1d1f;';
                const commentsColor = isActive ? 'color:rgba(255,255,255,0.8);' : 'color:#86868b;';
                listEl.innerHTML += `<div style="padding:10px 15px; border-radius:0.8rem; margin-bottom:4px; cursor:pointer; transition:all 0.2s; ${bg}" onclick="selectTablaSpec('${t.id}')" onmouseover="if(!${isActive}) this.style.background='#f5f5f7'" onmouseout="if(!${isActive}) this.style.background='transparent'">
                    <div style="font-size:0.95rem; font-weight:700; font-family:'SF Mono', monospace;">${t.tableName||'NEW_TABLE'}</div>
                    <div style="font-size:0.8rem; font-weight:500; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; ${commentsColor}">${t.tableComments||'설명 없음'}</div>
                </div>`;
            });
            renderTableSpecViewer();
        }

        function selectTablaSpec(id) {
            currentTableSpec = tableSpecs.find(t => t.id === id);
            renderTableSpecs();
        }

        function renderTableSpecViewer() {
            if(!currentTableSpec) {
                if(document.getElementById('ts-empty-view')) document.getElementById('ts-empty-view').style.display = 'flex';
                if(document.getElementById('ts-main-view')) document.getElementById('ts-main-view').style.display = 'none';
                return;
            }
            if(document.getElementById('ts-empty-view')) document.getElementById('ts-empty-view').style.display = 'none';
            if(document.getElementById('ts-main-view')) document.getElementById('ts-main-view').style.display = 'flex';
            
            document.getElementById('ts-meta-name').value = currentTableSpec.tableName || '';
            document.getElementById('ts-meta-comments').value = currentTableSpec.tableComments || '';
            
            const tbody = document.getElementById('ts-column-list');
            tbody.innerHTML = '';
            const cols = currentTableSpec.columns || [];
            cols.sort((a,b)=>a.seq-b.seq).forEach(c => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #efeff2';
                tr.style.transition = 'background 0.2s';
                tr.onmouseover = () => tr.style.background = '#f9f9fb';
                tr.onmouseout = () => tr.style.background = 'transparent';
                
                tr.innerHTML = `
                    <td style="padding:8px"><input type="number" style="width:100%; border:none; background:transparent; text-align:center; font-family:'SF Mono', monospace; font-size:0.9rem;" value="${c.seq}" onchange="updateTsCol('${c.id}','seq',this.value)"></td>
                    <td style="padding:8px"><input type="text" style="width:100%; border:none; background:transparent; font-weight:700; color:#0071e3; font-family:'SF Mono', monospace; font-size:0.9rem;" value="${c.columnName||''}" onchange="updateTsCol('${c.id}','columnName',this.value)"></td>
                    <td style="padding:8px"><input type="text" style="width:100%; border:none; background:transparent; font-size:0.9rem;" value="${c.comments||''}" onchange="updateTsCol('${c.id}','comments',this.value)"></td>
                    <td style="padding:8px"><input type="text" style="width:100%; border:none; background:transparent; font-family:'SF Mono', monospace; font-size:0.8rem; text-transform:uppercase;" value="${c.dataType||''}" onchange="updateTsCol('${c.id}','dataType',this.value)"></td>
                    <td style="padding:8px; text-align:center;">
                        <select style="border:1px solid #d2d2d7; border-radius:4px; padding:2px 4px; background:#fff; text-align:center; font-size:0.8rem; font-weight:600;" onchange="updateTsCol('${c.id}','pk',this.value)">
                            <option value=""></option>
                            <option value="Y" ${c.pk==='Y'?'selected':''}>Y</option>
                            <option value="N" ${c.pk==='N'?'selected':''}>N</option>
                        </select>
                    </td>
                    <td style="padding:8px; text-align:center;">
                        <select style="border:1px solid #d2d2d7; border-radius:4px; padding:2px 4px; background:#fff; text-align:center; font-size:0.8rem; font-weight:600;" onchange="updateTsCol('${c.id}','nullable',this.value)">
                            <option value="Y" ${c.nullable==='Y'?'selected':''}>Y</option>
                            <option value="N" ${c.nullable==='N'?'selected':''}>N</option>
                        </select>
                    </td>
                    <td style="padding:8px"><input type="text" style="width:100%; border:none; background:transparent; font-family:'SF Mono', monospace; font-size:0.8rem; color:#ff3b30;" value="${c.defaultValue||''}" onchange="updateTsCol('${c.id}','defaultValue',this.value)"></td>
                    <td style="padding:8px"><input type="text" style="width:100%; border:none; background:transparent; font-size:0.85rem; color:#86868b;" value="${c.note||''}" onchange="updateTsCol('${c.id}','note',this.value)"></td>
                    <td style="padding:8px; text-align:center;">
                        <button onclick="deleteTsCol('${c.id}')" style="background:transparent; border:none; color:#ff3b30; cursor:pointer; font-size:1.1rem; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='none'" title="삭제">❌</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        function updateTsMeta() {
            if(!currentTableSpec) return;
            currentTableSpec.tableName = document.getElementById('ts-meta-name').value.trim().toUpperCase();
            currentTableSpec.tableComments = document.getElementById('ts-meta-comments').value.trim();
            saveTableSpecs(false); // don't notify visually, just save
            renderTableSpecs();
        }

        function updateTsCol(id, field, val) {
            if(!currentTableSpec) return;
            const c = currentTableSpec.columns.find(x=>x.id===id);
            if(c) {
                if(field==='seq') val = parseInt(val)||0;
                if(field==='columnName') val = val.toUpperCase();
                c[field] = val;
            }
        }

        function deleteTsCol(id) {
            if(!currentTableSpec) return;
            currentTableSpec.columns = currentTableSpec.columns.filter(x=>x.id!==id);
            renderTableSpecViewer();
        }

        function addTableSpecColumn() {
            if(!currentTableSpec) return;
            if(!currentTableSpec.columns) currentTableSpec.columns = [];
            const maxSeq = currentTableSpec.columns.reduce((m,c)=>Math.max(m,c.seq),0);
            currentTableSpec.columns.push({
                id: Math.random().toString(36).substr(2,9),
                seq: maxSeq+1,
                columnName: '', comments: '', dataType: 'VARCHAR2(100)', pk: '', nullable:'Y', defaultValue: '', note: ''
            });
            renderTableSpecViewer();
        }

        function addNewTableSpec() {
            const t = {
                id: Math.random().toString(36).substr(2,9),
                tableName: 'NEW_TABLE',
                tableComments: '신규 테이블',
                columns: []
            };
            tableSpecs.push(t);
            currentTableSpec = t;
            renderTableSpecs();
        }

        function deleteCurrentTableSpec() {
            if(!currentTableSpec) return;
            if(confirm(`[${currentTableSpec.tableName}] 테이블을 삭제하시겠습니까? 데이터가 모두 지워집니다.`)) {
                tableSpecs = tableSpecs.filter(x=>x.id!==currentTableSpec.id);
                currentTableSpec = null;
                saveTableSpecs();
                renderTableSpecs();
            }
        }

        function saveTableSpecs(notify=true) {
            localStorage.setItem('tableSpecs', JSON.stringify(tableSpecs));
            if(ghConfig && ghConfig.token && ghConfig.autoSync) {
                syncWithGitHub('upload', 'task/tableSpecs.json', tableSpecs).catch(e => console.error(e));
            }
            if(notify) alert('테이블 명세서가 성공적으로 저장되었습니다.');
        }

        function openTableBulkModal() {
            document.getElementById('ts-bulk-modal').style.display='flex';
            document.getElementById('ts-bulk-data').value='';
            document.getElementById('ts-bulk-data').focus();
        }
        function closeTableBulkModal() {
            document.getElementById('ts-bulk-modal').style.display='none';
        }
        function processTableBulkData() {
            const raw = document.getElementById('ts-bulk-data').value;
            if(!raw.trim()) { alert('입력된 데이터가 없습니다.'); return; }
            const lines = raw.split('\\n');
            let count = 0;
            let m = {};
            lines.forEach(l => {
                if(!l.trim()) return;
                const p = l.split('\\t');
                if(p.length<4) return;
                const tName = p[0]?.trim().toUpperCase();
                const cName = p[3]?.trim().toUpperCase();
                if(!tName || !cName) return;
                if(!m[tName]) m[tName]={ comments: p[1]?.trim()||'', cols:[] };
                m[tName].cols.push({
                    id: Math.random().toString(36).substr(2,9),
                    seq: parseInt(p[2])||0,
                    columnName: cName,
                    comments: p[4]?.trim()||'', dataType: p[5]?.trim()||'',
                    pk: p[6]?.trim()||'', nullable: p[7]?.trim()||'Y',
                    defaultValue: p[8]?.trim()||'', note: p[9]?.trim()||''
                });
                count++;
            });
            
            if(count === 0) {
                alert('유효한 컬럼 데이터를 찾지 못했습니다. Tab 키로 구분된 데이터를 확인해주세요.');
                return;
            }

            Object.keys(m).forEach(k => {
                let e = tableSpecs.find(x=>x.tableName===k);
                if(!e) {
                    e = { id: Math.random().toString(36).substr(2,9), tableName: k, tableComments: m[k].comments, columns:[] };
                    tableSpecs.push(e);
                } else if(!e.tableComments && m[k].comments) {
                    e.tableComments = m[k].comments;
                }
                if(!e.columns) e.columns = [];
                e.columns.push(...m[k].cols);
            });
            saveTableSpecs(false); // Do not show alert yet
            closeTableBulkModal();
            renderTableSpecs();
            alert(`총 ${count}건의 컬럼이 등록 및 병합되었습니다.`);
        }
        /* ========================================================== */
'''
if 'function renderTableSpecs()' not in content:
    content = content.replace('function renderSidebar()', js_code + '\n        function renderSidebar()')

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("done")
