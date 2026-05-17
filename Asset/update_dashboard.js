const fs = require('fs');

let html = fs.readFileSync('asset.html', 'utf8');

// Replace the dashboard navigation
const oldNavStart = '<nav class="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">';
const newNavHTML = `
        <nav class="landing-nav" style="padding: 0 0 2rem 0; margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border);">
            <div class="logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 22H22L12 2Z" stroke="#1C1D20" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M12 10L7 20H17L12 10Z" fill="#5D6BF8"/>
                </svg>
                Asset Manager
            </div>
            
            <div class="flex items-center gap-2 bg-leo-lightgray/40 rounded-full px-5 py-2" style="background: var(--glass-bg); border: 1px solid var(--glass-border);">
                <select id="yearSelect" class="bg-transparent font-bold text-lg md:text-xl text-leo-dark focus:outline-none appearance-none cursor-pointer pr-2"></select>
                <span class="font-bold text-xl text-leo-gray">/</span>
                <select id="monthSelect" class="bg-transparent font-bold text-lg md:text-xl text-leo-dark focus:outline-none appearance-none cursor-pointer pl-2 pr-4"></select>
            </div>

            <ul>
                <li><a href="#" onclick="openInstallmentModal()">CARD</a></li>
                <li><a href="#" onclick="manualCarryOver()">COPY</a></li>
                <li><a href="#" onclick="openGitHubModal()">CLOUD</a></li>
                <li><a href="#" onclick="openDataManageModal()">DATA</a></li>
                <li><a href="#" onclick="openManualModal()">MANUAL</a></li>
            </ul>
            
            <div style="display: flex; gap: 1rem;">
                <button class="btn-connect" style="background-color: transparent; color: #1C1D20; border: 1px solid #1C1D20; padding: 0.5rem 1.5rem;" onclick="registerPasskey()" title="패스키 설정">PASSKEY</button>
                <button class="btn-connect" style="background-color: transparent; color: #1C1D20; border: 1px solid #1C1D20; padding: 0.5rem 1.5rem;" onclick="openAccountModal()">USER</button>
                <button class="btn-connect" onclick="logout()">LOGOUT</button>
            </div>
        </nav>
`;

// Extract everything from <nav class="flex flex-col... to </nav>
const navRegex = /<nav class="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">[\s\S]*?<\/nav>/;
html = html.replace(navRegex, newNavHTML);

// Remove the standalone Pension & Sync Bar as we will integrate it better or it looks out of place
const pensionSyncRegex = /<!-- Pension & Sync Bar -->[\s\S]*?<div class="flex items-center justify-between bg-white rounded-full px-8 py-4 mb-16 shadow-sm border border-leo-lightgray\/50 transition-transform hover:-translate-y-1">[\s\S]*?<\/div>/;
html = html.replace(pensionSyncRegex, '');

// We can move Pension and Save & Sync to the summary bar or top nav. 
// I'll add them to the summary bar.
const summaryBarRegex = /<!-- Summary Bar -->\s*<div class="summary-bar">/;
const newSummaryBarStart = `
        <!-- Pension & Sync Actions -->
        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-bottom: 1rem;">
            <button class="btn-connect" style="padding: 0.5rem 1rem; font-size: 0.8rem; background-color: #F4F5FB; color: #5D6BF8;" onclick="openPensionModal()">📊 PENSION INFO</button>
            <button class="btn-connect" style="padding: 0.5rem 1rem; font-size: 0.8rem; background-color: #E8F5E9; color: #2E7D32;" onclick="manualGitHubSync()">💾 SAVE & SYNC</button>
        </div>
        <!-- Summary Bar -->
        <div class="summary-bar">
`;
html = html.replace(summaryBarRegex, newSummaryBarStart);


fs.writeFileSync('asset.html', html, 'utf8');
console.log('Dashboard navigation updated.');
