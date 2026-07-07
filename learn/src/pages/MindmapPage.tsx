import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, Trash2,  Maximize, Minimize, Focus,
  Type, ZoomIn, ZoomOut,
  GitBranch, Sparkles, X, Menu, LayoutGrid, StickyNote, CircleDot, Minus, CloudUpload, FileText
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import type { MindmapNode, MindmapPageData, MindmapStore, MindmapEdge } from '../types';

const MM_COLORS = {
  palette: [
    { border: '#FF9F43', text: '#FF9F43', bg: '#FFFFFF' }, 
    { border: '#FF6B8A', text: '#FF6B8A', bg: '#FFFFFF' }, 
    { border: '#8B5CF6', text: '#8B5CF6', bg: '#FFFFFF' }, 
    { border: '#06B6D4', text: '#06B6D4', bg: '#FFFFFF' }, 
    { border: '#10B981', text: '#10B981', bg: '#FFFFFF' }, 
    { border: '#F59E0B', text: '#F59E0B', bg: '#FFFFFF' }, 
    { border: '#E2E8F0', text: '#64748B', bg: '#F8FAFC' },
    { border: '#1E293B', text: '#F8FAFC', bg: '#1E293B' },
  ]
};

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

function Tooltip({ label, children }: TooltipProps) {
  return (
    <div className="group relative flex flex-col items-center">
      {children}
      <div className="absolute top-full mt-2 hidden group-hover:flex flex-col items-center animate-fade-in pointer-events-none z-[200]">
        <div className="w-2 h-1 bg-black/80 [clip-path:polygon(50%_0,0_100%,100%_100%)]" />
        <div className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-2xl">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function MindmapPage() {
  const { data, setMindmap, theme, showToast, syncUp } = useStore();
  const mindmapStore = data.mindmap as MindmapStore;
  const [searchParams, setSearchParams] = useSearchParams();

  const [localMindmap, setLocalMindmap] = useState<MindmapStore>(mindmapStore);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const latestMindmapRef = useRef(localMindmap);
  const isDirtyRef = useRef(false);
  
  useEffect(() => { latestMindmapRef.current = localMindmap; }, [localMindmap]);
  useEffect(() => { isDirtyRef.current = hasUnsavedChanges; }, [hasUnsavedChanges]);

  const [activePageId, setActivePageId] = useState(localMindmap.activeId);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);
  const touchLastCenterRef = useRef<{x: number, y: number} | null>(null);

  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNodeIds, setSelectedNodeIds] = useState<number[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [reconnectingChildId, setReconnectingChildId] = useState<number | null>(null);
  const [reconnectMousePos, setReconnectMousePos] = useState({ x: 0, y: 0 });

  const [editingNodeId, setEditingNodeId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const [isRenamingPage, setIsRenamingPage] = useState<number | null>(null);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activePage = useMemo(() => 
    localMindmap.pages.find(p => p.id === activePageId) || localMindmap.pages[0],
    [localMindmap, activePageId]
  );

  const nodes = activePage.nodes;
  const edges = activePage.edges;
  const isDark = theme === 'dark';

  // Load page state on activePageId change
  useEffect(() => {
    // 모든 디바이스(PC, 모바일, 태블릿)에서 페이지 진입 시 자동으로 한 화면에 꽉 차게 맞춥니다.
    setTimeout(() => fitView(), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId]);

  // URL에서 pageId 및 nodeId를 감지하여 해당 마인드맵 및 노드 위치로 강제 이동 및 포커싱
  useEffect(() => {
    const pageIdStr = searchParams.get('pageId');
    if (pageIdStr) {
      const pId = parseInt(pageIdStr, 10);
      if (!isNaN(pId)) {
        const pageExists = localMindmap.pages.some(p => p.id === pId);
        if (pageExists) {
          setActivePageId(pId);

          const nodeIdStr = searchParams.get('nodeId');
          if (nodeIdStr) {
            const nId = parseInt(nodeIdStr, 10);
            if (!isNaN(nId)) {
              setSelectedNodeIds([nId]);
              
              // 해당 노드의 위치를 찾아 그곳이 화면 중앙으로 오도록 오프셋 조절
              const targetPage = localMindmap.pages.find(p => p.id === pId);
              const targetNode = targetPage?.nodes.find(n => n.id === nId);
              if (targetNode && canvasRef.current) {
                const width = canvasRef.current.clientWidth || window.innerWidth;
                const height = canvasRef.current.clientHeight || window.innerHeight;
                const nz = 1.0; // 줌 배율 100%
                const nx = width / 2 - targetNode.x * nz;
                const ny = height / 2 - targetNode.y * nz;
                setZoom(nz);
                setPan({ x: nx, y: ny });
              }
            }
          }
        }
        
        // 브라우저 리프레시나 히스토리 백 이동 시 팝업 방지를 위해 URL 쿼리 파라미터는 즉시 클리어 처리
        setSearchParams(prev => {
          prev.delete('pageId');
          prev.delete('nodeId');
          return prev;
        }, { replace: true });
      }
    }
  }, [searchParams, localMindmap.pages, setSearchParams]);

  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeIds[0]), [nodes, selectedNodeIds]);

  const toWorld = useCallback((cx: number, cy: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const r = canvasRef.current.getBoundingClientRect();
    return { x: (cx - r.left - pan.x) / zoom, y: (cy - r.top - pan.y) / zoom };
  }, [pan, zoom]);

  const getNodeAt = useCallback((wx: number, wy: number) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const hw = (n._w || 160) / 2;
      const hh = (n._h || 60) / 2;
      if (wx >= n.x - hw && wx <= n.x + hw && wy >= n.y - hh && wy <= n.y + hh) return n;
    }
    return null;
  }, [nodes]);

  const updateLocalStore = useCallback((updatedPage: MindmapPageData) => {
    const newPages = localMindmap.pages.map(p => p.id === updatedPage.id ? updatedPage : p);
    setLocalMindmap({ ...localMindmap, pages: newPages, activeId: activePageId });
    setHasUnsavedChanges(true);
  }, [localMindmap, activePageId]);

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
        showToast('변경된 사항이 없습니다.');
        return;
    }
    // Final sync of current view state before global save
    const finalPage = { ...activePage, zoom, pan };
    const finalMindmap = { ...localMindmap, pages: localMindmap.pages.map(p => p.id === activePageId ? finalPage : p) };
    
    // 로컬 스토어 및 상태 먼저 업데이트
    await setMindmap(finalMindmap);
    
    // 수동 저장(Sync) 실행: 저장 버튼 클릭 시에만 GitHub에 업로드됨
    await syncUp();
    
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    return () => {
      if (isDirtyRef.current) {
        setMindmap(latestMindmapRef.current);
      }
    };
  }, [setMindmap, activePageId]);

  const fitView = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    // Use window dimensions in fullscreen for maximum accuracy
    const width = document.fullscreenElement ? window.innerWidth : canvas.clientWidth;
    const height = document.fullscreenElement ? window.innerHeight : canvas.clientHeight;
    if (width === 0 || height === 0) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      // Estimate size for fitting if not yet rendered
      const w = n._w || 180, h = n._h || 80;
      minX = Math.min(minX, n.x - w/2); maxX = Math.max(maxX, n.x + w/2);
      minY = Math.min(minY, n.y - h/2); maxY = Math.max(maxY, n.y + h/2);
    });

    const padding = 150;
    const contentW = maxX - minX + padding * 2;
    const contentH = maxY - minY + padding * 2;
    
    // Calculate the fit zoom
    let nz = Math.min(width / contentW, height / contentH);
    // Cap at 1.0 for very small maps, but allow shrinking as much as needed
    nz = Math.min(nz, 1.0);
    
    const nx = width / 2 - (minX + maxX) / 2 * nz;
    const ny = height / 2 - (minY + maxY) / 2 * nz;

    setZoom(nz);
    setPan({ x: nx, y: ny });
    updateLocalStore({ ...activePage, zoom: nz, pan: { x: nx, y: ny } });
  }, [nodes, activePage, updateLocalStore]);

  useEffect(() => {
    const handleFsChange = () => { 
      const doc = document as any;
      const isFull = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
      setIsFullscreen(isFull);
      if (isFull) setTimeout(fitView, 500); 
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, [fitView]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    const doc = document as any;
    const isFull = doc.fullscreenElement || doc.webkitFullscreenElement;
    if (!isFull) {
      const el = containerRef.current as any;
      const requestFs = el.requestFullscreen || el.webkitRequestFullscreen;
      if (requestFs) {
        requestFs.call(el).then(() => {
          setTimeout(fitView, 300);
        }).catch((err: any) => {
          showToast(`전체화면 모드 전환 실패: ${err.message}`);
        });
      }
    } else {
      const exitFs = doc.exitFullscreen || doc.webkitExitFullscreen;
      if (exitFs) exitFs.call(doc);
    }
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    
    ctx.save();
    ctx.translate(pan.x, pan.y); ctx.scale(zoom, zoom);

    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
    const gridSize = 50;
    const startX = Math.floor(-pan.x / zoom / gridSize) * gridSize - gridSize;
    const startY = Math.floor(-pan.y / zoom / gridSize) * gridSize - gridSize;
    for (let x = startX; x < startX + width / zoom + gridSize * 2; x += gridSize) {
      for (let y = startY; y < startY + height / zoom + gridSize * 2; y += gridSize) {
        ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
      }
    }

    nodes.forEach(n => {
      ctx.font = 'bold 15px Outfit, sans-serif';
      const lines = n.label.split('\n');
      let maxW = 0; lines.forEach(l => maxW = Math.max(maxW, ctx.measureText(l).width));
      n._w = Math.max(160, maxW + 50);
      n._h = n.type === 'group' ? 70 : Math.max(64, lines.length * 20 + 40);
    });

    edges.forEach(e => {
      const from = nodes.find(n => n.id === e.from);
      const to = nodes.find(n => n.id === e.to);
      if (!from || !to) return;
      let x1 = from.x, y1 = from.y, x2 = to.x, y2 = to.y;
      const fw = (from._w || 160) / 2, fh = (from._h || 60) / 2, tw = (to._w || 160) / 2, th = (to._h || 60) / 2;
      if (to.x > from.x + fw) { x1 += fw; x2 -= tw; } else if (to.x < from.x - fw) { x1 -= fw; x2 += tw; } else if (to.y > from.y + fh) { y1 += fh; y2 -= th; } else { y1 -= fh; y2 += th; }
      const cp1x = (x1 + x2) / 2;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      const c1 = e.customColor || (from.type === 'group' ? '#06b6d4' : MM_COLORS.palette[from.color % 8].border);
      const c2 = e.customColor || MM_COLORS.palette[to.color % 8].border;
      grad.addColorStop(0, c1); grad.addColorStop(1, c2);
      ctx.save(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.bezierCurveTo(cp1x, y1, cp1x, y2, x2, y2);
      let lw = 4;
      if (e.lineStyle === 'dotted') { ctx.setLineDash([2, 4]); lw = 2; }
      else if (e.lineStyle === 'dashed') { ctx.setLineDash([10, 5]); lw = 3; }
      else if (e.lineStyle === 'thick') { lw = 8; }
      ctx.strokeStyle = grad; ctx.lineWidth = lw; ctx.stroke(); ctx.restore();
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF'; ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.2)'; ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = c1; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2); ctx.fill();
    });

    if (reconnectingChildId !== null) {
        const child = nodes.find(n => n.id === reconnectingChildId);
        if (child) {
            ctx.beginPath(); ctx.moveTo(child.x, child.y);
            const cp1x = (child.x + reconnectMousePos.x) / 2;
            ctx.bezierCurveTo(cp1x, child.y, cp1x, reconnectMousePos.y, reconnectMousePos.x, reconnectMousePos.y);
            ctx.strokeStyle = '#06B6D4'; ctx.setLineDash([5, 5]); ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
        }
    }

    nodes.forEach(n => {
      if (editingNodeId === n.id) return;
      const isSel = selectedNodeIds.includes(n.id), isRoot = n.type === 'group', isMemo = n.type === 'memo', isHover = hoveredNodeId === n.id, w = n._w || 160, h = n._h || 60, x = n.x - w/2, y = n.y - h/2;
      const pal = MM_COLORS.palette[n.color % 8];
      ctx.save(); ctx.beginPath();
      if (isMemo) { ctx.roundRect(x, y, w, h, 20); ctx.moveTo(n.x - 10, y + h); ctx.lineTo(n.x, y + h + 10); ctx.lineTo(n.x + 10, y + h); }
      else { ctx.roundRect(x, y, w, h, h/2); }
      if (isRoot) { ctx.fillStyle = n.customBgColor || '#2D334A'; if(isSel || isHover) { ctx.shadowColor = 'rgba(6, 182, 212, 0.8)'; ctx.shadowBlur = 25; } else { ctx.shadowColor = 'rgba(6, 182, 212, 0.4)'; ctx.shadowBlur = 15; } ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = n.customBorderColor || '#06B6D4'; ctx.lineWidth = (isSel || isHover) ? 7 : 4; ctx.stroke(); }
      else { ctx.fillStyle = n.customBgColor || (isDark ? '#1E293B' : pal.bg); ctx.fill(); ctx.strokeStyle = n.customBorderColor || pal.border; ctx.lineWidth = (isSel || isHover) ? 6 : 3; if (isSel || isHover) { ctx.shadowColor = (n.customBorderColor || pal.border) + '99'; ctx.shadowBlur = 20; } ctx.stroke(); }
      ctx.font = 'bold 15px Outfit, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = isRoot ? '#FFFFFF' : (n.customColor || pal.text);
      const lines = n.label.split('\n'); lines.forEach((l, i) => { ctx.fillText(l, n.x, n.y + (i - (lines.length-1)/2) * 20); });
      if (n.memo && !isMemo) { ctx.font = '12px sans-serif'; ctx.fillText('📝', x + w - 18, y + 18); }
      ctx.restore();
    });
    ctx.restore();
    if (isSelecting) {
        ctx.strokeStyle = '#06B6D4'; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
        const sx = selectionStart.x, sy = selectionStart.y, ex = selectionEnd.x, ey = selectionEnd.y;
        ctx.beginPath(); ctx.rect(sx, sy, ex - sx, ey - sy); ctx.fill(); ctx.stroke();
    }
  }, [pan, zoom, nodes, edges, selectedNodeIds, isDark, isSelecting, selectionStart, selectionEnd, editingNodeId, hoveredNodeId, reconnectingChildId, reconnectMousePos]);

  const addChild = useCallback(() => {
    if (selectedNodeIds.length === 0) return;
    const parentId = selectedNodeIds[0]; const parent = nodes.find(n => n.id === parentId); if (!parent) return;
    const nid = activePage.nextId; const side = nodes.filter(n => edges.some(e => e.from === parent.id && e.to === n.id)).length % 2 === 0 ? 1 : -1;
    const newNode: MindmapNode = { id: nid, type: 'node', label: 'New Topic', x: parent.x + (side * 240), y: parent.y + (nodes.filter(n => edges.some(e => e.from === parent.id && e.to === n.id)).length * 40) - 80, color: (parent.color + 1) % 6 };
    updateLocalStore({ ...activePage, nodes: [...nodes, newNode], edges: [...edges, { from: parent.id, to: nid }], nextId: nid + 1 });
    setSelectedNodeIds([nid]);
  }, [selectedNodeIds, nodes, edges, activePage, updateLocalStore]);

  const addMainGroup = () => {
    const nid = activePage.nextId; 
    const canvas = canvasRef.current;
    const width = canvas?.clientWidth || 0;
    const height = canvas?.clientHeight || 0;
    const wx = width ? (width / 2 - pan.x) / zoom : 0, wy = height ? (height / 2 - pan.y) / zoom : 0;
    const newNode: MindmapNode = { id: nid, type: 'group', label: 'Main Group', x: wx, y: wy, color: 0 };
    updateLocalStore({ ...activePage, nodes: [...nodes, newNode], nextId: nid + 1 }); setSelectedNodeIds([nid]);
  };

  const addFloatingMemo = () => {
    const nid = activePage.nextId; 
    const canvas = canvasRef.current;
    const width = canvas?.clientWidth || 0;
    const height = canvas?.clientHeight || 0;
    const wx = width ? (width / 2 - pan.x) / zoom : 0, wy = height ? (height / 2 - pan.y) / zoom : 0;
    const newNode: MindmapNode = { id: nid, type: 'memo', label: 'New Memo Bubble', x: wx, y: wy, color: 6 };
    updateLocalStore({ ...activePage, nodes: [...nodes, newNode], nextId: nid + 1 }); setSelectedNodeIds([nid]);
  };

  const deleteSelected = useCallback(() => {
    if (selectedNodeIds.length === 0) return;
    const toRemoveSet = new Set<number>(); const collect = (id: number) => { toRemoveSet.add(id); edges.filter(e => e.from === id).forEach(e => collect(e.to)); };
    selectedNodeIds.forEach(id => collect(id)); const toRemove = Array.from(toRemoveSet); const newNodes = nodes.filter(n => !toRemove.includes(n.id));
    if (newNodes.length === 0) return; updateLocalStore({ ...activePage, nodes: newNodes, edges: edges.filter(e => !toRemove.includes(e.from) && !toRemove.includes(e.to)) });
    setSelectedNodeIds([]); setIsSidebarOpen(false);
  }, [selectedNodeIds, edges, activePage, nodes, updateLocalStore]);

  const handleRenameSubmit = () => {
    if (isRenamingPage === null) return;
    const nps = localMindmap.pages.map(p => p.id === isRenamingPage ? { ...p, title: newPageTitle || p.title } : p);
    setLocalMindmap({ ...localMindmap, pages: nps }); setIsRenamingPage(null); setHasUnsavedChanges(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editingNodeId !== null) return;
    const r = canvasRef.current?.getBoundingClientRect(); if (!r) return;
    const cx = e.clientX - r.left, cy = e.clientY - r.top, w = toWorld(e.clientX, e.clientY);
    for (const edge of edges) {
        const from = nodes.find(n => n.id === edge.from), to = nodes.find(n => n.id === edge.to);
        if (from && to) {
            let x1 = from.x, y1 = from.y, x2 = to.x, y2 = to.y;
            const fw = (from._w || 160) / 2, fh = (from._h || 60) / 2, tw = (to._w || 160) / 2, th = (to._h || 60) / 2;
            if (to.x > from.x + fw) { x1 += fw; x2 -= tw; } else if (to.x < from.x - fw) { x1 -= fw; x2 += tw; } else if (to.y > from.y + fh) { y1 += fh; y2 -= th; } else { y1 -= fh; y2 += th; }
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            const dist = Math.sqrt((w.x - mx) ** 2 + (w.y - my) ** 2);
            if (dist < 25 / zoom) { setReconnectingChildId(to.id); setReconnectMousePos({ x: w.x, y: w.y }); return; }
        }
    }
    const node = getNodeAt(w.x, w.y);
    if (e.button === 1 || (e.button === 0 && e.altKey)) { setIsPanning(true); setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); return; }
    if (node) {
      if (e.shiftKey) setSelectedNodeIds(prev => prev.includes(node.id) ? prev.filter(id => id !== node.id) : [...prev, node.id]);
      else if (!selectedNodeIds.includes(node.id)) setSelectedNodeIds([node.id]);
      setDraggingNodeId(node.id); setDragOffset({ x: w.x, y: w.y });
    } else {
      if (e.shiftKey) {
        setIsSelecting(true); setSelectionStart({ x: cx, y: cy }); setSelectionEnd({ x: cx, y: cy });
        setSelectedNodeIds([]);
      } else {
        setIsPanning(true); setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        setSelectedNodeIds([]);
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const w = toWorld(e.clientX, e.clientY); const node = getNodeAt(w.x, w.y);
    if (node) { setEditingNodeId(node.id); setEditValue(node.label); setSelectedNodeIds([node.id]); }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const r = canvasRef.current?.getBoundingClientRect(); if (!r) return;
    const cx = e.clientX - r.left, cy = e.clientY - r.top, w = toWorld(e.clientX, e.clientY);
    if (isPanning) { setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); }
    else if (isSelecting) { setSelectionEnd({ x: cx, y: cy }); }
    else if (reconnectingChildId !== null) {
        setReconnectMousePos({ x: w.x, y: w.y });
        const hoverNode = getNodeAt(w.x, w.y);
        if (hoverNode && hoverNode.id !== reconnectingChildId) setHoveredNodeId(hoverNode.id);
        else setHoveredNodeId(null);
    }
    else if (draggingNodeId !== null) {
      const dx = w.x - dragOffset.x, dy = w.y - dragOffset.y;
      const hoverNode = getNodeAt(w.x, w.y);
      if (hoverNode && hoverNode.id !== draggingNodeId && !selectedNodeIds.includes(hoverNode.id)) {
          const isDescendant = (parent: number, target: number): boolean => {
              const children = edges.filter(e => e.from === parent).map(e => e.to);
              if (children.includes(target)) return true;
              return children.some(c => isDescendant(c, target));
          };
          if (!isDescendant(draggingNodeId, hoverNode.id)) setHoveredNodeId(hoverNode.id);
          else setHoveredNodeId(null);
      } else setHoveredNodeId(null);
      updateLocalStore({ ...activePage, nodes: nodes.map(n => selectedNodeIds.includes(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n) });
      setDragOffset({ x: w.x, y: w.y });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting) {
      const r = canvasRef.current?.getBoundingClientRect(); if (r) {
        const w1 = toWorld(selectionStart.x + r.left, selectionStart.y + r.top), w2 = toWorld(selectionEnd.x + r.left, selectionEnd.y + r.top);
        const minX = Math.min(w1.x, w2.x), maxX = Math.max(w1.x, w2.x), minY = Math.min(w1.y, w2.y), maxY = Math.max(w1.y, w2.y);
        const inRect = nodes.filter(n => n.x >= minX && n.x <= maxX && n.y >= minY && n.y <= maxY).map(n => n.id);
        setSelectedNodeIds(prev => Array.from(new Set([...prev, ...inRect])));
      }
    }
    if (reconnectingChildId !== null) {
        if (hoveredNodeId !== null) {
            let newEdges = [...edges];
            const idx = newEdges.findIndex(e => e.to === reconnectingChildId);
            if (idx !== -1) newEdges[idx] = { ...newEdges[idx], from: hoveredNodeId };
            else newEdges.push({ from: hoveredNodeId, to: reconnectingChildId });
            updateLocalStore({ ...activePage, edges: newEdges });
            showToast('연결선이 재설정되었습니다.');
        }
        setReconnectingChildId(null);
    }
    else if (draggingNodeId !== null && hoveredNodeId !== null) {
        let newEdges = [...edges];
        selectedNodeIds.forEach(sid => {
            const idx = newEdges.findIndex(e => e.to === sid);
            if (idx !== -1) newEdges[idx] = { ...newEdges[idx], from: hoveredNodeId };
            else newEdges.push({ from: hoveredNodeId, to: sid });
        });
        updateLocalStore({ ...activePage, edges: newEdges });
        showToast('연결이 변경되었습니다.');
    }
    setIsPanning(false); setIsSelecting(false); setDraggingNodeId(null); setHoveredNodeId(null);
    // Persist current pan/zoom state on mouse up
    updateLocalStore({ ...activePage, zoom, pan });
  };

  const handleWheel = (e: React.WheelEvent) => {
    const d = e.deltaY > 0 ? 0.9 : 1.1; const nz = Math.max(0.1, Math.min(4, zoom * d));
    const r = canvasRef.current?.getBoundingClientRect(); if (!r) return;
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const newPan = { x: mx - (mx - pan.x) * (nz / zoom), y: my - (my - pan.y) * (nz / zoom) };
    setPan(newPan); setZoom(nz);
    // Persist current pan/zoom state on zoom
    updateLocalStore({ ...activePage, zoom: nz, pan: newPan });
  };

  const updateSelectedNodesProperty = (key: keyof MindmapNode, value: any) => {
      updateLocalStore({ ...activePage, nodes: nodes.map(n => selectedNodeIds.includes(n.id) ? { ...n, [key]: value } : n) });
  };

  const updateSelectedEdgesProperty = (key: keyof MindmapEdge, value: any) => {
      updateLocalStore({ ...activePage, edges: edges.map(e => selectedNodeIds.includes(e.to) ? { ...e, [key]: value } : e) });
  };

  const saveEdit = () => {
      if (editingNodeId !== null) {
          const trimmed = editValue.trim();
          updateLocalStore({ ...activePage, nodes: nodes.map(n => n.id === editingNodeId ? { ...n, label: trimmed || n.label } : n) });
          setEditingNodeId(null);
      }
  };

  const getDistance = (touches: React.TouchList) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  const getCenter = (touches: React.TouchList) => ({ x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchStartDistRef.current = getDistance(e.touches);
      touchStartZoomRef.current = zoom;
      touchLastCenterRef.current = getCenter(e.touches);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const w = toWorld(touch.clientX, touch.clientY);
      const node = getNodeAt(w.x, w.y);
      if (node) {
        if (!selectedNodeIds.includes(node.id)) setSelectedNodeIds([node.id]);
        setDraggingNodeId(node.id); setDragOffset({ x: w.x, y: w.y });
      } else {
        setIsPanning(true); setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y }); setSelectedNodeIds([]);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      if (touchStartDistRef.current !== null && touchLastCenterRef.current !== null) {
        const newDist = getDistance(e.touches);
        const center = getCenter(e.touches);
        const scale = newDist / touchStartDistRef.current;
        const nz = Math.max(0.1, Math.min(4, touchStartZoomRef.current * scale));
        const r = canvasRef.current?.getBoundingClientRect();
        if (r) {
           const mx = center.x - r.left, my = center.y - r.top;
           const dx = center.x - touchLastCenterRef.current.x, dy = center.y - touchLastCenterRef.current.y;
           setPan({ x: mx - (mx - pan.x - dx) * (nz / zoom), y: my - (my - pan.y - dy) * (nz / zoom) });
           setZoom(nz);
           touchLastCenterRef.current = center;
        }
      }
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const w = toWorld(touch.clientX, touch.clientY);
      if (isPanning) { setPan({ x: touch.clientX - panStart.x, y: touch.clientY - panStart.y }); }
      else if (draggingNodeId !== null) {
        const dx = w.x - dragOffset.x, dy = w.y - dragOffset.y;
        updateLocalStore({ ...activePage, nodes: nodes.map(n => selectedNodeIds.includes(n.id) ? { ...n, x: n.x + dx, y: n.y + dy } : n) });
        setDragOffset({ x: w.x, y: w.y });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) { touchStartDistRef.current = null; touchLastCenterRef.current = null; }
    if (e.touches.length === 0) { setIsPanning(false); setDraggingNodeId(null); updateLocalStore({ ...activePage, zoom, pan }); }
  };

  useEffect(() => {
    const hk = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'Tab') { e.preventDefault(); addChild(); } else if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
    };
    window.addEventListener('keydown', hk); return () => window.removeEventListener('keydown', hk);
  }, [addChild, deleteSelected]);

  useEffect(() => { render(); }, [render]);

  return (
    <div className="mx-4 sm:mx-0 flex h-[calc(100vh-120px)] bg-bg-primary rounded-3xl overflow-hidden shadow-2xl border border-border animate-fade-in relative transition-all duration-300">
      {/* Sidebar Overlay for Mobile */}
      {!isSidebarCollapsed && (
        <div className="fixed inset-0 z-[100] bg-black/10 backdrop-blur-sm sm:hidden" onClick={() => setIsSidebarCollapsed(true)} />
      )}

      <aside className={`
        bg-bg-secondary/50 backdrop-blur-xl border-r border-border flex flex-col space-y-6 overflow-y-auto transition-all duration-500
        ${isSidebarCollapsed 
          ? 'w-0 p-0 opacity-0 pointer-events-none sm:w-20 sm:p-4 sm:opacity-100 sm:pointer-events-auto' 
          : 'fixed inset-y-0 left-0 z-[110] w-72 p-4 sm:relative sm:inset-auto sm:z-auto sm:opacity-100 sm:pointer-events-auto shadow-2xl sm:shadow-none'
        }
      `}>
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isSidebarCollapsed && <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Mindmaps</span>}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2.5 rounded-xl hover:bg-bg-card text-text-secondary hover:text-accent shadow-sm hidden sm:flex"><Menu size={20} /></button>
          {!isSidebarCollapsed && <button onClick={() => setIsSidebarCollapsed(true)} className="p-2.5 rounded-xl hover:bg-bg-card text-text-secondary sm:hidden"><X size={20} /></button>}
        </div>
        <div className="space-y-4">
          <div className={`flex items-center px-2 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest"><LayoutGrid size={16} className="text-accent" />{!isSidebarCollapsed && <span>All Maps</span>}</div>
            {!isSidebarCollapsed && <button onClick={() => { const nid = localMindmap.nextPageId; const np: MindmapPageData = { id: nid, title: `Map ${nid}`, nodes: [{ id: 1, type: 'group', label: 'Main Goal', x: 0, y: 0, color: 0 }], edges: [], nextId: 2 }; setLocalMindmap({ ...localMindmap, pages: [...localMindmap.pages, np], nextPageId: nid + 1, activeId: nid }); setActivePageId(nid); setHasUnsavedChanges(true); }} className="p-1 hover:bg-accent/10 rounded-lg text-accent"><Plus size={16} /></button>}
          </div>
          <div className="space-y-1">{localMindmap.pages.map(p => (
            <div key={p.id} className="group relative px-1"><button onClick={() => setActivePageId(p.id)} className={`w-full flex items-center px-3 py-3 rounded-2xl font-bold transition-all ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} ${activePageId === p.id ? 'bg-accent/10 text-accent shadow-sm' : 'text-text-secondary hover:bg-bg-card'}`} title={p.title}><div className="flex items-center gap-3 min-w-0"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: MM_COLORS.palette[p.id % 8].border }} />{!isSidebarCollapsed && <span className="truncate">{p.title}</span>}</div></button>
            {!isSidebarCollapsed && <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); setIsRenamingPage(p.id); setNewPageTitle(p.title); }} className="p-1 hover:bg-accent/10 rounded-lg text-accent"><Type size={14} /></button><button onClick={(e) => { e.stopPropagation(); if (localMindmap.pages.length > 1) { setLocalMindmap({ ...localMindmap, pages: localMindmap.pages.filter(x => x.id !== p.id), activeId: localMindmap.pages[0].id }); setHasUnsavedChanges(true); } }} className="p-1 hover:bg-red-500/10 rounded-lg text-red-500"><Trash2 size={14} /></button></div>}</div>
          ))}</div>
        </div>
      </aside>

      <div className="flex-1 relative bg-bg-card/20 overflow-hidden flex flex-col" ref={containerRef}>
        {/* Main Toolbar (Always Visible) */}
        <div className="relative z-50 flex items-center justify-between px-4 py-2 bg-bg-card/95 backdrop-blur-xl border-b border-border shadow-sm min-h-[56px] w-full">
          <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pl-2 sm:pl-0">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 mr-2 rounded-xl hover:bg-bg-card text-text-secondary sm:hidden flex-shrink-0"><Menu size={18} /></button>
            <Tooltip label="메인 그룹 추가"><button onClick={addMainGroup} className="p-2 rounded-xl hover:bg-cyan-500/10 text-cyan-500 flex-shrink-0"><CircleDot size={18} /></button></Tooltip>
            <Tooltip label="메모 추가"><button onClick={addFloatingMemo} className="p-2 rounded-xl hover:bg-amber-500/10 text-amber-500 flex-shrink-0"><StickyNote size={18} /></button></Tooltip>
            <div className="w-px h-5 bg-border mx-1 flex-shrink-0" />
            <Tooltip label="하위 노드 추가 (Tab)"><button onClick={addChild} disabled={selectedNodeIds.length === 0} className="p-2 rounded-xl hover:bg-accent/10 text-text-secondary disabled:opacity-30 flex-shrink-0"><GitBranch size={18} /></button></Tooltip>
            <Tooltip label="AI 생성"><button onClick={() => showToast('AI 구성 중...')} className="p-2 rounded-xl hover:bg-purple-500/10 text-purple-500 flex-shrink-0 hidden sm:block"><Sparkles size={18} /></button></Tooltip>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <Tooltip label="확대"><button onClick={() => setZoom(z => Math.min(4, z * 1.2))} className="p-1.5 text-text-secondary hidden sm:block"><ZoomIn size={16} /></button></Tooltip>
            <Tooltip label="축소"><button onClick={() => setZoom(z => Math.max(0.1, z * 0.8))} className="p-1.5 text-text-secondary hidden sm:block"><ZoomOut size={16} /></button></Tooltip>
            <Tooltip label="화면에 맞추기"><button onClick={fitView} className="p-1.5 text-text-secondary hover:text-accent transition-colors"><Focus size={16} /></button></Tooltip>
            <Tooltip label={isFullscreen ? "전체화면 닫기" : "전체화면"}><button onClick={toggleFullscreen} className={`p-1.5 transition-colors ${isFullscreen ? 'text-accent' : 'text-text-secondary hover:text-accent'}`}>{isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}</button></Tooltip>
            <div className="w-px h-5 bg-border mx-1" />
            <Tooltip label="저장 (GitHub 서버)"><button onClick={handleSave} className={`p-2 rounded-xl transition-all ${hasUnsavedChanges ? 'bg-accent text-white shadow-lg animate-pulse' : 'hover:bg-accent/10 text-accent'}`}><CloudUpload size={18} /></button></Tooltip>
            <Tooltip label="삭제 (Del)"><button onClick={deleteSelected} disabled={selectedNodeIds.length === 0} className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 disabled:opacity-30"><Trash2 size={18} /></button></Tooltip>
          </div>
        </div>

        {/* Contextual Properties (Floating precisely below Toolbar) */}
        <div className={`absolute left-0 right-0 z-40 transition-all duration-300 ease-out flex justify-center w-full px-2 mt-2 pointer-events-none ${selectedNodeIds.length > 0 ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`} style={{ top: '56px' }}>
          <div className="flex items-center gap-2 p-1.5 bg-bg-card/95 backdrop-blur-md border border-border shadow-xl rounded-2xl pointer-events-auto max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1.5 px-1 flex-shrink-0">
              {MM_COLORS.palette.map((c, i) => (
                <button key={i} onClick={() => { updateSelectedNodesProperty('customBorderColor', c.border); updateSelectedEdgesProperty('customColor', c.border); }} className="w-6 h-6 rounded-full border-[3px] hover:scale-110 transition-transform shadow-sm" style={{ borderColor: c.border }} />
              ))}
            </div>
            <div className="w-px h-6 bg-border flex-shrink-0" />
            <div className="flex items-center gap-1 flex-shrink-0">
              {[
                { id: 'solid', icon: <Minus size={16} className="stroke-[2px]" /> },
                { id: 'thick', icon: <Minus size={16} className="stroke-[4px]" /> },
                { id: 'dashed', icon: <div className="w-5 h-0.5 border-b-2 border-dashed border-current" /> },
                { id: 'dotted', icon: <div className="w-4 h-0.5 border-b-2 border-dotted border-current" /> }
              ].map(s => (
                <button key={s.id} onClick={() => updateSelectedEdgesProperty('lineStyle', s.id)} className={`p-2 rounded-xl transition-all ${edges.find(e => selectedNodeIds.includes(e.to))?.lineStyle === s.id ? 'bg-accent text-white shadow-md' : 'hover:bg-accent/10 text-text-secondary'}`}>{s.icon}</button>
              ))}
            </div>
            <div className="w-px h-6 bg-border flex-shrink-0" />
            <Tooltip label="메모 상세보기"><button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-xl hover:bg-accent/10 text-text-secondary flex-shrink-0"><FileText size={18} /></button></Tooltip>
          </div>
        </div>

        <div className="flex-1 relative">
          <canvas ref={canvasRef} onMouseDown={handleMouseDown} onDoubleClick={handleDoubleClick} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchEnd} className="w-full h-full cursor-crosshair touch-none" />
          
          {/* Memo Tooltip on Hover */}
          {hoveredNodeId !== null && nodes.find(n => n.id === hoveredNodeId)?.memo && (
            <div 
              className="absolute z-[200] pointer-events-none animate-fade-in"
              style={{
                left: (nodes.find(n => n.id === hoveredNodeId)!.x * zoom + pan.x),
                top: (nodes.find(n => n.id === hoveredNodeId)!.y * zoom + pan.y + 40),
              }}
            >
              <div className="bg-bg-card/95 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-2xl max-w-xs -translate-x-1/2 relative">
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-bg-card border-t border-l border-border rotate-45" />
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                  <FileText size={14} className="text-accent" />
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Detail Memo</span>
                </div>
                <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap break-words">
                  {nodes.find(n => n.id === hoveredNodeId)?.memo}
                </p>
              </div>
            </div>
          )}

          {/* Status Badge removed as per user request (Toolbar icon already shows status) */}
          <div className="absolute bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-xl">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Zoom</span>
            <span className="text-xs font-black text-text-secondary w-10 text-right">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Inline Editor */}
          {editingNodeId !== null && (
              <div className="absolute z-[150] pointer-events-none" style={{ left: 0, top: 0, width: '100%', height: '100%' }}>
                  {nodes.filter(n => n.id === editingNodeId).map(n => {
                      const r = canvasRef.current?.getBoundingClientRect(); if (!r) return null;
                      const left = n.x * zoom + pan.x, top = (n.y - (n._h || 64)/2) * zoom + pan.y, w = (n._w || 160) * zoom, h = (n._h || 64) * zoom;
                      return (
                          <textarea key={n.id} autoFocus className="absolute p-2 bg-bg-primary text-text-primary border-2 border-accent rounded-xl shadow-2xl outline-none text-center pointer-events-auto resize-none overflow-hidden" style={{ left: left - w/2, top: top, width: w, height: h, fontSize: `${15 * zoom}px`, fontWeight: 'bold' }} value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); } if (e.key === 'Escape') setEditingNodeId(null); }} />
                      );
                  })}
              </div>
          )}
        </div>

        {/* Floating Detail Memo Sidebar (Optional Overlay) */}
        <div className={`absolute top-20 right-4 z-[100] w-80 bg-bg-card/95 backdrop-blur-2xl border border-border rounded-[40px] shadow-2xl transition-all duration-500 ${isSidebarOpen && selectedNodeIds.length > 0 ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}>
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center"><h3 className="text-xs font-black text-text-muted uppercase tracking-widest">Detail Memo</h3><button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-bg-card rounded-xl text-text-muted"><X size={16} /></button></div>
            <textarea value={selectedNode?.memo || ''} onChange={(e) => updateSelectedNodesProperty('memo', e.target.value)} placeholder="상세 내용을 입력하세요..." className="w-full h-64 bg-bg-primary border border-border rounded-2xl px-5 py-4 text-sm outline-none resize-none focus:border-accent transition-colors" />
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold italic"><FileText size={12} /> 노드의 상세 내용을 저장합니다.</div>
          </div>
        </div>
      </div>

      {isRenamingPage !== null && (
        <div className="absolute inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="bg-bg-card p-8 rounded-[40px] border border-border shadow-2xl w-80">
            <h3 className="text-xs font-black text-text-muted uppercase tracking-widest mb-6">Rename Map</h3>
            <input autoFocus type="text" value={newPageTitle} onChange={e => setNewPageTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRenameSubmit()} className="w-full bg-bg-primary border border-border rounded-2xl px-6 py-4 text-sm outline-none focus:border-accent mb-6" />
            <div className="flex justify-end gap-3"><button onClick={() => setIsRenamingPage(null)} className="px-6 py-3 rounded-2xl text-sm font-bold text-text-muted">Cancel</button><button onClick={handleRenameSubmit} className="px-8 py-3 rounded-2xl bg-accent text-white text-sm font-bold shadow-xl shadow-accent/20">Rename</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
