/**
 * Shared Header Loader and Utilities
 */

async function loadHeader(config) {
    try {
        const response = await fetch('header.html');
        const html = await response.text();
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            headerPlaceholder.innerHTML = html;
            
            // Set dynamic content
            if (config.title) document.getElementById('pageTitle').innerText = config.title;
            if (config.subtitle) document.getElementById('pageSubtitle').innerText = config.subtitle;
            
            // Set buttons
            const buttonsContainer = document.getElementById('headerButtons');
            if (config.buttons && buttonsContainer) {
                buttonsContainer.innerHTML = config.buttons.map(btn => `
                    <button class="${btn.class}" onclick="${btn.onclick}">${btn.text}</button>
                `).join('');
            }

            // Set active menu
            const currentPage = window.location.pathname.split('/').pop() || 'asset.html';
            if (currentPage.includes('asset.html')) {
                document.getElementById('menu-home')?.classList.add('border-b-2', 'border-orange-500');
                document.getElementById('menu-home')?.style.setProperty('color', '#666666', 'important');
            } else if (currentPage.includes('installment.html')) {
                document.getElementById('menu-card')?.classList.add('border-b-2', 'border-orange-500');
                document.getElementById('menu-card')?.style.setProperty('color', '#666666', 'important');
            } else if (currentPage.includes('mindmap.html')) {
                document.getElementById('menu-mindmap')?.classList.add('border-b-2', 'border-orange-500');
                document.getElementById('menu-mindmap')?.style.setProperty('color', '#666666', 'important');
            }

            // Initialize selectors if they exist in the page
            if (typeof initSelectors === 'function') {
                initSelectors();
            }
        }
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

function toggleDashboardMenu() {
    const menu = document.getElementById('dashboardMenu');
    if (!menu) return;
    
    const isOpen = menu.style.width !== '0px' && menu.style.width !== '';
    if (isOpen) {
        menu.style.width = '0px';
        menu.style.opacity = '0';
        menu.style.pointerEvents = 'none';
        menu.style.padding = '0';
    } else {
        menu.style.width = 'auto';
        menu.style.opacity = '1';
        menu.style.pointerEvents = 'auto';
        menu.style.padding = '0 0.5rem';
    }
}

function closeDashboardMenu() {
    const menu = document.getElementById('dashboardMenu');
    if (menu) {
        menu.style.width = '0px';
        menu.style.opacity = '0';
        menu.style.pointerEvents = 'none';
        menu.style.padding = '0';
    }
}

function goToPage(url) {
    if (url.includes('mindmap.html')) {
        location.href = url;
        return;
    }
    const y = document.getElementById('yearSelect')?.value || new Date().getFullYear();
    const m = (document.getElementById('monthSelect')?.value || (new Date().getMonth() + 1)).toString().padStart(2, '0');
    location.href = `${url}?y=${y}&m=${m}`;
}

function openGlobalModal(type) {
    const isAssetPage = window.location.pathname.includes('asset.html') || window.location.pathname.endsWith('/');
    
    if (isAssetPage) {
        if (type === 'github' && typeof openGitHubModal === 'function') openGitHubModal();
        else if (type === 'data' && typeof openDataManageModal === 'function') openDataManageModal();
        else if (type === 'manual' && typeof openManualModal === 'function') openManualModal();
        else if (type === 'account' && typeof openAccountModal === 'function') openAccountModal();
    } else {
        // Navigate to asset.html with action parameter
        const y = document.getElementById('yearSelect')?.value || new Date().getFullYear();
        const m = (document.getElementById('monthSelect')?.value || (new Date().getMonth() + 1)).toString().padStart(2, '0');
        location.href = `asset.html?y=${y}&m=${m}&action=${type}`;
    }
}

function globalLogout() {
    if (typeof logout === 'function') {
        logout();
    } else {
        sessionStorage.removeItem('temp_master_pw');
        location.href = 'asset.html';
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

function updateThemeUI(isDark) {
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerText = isDark ? '☀️' : '🌙';
}

// Initial theme check
(function() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
})();

// Background GitHub Auto-Sync (Option B)
let autoSyncTimeout = null;
async function backgroundGitHubSync() {
    const config = JSON.parse(localStorage.getItem('assetGitHubConfig') || '{}');
    if (!config.token || !config.repo) return; // GitHub not configured

    // Debounce to prevent hitting API limits on rapid saves
    if (autoSyncTimeout) clearTimeout(autoSyncTimeout);
    
    autoSyncTimeout = setTimeout(async () => {
        try {
            const yearKey = typeof getYearKey === 'function' ? getYearKey() : null;
            if (!yearKey) return;
            
            const yearDataStr = localStorage.getItem(yearKey);
            if (!yearDataStr) return;

            const filePath = `Asset/data/${yearKey}.json`;
            const url = `https://api.github.com/repos/${config.repo}/contents/${filePath}?ref=${config.branch}`;
            const headers = {
                'Authorization': `token ${config.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            };

            // 1. Get current SHA
            let sha = null;
            const checkRes = await fetch(url, { headers });
            if (checkRes.ok) {
                const checkJson = await checkRes.json();
                sha = checkJson.sha;
            }

            // 2. Push to GitHub
            const body = {
                message: `Auto-sync: Update ${yearKey} from ${window.location.pathname.split('/').pop()}`,
                content: btoa(unescape(encodeURIComponent(yearDataStr))),
                branch: config.branch
            };
            if (sha) body.sha = sha;

            const putRes = await fetch(url, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body)
            });

            if (putRes.ok) {
                console.log("[AutoSync] GitHub Sync Success!");
                showAutoSyncToast();
            } else {
                const err = await putRes.json();
                console.error("[AutoSync] GitHub Sync Error:", err);
            }
        } catch (e) {
            console.error("[AutoSync] Exception:", e);
        }
    }, 2000); // 2초 디바운싱
}

function showAutoSyncToast() {
    const existing = document.getElementById('autoSyncToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'autoSyncToast';
    toast.style.cssText = `position:fixed; bottom:20px; right:20px; background:rgba(0,0,0,0.8); color:white; padding:8px 16px; border-radius:20px; font-size:0.8rem; z-index:10000; animation: fadeOut 3s forwards; pointer-events:none; display:flex; align-items:center; gap:6px;`;
    toast.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg> GitHub 자동 저장됨`;
    
    // Add fadeOut animation if not exists
    if (!document.getElementById('toastKeyframes')) {
        const style = document.createElement('style');
        style.id = 'toastKeyframes';
        style.innerHTML = `@keyframes fadeOut { 0% { opacity: 1; transform: translateY(0); } 70% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(10px); } }`;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}
