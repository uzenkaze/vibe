/**
 * MindMap Engine - Hans Wealth Management
 */

const MM = {
    canvas: null, ctx: null, container: null,
    nodes: [], edges: [], nextId: 1,
    selected: null, selectedEdge: null, dragging: null, dragOffset: { x: 0, y: 0 },
    pan: { x: 0, y: 0 }, zoom: 1, isPanning: false, panStart: { x: 0, y: 0 },
    bridgeMode: false, bridgeFrom: null, syncTimeout: null,
    store: { version: 2, activeId: 1, nextPageId: 2, pages: [] },
    LINE_STYLES: [
        { id: 'dashed', label: '점선 ┄', dash: [6, 4] },
        { id: 'solid', label: '실선 ─', dash: [] },
        { id: 'dotted', label: '도트 ···', dash: [2, 3] },
        { id: 'dashdot', label: '일점쇄선 ─·', dash: [10, 3, 2, 3] },
        { id: 'long', label: '긴점선 ━━', dash: [14, 6] },
    ],
    PALETTE: ['#E4FF54','#5DFAB1','#54C8FF','#FF6B8A','#C49BFF','#FFB347','#FFFFFF','#F0F4FF','#FFF8F0','#1C1D20','#2A2A3E','#FF3B30','#34C759','#007AFF','#AF52DE','#FF9500'],
    COLORS: {
        group: ['#E4FF54','#5DFAB1','#54C8FF','#FF6B8A','#C49BFF','#FFB347'],
        node: ['#FFFFFF','#F0F4FF','#FFF8F0','#F0FFF4','#FFF0F8','#F5F0FF'],
        darkGroup: ['#3D4A00','#004D2E','#003D5C','#5C0020','#3A0066','#5C3600'],
        darkNode: ['#1E2030','#1A2040','#2A1E18','#1A2E1E','#2E1A28','#251A30'],
    },
    NODE_W: 160, NODE_H: 56, GROUP_W: 140, GROUP_H: 60,

    init() {
        this.canvas = document.getElementById('mmCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = document.getElementById('mmContainer');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousedown', e => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', e => this.onMouseUp(e));
        this.canvas.addEventListener('dblclick', e => this.onDblClick(e));
        this.canvas.addEventListener('wheel', e => this.onWheel(e), { passive: false });
        document.addEventListener('keydown', e => this.onKeyDown(e));
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        this.load();
        
        // Fallback if load didn't create a page
        if (this.store.pages.length === 0) {
            const defaultPage = { id: 1, title: 'Main Page', nodes: [], edges: [], nextId: 2 };
            defaultPage.nodes.push({ id: 1, type: 'group', label: 'Main Group', x: 0, y: 0, color: 0, memo: '' });
            this.store.pages.push(defaultPage);
            this.store.activeId = 1;
            this.syncActivePage();
            this.save();
        }
        
        this.selected = null;
        this.renderSidebar();
        this.render();
    },

    syncActivePage() {
        const page = this.store.pages.find(p => p.id === this.store.activeId);
        if (page) {
            this.nodes = page.nodes;
            this.edges = page.edges;
            this.nextId = page.nextId;
        }
    },

    commitActivePage() {
        const page = this.store.pages.find(p => p.id === this.store.activeId);
        if (page) {
            page.nodes = this.nodes;
            page.edges = this.edges;
            page.nextId = this.nextId;
        }
    },

    addNewPage() {
        this.commitActivePage();
        const newId = this.store.nextPageId++;
        const newPage = { id: newId, title: 'New Page', nodes: [], edges: [], nextId: 2 };
        newPage.nodes.push({ id: 1, type: 'group', label: 'New Topic', x: 0, y: 0, color: 0, memo: '' });
        
        this.store.pages.push(newPage);
        this.store.activeId = newId;
        this.syncActivePage();
        this.selected = null;
        this.fitView();
        this.save();
        this.renderSidebar();
        this.render();
    },

    switchPage(id) {
        if (this.store.activeId === id) return;
        this.commitActivePage();
        this.store.activeId = id;
        this.syncActivePage();
        this.selected = null;
        this.fitView();
        this.save();
        this.renderSidebar();
        this.render();
    },

    deletePage(id) {
        if (this.store.pages.length <= 1) {
            alert('최소 1개의 페이지는 유지해야 합니다.');
            return;
        }
        showConfirm('이 페이지를 삭제하시겠습니까?', () => {
            this.store.pages = this.store.pages.filter(p => p.id !== id);
            if (this.store.activeId === id) {
                this.store.activeId = this.store.pages[0].id;
                this.syncActivePage();
            }
            this.selected = null;
            this.save();
            this.renderSidebar();
            this.render();
        });
    },

    renamePage(id) {
        const page = this.store.pages.find(p => p.id === id);
        if (!page) return;
        const newTitle = prompt('새 페이지 이름을 입력하세요:', page.title);
        if (newTitle && newTitle.trim()) {
            page.title = newTitle.trim();
            this.save();
            this.renderSidebar();
        }
    },

    renderSidebar() {
        const list = document.getElementById('pageList');
        if (!list) return;
        list.innerHTML = '';
        this.store.pages.forEach(p => {
            const isActive = p.id === this.store.activeId;
            const item = document.createElement('div');
            item.className = `flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-accent-blue/10 text-accent-blue font-bold' : 'hover:bg-item-hover text-text-secondary'}`;
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'flex-1 truncate text-sm';
            titleSpan.innerText = p.title;
            titleSpan.onclick = () => this.switchPage(p.id);
            titleSpan.ondblclick = () => this.renamePage(p.id);
            
            item.appendChild(titleSpan);

            // Controls
            const ctrls = document.createElement('div');
            ctrls.className = 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity';
            if (isActive) ctrls.classList.remove('opacity-0');
            
            const renameBtn = document.createElement('button');
            renameBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
            renameBtn.className = 'p-1 hover:text-text-primary transition-colors';
            renameBtn.onclick = (e) => { e.stopPropagation(); this.renamePage(p.id); };
            
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>';
            delBtn.className = 'p-1 hover:text-red-500 transition-colors';
            delBtn.onclick = (e) => { e.stopPropagation(); this.deletePage(p.id); };
            
            item.classList.add('group');
            ctrls.append(renameBtn, delBtn);
            item.appendChild(ctrls);
            
            list.appendChild(item);
        });
    },

    resize() {
        const r = this.container.getBoundingClientRect();
        this.canvas.width = r.width * window.devicePixelRatio;
        this.canvas.height = r.height * window.devicePixelRatio;
        this.canvas.style.width = r.width + 'px';
        this.canvas.style.height = r.height + 'px';
        this.ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        this.render();
    },

    isDark() { return document.documentElement.classList.contains('dark'); },

    toWorld(cx, cy) {
        const r = this.canvas.getBoundingClientRect();
        return { x: (cx - r.left - this.pan.x) / this.zoom, y: (cy - r.top - this.pan.y) / this.zoom };
    },

    toScreen(wx, wy) {
        return { x: wx * this.zoom + this.pan.x, y: wy * this.zoom + this.pan.y };
    },

    getNodeAt(wx, wy) {
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const n = this.nodes[i];
            const hw = (n.type === 'group' ? this.GROUP_W : this.NODE_W) / 2;
            const hh = (n.type === 'group' ? this.GROUP_H : this.NODE_H) / 2;
            if (wx >= n.x - hw && wx <= n.x + hw && wy >= n.y - hh && wy <= n.y + hh) return n;
        }
        return null;
    },

    getChildren(parentId) {
        const childEdges = this.edges.filter(e => e.from === parentId);
        return childEdges.map(e => ({ node: this.nodes.find(n => n.id === e.to), edge: e }));
    },

    addChild(parentId) {
        const parent = this.nodes.find(n => n.id === parentId);
        if (!parent) return;
        const children = this.getChildren(parentId);
        const count = children.length;
        const spacing = 90;
        const totalH = count * spacing;
        const newY = parent.y - totalH / 2 + count * spacing;
        const newX = parent.x + 260;
        const colorIdx = (parent.color + 1 + count) % this.COLORS.group.length;
        const newNode = {
            id: this.nextId++, type: 'node', label: 'New Node',
            x: newX, y: newY, color: colorIdx, memo: '', customColor: null
        };
        this.nodes.push(newNode);
        this.edges.push({ from: parentId, to: newNode.id, label: '', lineStyle: 'dashed' });
        this.selected = newNode;
        this.save(); this.render();
        this.startEditLabel(newNode);
    },

    deleteNode(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) return;
        const descendants = [];
        const collectDesc = (id) => {
            this.edges.filter(e => e.from === id).forEach(e => {
                descendants.push(e.to);
                collectDesc(e.to);
            });
        };
        collectDesc(nodeId);
        const toRemove = [nodeId, ...descendants];
        this.nodes = this.nodes.filter(n => !toRemove.includes(n.id));
        this.edges = this.edges.filter(e => !toRemove.includes(e.from) && !toRemove.includes(e.to));
        this.selected = null;
        this.save(); this.render();
    },

    onMouseDown(e) {
        const w = this.toWorld(e.clientX, e.clientY);
        const node = this.getNodeAt(w.x, w.y);
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            this.isPanning = true;
            this.panStart = { x: e.clientX - this.pan.x, y: e.clientY - this.pan.y };
            this.canvas.style.cursor = 'grabbing';
            return;
        }
        // Bridge mode
        if (this.bridgeMode && node) {
            if (!this.bridgeFrom) {
                this.bridgeFrom = node;
                this.selected = node;
                this.render(); this.updateToolbar();
                showToast('브릿지: 대상 노드를 클릭하세요');
                return;
            } else if (node.id !== this.bridgeFrom.id) {
                const exists = this.edges.some(e => (e.from === this.bridgeFrom.id && e.to === node.id) || (e.from === node.id && e.to === this.bridgeFrom.id));
                if (!exists) {
                    this.edges.push({ from: this.bridgeFrom.id, to: node.id, label: '', lineStyle: 'solid', bridge: true });
                    this.save();
                }
                this.bridgeMode = false; this.bridgeFrom = null;
                document.getElementById('bridgeBtn')?.classList.remove('active');
                this.selected = node;
                this.render(); this.updateToolbar();
                return;
            }
        }
        if (node) {
            this.selected = node; this.selectedEdge = null;
            this.dragging = node;
            this.dragOffset = { x: w.x - node.x, y: w.y - node.y };
            this.canvas.style.cursor = 'move';
        } else {
            const edge = this.getEdgeAt(w.x, w.y);
            if (edge) { this.selectedEdge = edge; this.selected = null; }
            else { this.selected = null; this.selectedEdge = null; }
        }
        this.render();
        this.updateToolbar();
    },

    onMouseMove(e) {
        if (this.isPanning) {
            this.pan.x = e.clientX - this.panStart.x;
            this.pan.y = e.clientY - this.panStart.y;
            this.render(); return;
        }
        if (this.dragging) {
            const w = this.toWorld(e.clientX, e.clientY);
            this.dragging.x = w.x - this.dragOffset.x;
            this.dragging.y = w.y - this.dragOffset.y;
            this.render();
        }
    },

    onMouseUp(e) {
        if (this.isPanning) { this.isPanning = false; this.canvas.style.cursor = 'default'; return; }
        if (this.dragging) { this.dragging = null; this.canvas.style.cursor = 'default'; this.save(); }
    },

    onDblClick(e) {
        const w = this.toWorld(e.clientX, e.clientY);
        const node = this.getNodeAt(w.x, w.y);
        if (node) { this.startEditLabel(node); return; }
        const edge = this.getEdgeAt(w.x, w.y);
        if (edge) { this.selectedEdge = edge; this.selected = null; this.startEditEdgeLabel(edge); }
    },

    onWheel(e) {
        e.preventDefault();
        const r = this.canvas.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        const oldZoom = this.zoom;
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(0.2, Math.min(3, this.zoom * delta));
        this.pan.x = mx - (mx - this.pan.x) * (this.zoom / oldZoom);
        this.pan.y = my - (my - this.pan.y) * (this.zoom / oldZoom);
        document.getElementById('zoomLevel').textContent = Math.round(this.zoom * 100) + '%';
        this.render();
    },

    onKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.key === 'Tab' && this.selected) {
            e.preventDefault();
            this.addChild(this.selected.id);
        }
        if (e.key === 'Delete' && this.selected) {
            e.preventDefault();
            const isRoot = !this.edges.some(edge => edge.to === this.selected.id);
            if (isRoot) {
                showConfirm('최상위 그룹은 삭제할 수 없습니다.', null, true);
                return;
            }
            const hasChildren = this.edges.some(edge => edge.from === this.selected.id);
            const msg = hasChildren
                ? `"${this.selected.label}" 및 모든 하위 노드를 삭제하시겠습니까?`
                : `"${this.selected.label}"을(를) 삭제하시겠습니까?`;
            const delId = this.selected.id;
            showConfirm(msg, () => { this.deleteNode(delId); });
        }
        if (e.key === 'F2' && this.selected) { e.preventDefault(); this.startEditLabel(this.selected); }
    },

    getEdgeAt(wx, wy) {
        for (const edge of this.edges) {
            const from = this.nodes.find(n => n.id === edge.from);
            const to = this.nodes.find(n => n.id === edge.to);
            if (!from || !to) continue;
            const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
            if (Math.abs(wx - mx) < 30 && Math.abs(wy - my) < 20) return edge;
        }
        return null;
    },

    startEditLabel(node) {
        const s = this.toScreen(node.x, node.y);
        const inp = document.getElementById('nodeInput');
        inp.style.display = 'block';
        inp.style.left = (s.x - 70) + 'px';
        inp.style.top = (s.y - 14) + 'px';
        inp.value = node.label;
        inp.focus(); inp.select();
        inp.onblur = () => {
            node.label = inp.value || node.label;
            inp.style.display = 'none';
            this.save(); this.render();
        };
        inp.onkeydown = (e) => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = node.label; inp.blur(); } };
    },

    startEditEdgeLabel(edge) {
        const from = this.nodes.find(n => n.id === edge.from);
        const to = this.nodes.find(n => n.id === edge.to);
        if (!from || !to) return;
        const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
        const s = this.toScreen(mx, my);
        const inp = document.getElementById('nodeInput');
        inp.style.display = 'block';
        inp.style.left = (s.x - 50) + 'px';
        inp.style.top = (s.y - 14) + 'px';
        inp.value = edge.label || '';
        inp.placeholder = '연결선 텍스트';
        inp.focus(); inp.select();
        inp.onblur = () => {
            edge.label = inp.value;
            inp.style.display = 'none'; inp.placeholder = '';
            this.save(); this.render();
        };
        inp.onkeydown = (e) => { if (e.key === 'Enter') inp.blur(); if (e.key === 'Escape') { inp.value = edge.label; inp.blur(); } };
    },

    openMemo(node) {
        const modal = document.getElementById('memoModal');
        const textarea = document.getElementById('memoText');
        const title = document.getElementById('memoTitle');
        title.textContent = node.label + ' - 메모';
        textarea.value = node.memo || '';
        modal.style.display = 'flex';
        textarea.focus();
        document.getElementById('memoSaveBtn').onclick = () => {
            node.memo = textarea.value;
            this.save(); this.render();
            modal.style.display = 'none';
        };
        document.getElementById('memoCancelBtn').onclick = () => { modal.style.display = 'none'; };
    },

    updateToolbar() {
        const bar = document.getElementById('nodeToolbar');
        const edgeBar = document.getElementById('edgeToolbar');
        if (this.selectedEdge) {
            bar.style.opacity = '0'; bar.style.pointerEvents = 'none';
            if (edgeBar) { edgeBar.style.opacity = '1'; edgeBar.style.pointerEvents = 'auto'; }
            return;
        }
        if (edgeBar) { edgeBar.style.opacity = '0'; edgeBar.style.pointerEvents = 'none'; }
        if (!this.selected) { bar.style.opacity = '0'; bar.style.pointerEvents = 'none'; return; }
        bar.style.opacity = '1'; bar.style.pointerEvents = 'auto';
        document.getElementById('selLabel').textContent = this.selected.label;
    },

    // Color picker
    openColorPicker(node) {
        const modal = document.getElementById('colorModal');
        const grid = document.getElementById('colorGrid');
        grid.innerHTML = '';
        this.PALETTE.forEach(color => {
            const swatch = document.createElement('button');
            swatch.style.cssText = `width:32px;height:32px;border-radius:8px;border:2px solid var(--glass-border);background:${color};cursor:pointer;transition:transform 0.15s;`;
            if (node.customColor === color) swatch.style.borderColor = 'var(--accent-blue)';
            swatch.onmouseenter = () => swatch.style.transform = 'scale(1.15)';
            swatch.onmouseleave = () => swatch.style.transform = 'scale(1)';
            swatch.onclick = () => {
                node.customColor = color;
                this.save(); this.render();
                modal.style.display = 'none';
            };
            grid.appendChild(swatch);
        });
        // Custom color input
        const customRow = document.createElement('div');
        customRow.style.cssText = 'display:flex;gap:6px;align-items:center;margin-top:8px;';
        const cinput = document.createElement('input');
        cinput.type = 'color'; cinput.value = node.customColor || '#FFFFFF';
        cinput.style.cssText = 'width:40px;height:32px;border:none;cursor:pointer;border-radius:6px;';
        const applyBtn = document.createElement('button');
        applyBtn.textContent = '적용';
        applyBtn.style.cssText = 'padding:6px 16px;border-radius:8px;border:1px solid var(--glass-border);background:var(--accent-blue);color:#fff;font:600 11px Outfit;cursor:pointer;';
        applyBtn.onclick = () => { node.customColor = cinput.value; this.save(); this.render(); modal.style.display = 'none'; };
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '기본값';
        resetBtn.style.cssText = 'padding:6px 12px;border-radius:8px;border:1px solid var(--glass-border);background:transparent;color:var(--text-secondary);font:600 11px Outfit;cursor:pointer;';
        resetBtn.onclick = () => { node.customColor = null; this.save(); this.render(); modal.style.display = 'none'; };
        customRow.append(cinput, applyBtn, resetBtn);
        grid.appendChild(customRow);
        modal.style.display = 'flex';
    },

    // Line style for edge
    openLineStylePicker(edge) {
        const modal = document.getElementById('lineStyleModal');
        const list = document.getElementById('lineStyleList');
        list.innerHTML = '';
        this.LINE_STYLES.forEach(ls => {
            const btn = document.createElement('button');
            btn.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:10px;border:1px solid var(--glass-border);background:transparent;color:var(--text-primary);font:500 13px Outfit;cursor:pointer;width:100%;transition:all 0.15s;';
            if (edge.lineStyle === ls.id) btn.style.borderColor = 'var(--accent-blue)';
            // Line preview
            const cvs = document.createElement('canvas'); cvs.width = 60; cvs.height = 16;
            const cx = cvs.getContext('2d');
            cx.strokeStyle = this.isDark() ? '#B0B0D0' : '#555'; cx.lineWidth = 2;
            cx.setLineDash(ls.dash); cx.beginPath(); cx.moveTo(4, 8); cx.lineTo(56, 8); cx.stroke();
            btn.appendChild(cvs);
            btn.appendChild(document.createTextNode(ls.label));
            btn.onmouseenter = () => btn.style.background = 'var(--item-hover)';
            btn.onmouseleave = () => btn.style.background = 'transparent';
            btn.onclick = () => { edge.lineStyle = ls.id; this.save(); this.render(); modal.style.display = 'none'; };
            list.appendChild(btn);
        });
        modal.style.display = 'flex';
    },

    // Bridge mode toggle
    toggleBridge() {
        this.bridgeMode = !this.bridgeMode;
        this.bridgeFrom = null;
        const btn = document.getElementById('bridgeBtn');
        if (this.bridgeMode) {
            btn?.classList.add('active');
            showToast('브릿지 모드: 시작 노드를 클릭하세요');
        } else {
            btn?.classList.remove('active');
        }
    },

    setZoom(z) {
        const r = this.canvas.getBoundingClientRect();
        const cx = r.width / 2, cy = r.height / 2;
        const oldZ = this.zoom;
        this.zoom = Math.max(0.2, Math.min(3, z));
        this.pan.x = cx - (cx - this.pan.x) * (this.zoom / oldZ);
        this.pan.y = cy - (cy - this.pan.y) * (this.zoom / oldZ);
        document.getElementById('zoomLevel').textContent = Math.round(this.zoom * 100) + '%';
        this.render();
    },

    fitView() {
        if (this.nodes.length === 0) return;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.nodes.forEach(n => {
            minX = Math.min(minX, n.x - 100); maxX = Math.max(maxX, n.x + 100);
            minY = Math.min(minY, n.y - 50); maxY = Math.max(maxY, n.y + 50);
        });
        const r = this.canvas.getBoundingClientRect();
        const w = maxX - minX, h = maxY - minY;
        this.zoom = Math.min(r.width / (w + 100), r.height / (h + 100), 2);
        this.zoom = Math.max(0.3, this.zoom);
        this.pan.x = r.width / 2 - ((minX + maxX) / 2) * this.zoom;
        this.pan.y = r.height / 2 - ((minY + maxY) / 2) * this.zoom;
        document.getElementById('zoomLevel').textContent = Math.round(this.zoom * 100) + '%';
        this.render();
    },

    render() {
        if (!this.ctx) return;
        const c = this.ctx;
        const r = this.canvas.getBoundingClientRect();
        c.clearRect(0, 0, r.width, r.height);
        c.save();
        c.translate(this.pan.x, this.pan.y);
        c.scale(this.zoom, this.zoom);

        // Draw grid
        this.drawGrid(c, r);
        // Draw edges
        this.edges.forEach(e => this.drawEdge(c, e));
        // Draw nodes
        this.nodes.forEach(n => this.drawNode(c, n));

        c.restore();
    },

    drawGrid(c, r) {
        const dark = this.isDark();
        const gridSize = 40;
        const startX = Math.floor(-this.pan.x / this.zoom / gridSize) * gridSize - gridSize;
        const startY = Math.floor(-this.pan.y / this.zoom / gridSize) * gridSize - gridSize;
        const endX = startX + r.width / this.zoom + gridSize * 2;
        const endY = startY + r.height / this.zoom + gridSize * 2;
        c.fillStyle = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
        for (let x = startX; x < endX; x += gridSize) {
            for (let y = startY; y < endY; y += gridSize) {
                c.beginPath(); c.arc(x, y, 1, 0, Math.PI * 2); c.fill();
            }
        }
    },

    drawEdge(c, edge) {
        const from = this.nodes.find(n => n.id === edge.from);
        const to = this.nodes.find(n => n.id === edge.to);
        if (!from || !to) return;
        const dark = this.isDark();
        const isSel = this.selectedEdge && this.selectedEdge.from === edge.from && this.selectedEdge.to === edge.to;
        const fw = (from.type === 'group' ? this.GROUP_W : this.NODE_W) / 2;
        const fh = (from.type === 'group' ? this.GROUP_H : this.NODE_H) / 2;
        const tw = (to.type === 'group' ? this.GROUP_W : this.NODE_W) / 2;
        const th = (to.type === 'group' ? this.GROUP_H : this.NODE_H) / 2;

        // Smart edge points based on relative position
        let x1, y1, x2, y2;
        const dx = to.x - from.x, dy = to.y - from.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            x1 = from.x + (dx > 0 ? fw : -fw); y1 = from.y;
            x2 = to.x + (dx > 0 ? -tw : tw); y2 = to.y;
        } else {
            x1 = from.x; y1 = from.y + (dy > 0 ? fh : -fh);
            x2 = to.x; y2 = to.y + (dy > 0 ? -th : th);
        }
        const cpx = (x1 + x2) / 2, cpy = (y1 + y2) / 2;

        // Line style
        const ls = this.LINE_STYLES.find(s => s.id === (edge.lineStyle || 'dashed'));
        c.setLineDash(ls ? ls.dash : [6, 4]);
        c.strokeStyle = isSel ? (dark ? '#6C7BFF' : '#5D6BF8') : (dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)');
        c.lineWidth = isSel ? 3 : 2;

        c.beginPath();
        c.moveTo(x1, y1);
        if (Math.abs(dx) > Math.abs(dy)) {
            c.bezierCurveTo(cpx, y1, cpx, y2, x2, y2);
        } else {
            c.bezierCurveTo(x1, cpy, x2, cpy, x2, y2);
        }
        c.stroke();
        c.setLineDash([]);

        // Arrow
        const arrLen = 8;
        const adx = x2 - cpx, ady = y2 - cpy;
        const angle = Math.atan2(ady, adx);
        c.beginPath();
        c.moveTo(x2, y2);
        c.lineTo(x2 - arrLen * Math.cos(angle - 0.4), y2 - arrLen * Math.sin(angle - 0.4));
        c.lineTo(x2 - arrLen * Math.cos(angle + 0.4), y2 - arrLen * Math.sin(angle + 0.4));
        c.closePath();
        c.fillStyle = isSel ? (dark ? '#6C7BFF' : '#5D6BF8') : (dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)');
        c.fill();

        // Bridge icon
        if (edge.bridge) {
            const bx = (x1 + x2) / 2, by = (y1 + y2) / 2;
            c.beginPath(); c.arc(bx, by, 12, 0, Math.PI * 2);
            c.fillStyle = dark ? '#2A2A3E' : '#FFFFFF';
            c.fill();
            c.strokeStyle = dark ? '#6C7BFF' : '#54C8FF';
            c.lineWidth = 2; c.stroke();
            c.font = '12px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillStyle = dark ? '#54C8FF' : '#007AFF';
            c.fillText('⟷', bx, by);
        }

        // Edge label
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const labelY = edge.bridge ? my - 22 : my - 12;
        if (edge.label) {
            c.font = '11px Outfit, sans-serif';
            c.textAlign = 'center'; c.textBaseline = 'middle';
            const tw2 = c.measureText(edge.label).width;
            c.fillStyle = dark ? 'rgba(15,15,18,0.9)' : 'rgba(255,255,255,0.95)';
            c.beginPath();
            const pad = 6;
            c.roundRect(mx - tw2/2 - pad, labelY - 8 - pad/2, tw2 + pad*2, 16 + pad, 8);
            c.fill();
            if (isSel) { c.strokeStyle = dark ? '#6C7BFF' : '#5D6BF8'; c.lineWidth = 1; c.stroke(); }
            c.fillStyle = dark ? '#B0B0D0' : '#555';
            c.fillText(edge.label, mx, labelY);
        }
    },

    drawNode(c, node) {
        const dark = this.isDark();
        const isGroup = node.type === 'group';
        const w = isGroup ? this.GROUP_W : this.NODE_W;
        const h = isGroup ? this.GROUP_H : this.NODE_H;
        const x = node.x - w / 2, y = node.y - h / 2;
        const r = isGroup ? 14 : 12;
        const isSel = this.selected && this.selected.id === node.id;
        const isRoot = !this.edges.some(e => e.to === node.id);

        // Shadow
        if (isSel) {
            c.shadowColor = dark ? 'rgba(108,123,255,0.4)' : 'rgba(93,107,248,0.3)';
            c.shadowBlur = 20;
        } else {
            c.shadowColor = dark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)';
            c.shadowBlur = 10;
        }

        c.beginPath();
        c.roundRect(x, y, w, h, r);

        // Determine fill color
        let fillColor;
        if (node.customColor) {
            fillColor = node.customColor;
        } else if (isRoot) {
            fillColor = dark ? '#2A2A3E' : '#1C1D20';
        } else if (isGroup) {
            const ci = node.color % this.COLORS.group.length;
            fillColor = dark ? this.COLORS.darkGroup[ci] : this.COLORS.group[ci];
        } else {
            const ci = node.color % this.COLORS.node.length;
            fillColor = dark ? this.COLORS.darkNode[ci] : this.COLORS.node[ci];
        }
        c.fillStyle = fillColor;
        c.fill();
        c.shadowBlur = 0;

        // Border
        if (!isRoot && !isGroup) {
            c.strokeStyle = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
            c.lineWidth = 1; c.stroke();
        }
        if (isSel) { c.strokeStyle = '#6C7BFF'; c.lineWidth = 2.5; c.stroke(); }

        // Text color auto-detect (light vs dark bg)
        const isLightBg = this.isLightColor(fillColor);
        const textColor = (isRoot && !node.customColor) ? (dark ? '#E8E8F0' : '#FFFFFF') : (isLightBg ? '#1C1D20' : '#E8E8F0');
        const subColor = isLightBg ? '#888' : '#BBB';

        // Label
        const lines = node.label.split('\n');
        c.font = isRoot ? 'bold 14px Outfit, sans-serif' : 'bold 13px Outfit, sans-serif';
        c.fillStyle = textColor;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        if (lines.length > 1) {
            c.fillText(lines[0], node.x, node.y - 8);
            c.font = '11px Outfit, sans-serif';
            c.fillStyle = subColor;
            c.fillText(lines[1], node.x, node.y + 10);
        } else {
            c.fillText(lines[0], node.x, node.y);
        }

        // Memo indicator
        if (node.memo) {
            c.font = '12px sans-serif';
            c.fillText('📝', x + w - 14, y + 12);
        }
    },

    isLightColor(hex) {
        if (!hex) return true;
        const c = hex.replace('#', '');
        const r = parseInt(c.substr(0,2),16), g = parseInt(c.substr(2,2),16), b = parseInt(c.substr(4,2),16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 128;
    },

    async syncWithGitHub(action = 'upload') {
        const configStr = localStorage.getItem('assetGitHubConfig');
        if (!configStr) return null;
        try {
            const config = JSON.parse(configStr);
            if (!config.token || !config.repo) return null;

            const url = `https://api.github.com/repos/${config.repo}/contents/Asset/data/mindmap.json`;
            const headers = {
                'Authorization': `token ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            };

            if (action === 'download') {
                const res = await fetch(url, { headers });
                if (res.status === 404) return null;
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const json = await res.json();
                const content = decodeURIComponent(escape(atob(json.content)));
                return JSON.parse(content);
            } else if (action === 'upload') {
                let sha = null;
                const getRes = await fetch(url, { headers });
                if (getRes.ok) {
                    const getJson = await getRes.json();
                    sha = getJson.sha;
                }

                this.commitActivePage();
                const contentStr = JSON.stringify(this.store, null, 2);
                const contentEncoded = btoa(unescape(encodeURIComponent(contentStr)));

                const body = {
                    message: 'Auto-sync mindmap data from app',
                    content: contentEncoded
                };
                if (sha) body.sha = sha;

                const putRes = await fetch(url, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(body)
                });

                if (!putRes.ok) throw new Error(`HTTP error! status: ${putRes.status}`);
                
                if (typeof showToast === 'function') {
                    showToast('GitHub 마인드맵 동기화 완료');
                }
                return true;
            }
        } catch (e) {
            console.error('GitHub Sync Error:', e);
            return null;
        }
    },

    save() {
        this.commitActivePage();
        localStorage.setItem('hans_mindmap', JSON.stringify(this.store));
        
        clearTimeout(this.syncTimeout);
        this.syncTimeout = setTimeout(() => {
            this.syncWithGitHub('upload');
        }, 2000);
    },

    migrateData(d) {
        if (!d) return null;
        if (d.version === 2) return d;
        // Migrate from v1
        return {
            version: 2,
            activeId: 1,
            nextPageId: 2,
            pages: [
                {
                    id: 1,
                    title: 'Main Page',
                    nodes: d.nodes || [],
                    edges: d.edges || [],
                    nextId: d.nextId || 1
                }
            ]
        };
    },

    async load() {
        try {
            const raw = localStorage.getItem('hans_mindmap');
            if (raw) {
                const d = this.migrateData(JSON.parse(raw));
                if (d && d.pages) {
                    this.store = d;
                    this.syncActivePage();
                }
            }
            this.renderSidebar();
            this.render();
            
            const configStr = localStorage.getItem('assetGitHubConfig');
            if (configStr) {
                const config = JSON.parse(configStr);
                if (config.token && config.repo) {
                    const ghDataRaw = await this.syncWithGitHub('download');
                    if (ghDataRaw) {
                        const ghData = this.migrateData(ghDataRaw);
                        if (ghData && ghData.pages) {
                            this.store = ghData;
                            this.syncActivePage();
                            localStorage.setItem('hans_mindmap', JSON.stringify(this.store));
                            this.renderSidebar();
                            this.render();
                        }
                    }
                }
            }
        } catch (e) { console.error('MindMap load error:', e); }
    },

    exportJSON() {
        this.commitActivePage();
        const blob = new Blob([JSON.stringify(this.store, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = 'mindmap_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
    },

    importJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const d = this.migrateData(JSON.parse(e.target.result));
                if (d && d.pages) {
                    this.store = d;
                    this.syncActivePage();
                    this.save();
                    this.renderSidebar();
                    this.render();
                    this.fitView();
                }
            } catch (err) { alert('Invalid JSON'); }
        };
        reader.readAsText(file);
    }
};

// Confirm dialog
function showConfirm(msg, onConfirm, infoOnly) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmMsg').textContent = msg;
    modal.style.display = 'flex';
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    if (infoOnly) {
        cancelBtn.style.display = 'none';
        okBtn.textContent = '확인';
        okBtn.onclick = () => { modal.style.display = 'none'; cancelBtn.style.display = ''; okBtn.textContent = '삭제'; };
    } else {
        cancelBtn.style.display = '';
        okBtn.textContent = '삭제';
        okBtn.onclick = () => { modal.style.display = 'none'; if (onConfirm) onConfirm(); };
    }
    cancelBtn.onclick = () => { modal.style.display = 'none'; };
}

// Toolbar actions
function mmAddChild() { if (MM.selected) MM.addChild(MM.selected.id); }
function mmDelete() {
    if (!MM.selected) return;
    const isRoot = !MM.edges.some(e => e.to === MM.selected.id);
    if (isRoot) { showConfirm('최상위 그룹은 삭제할 수 없습니다.', null, true); return; }
    const has = MM.edges.some(e => e.from === MM.selected.id);
    const msg = has ? `"${MM.selected.label}" 및 모든 하위 노드를 삭제하시겠습니까?` : `"${MM.selected.label}"을(를) 삭제하시겠습니까?`;
    const id = MM.selected.id;
    showConfirm(msg, () => MM.deleteNode(id));
}
function mmMemo() { if (MM.selected) MM.openMemo(MM.selected); }
function mmRename() { if (MM.selected) MM.startEditLabel(MM.selected); }
function mmColor() { if (MM.selected) MM.openColorPicker(MM.selected); }
function mmBridge() { MM.toggleBridge(); }
function mmEdgeStyle() { if (MM.selectedEdge) MM.openLineStylePicker(MM.selectedEdge); }
function mmEdgeText() { if (MM.selectedEdge) MM.startEditEdgeLabel(MM.selectedEdge); }
function mmEdgeDelete() {
    if (!MM.selectedEdge) return;
    const edge = MM.selectedEdge;
    // Only allow deleting bridge edges; tree edges deletion via node delete
    if (edge.bridge) {
        showConfirm('이 브릿지 연결을 삭제하시겠습니까?', () => {
            MM.edges = MM.edges.filter(e => !(e.from === edge.from && e.to === edge.to));
            MM.selectedEdge = null; MM.save(); MM.render(); MM.updateToolbar();
        });
    } else {
        showConfirm('트리 연결은 노드 삭제로만 제거할 수 있습니다.', null, true);
    }
}
function mmZoomIn() { MM.setZoom(MM.zoom * 1.2); }
function mmZoomOut() { MM.setZoom(MM.zoom / 1.2); }
function mmFit() { MM.fitView(); }
function mmExport() { MM.exportJSON(); }
function mmImport() { document.getElementById('importFile').click(); }

function showToast(msg) {
    const el = document.getElementById('mmToast');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1'; el.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(-50%) translateY(10px)'; }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
    loadHeader({ title: 'Mind Map', subtitle: 'Visualize your ideas' });
    setTimeout(() => { const ym = document.querySelector('.nav-year-month'); if (ym) ym.style.display = 'none'; }, 100);
    MM.init();
    MM.fitView();
    document.getElementById('importFile')?.addEventListener('change', (e) => {
        if (e.target.files[0]) MM.importJSON(e.target.files[0]);
    });
});

window.toggleMMSidebar = function() {
    const sidebar = document.getElementById('mmSidebar');
    const icon = document.getElementById('mmSidebarIcon');
    if (!sidebar || !icon) return;
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        icon.innerHTML = '<polyline points="9 18 15 12 9 6"/>';
        setTimeout(() => MM.resize(), 310);
    } else {
        icon.innerHTML = '<polyline points="15 18 9 12 15 6"/>';
        setTimeout(() => MM.resize(), 310);
    }
};
