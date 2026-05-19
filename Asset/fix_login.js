const fs = require('fs');
let html = fs.readFileSync('asset.html', 'utf8');

const oldStr = `            if (accountsData.length === 0) {
                document.getElementById('loginScreen').style.display = 'flex';
                document.getElementById('loginFormContainer').style.display = 'none';
                document.getElementById('adminCreateContainer').style.display = 'block';
                document.getElementById('mainContainer').style.display = 'none';
            } else {
                document.getElementById('loginScreen').style.display = 'flex';
                document.getElementById('loginFormContainer').style.display = 'block';
                document.getElementById('adminCreateContainer').style.display = 'none';
                document.getElementById('mainContainer').style.display = 'none';`;

const newStr = `            if (accountsData.length === 0) {
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('loginFormContainer').style.display = 'none';
                document.getElementById('adminCreateContainer').style.display = 'block';
                document.getElementById('mainContainer').style.display = 'none';
                document.getElementById('landingPage').style.display = 'block';
            } else {
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('loginFormContainer').style.display = 'block';
                document.getElementById('adminCreateContainer').style.display = 'none';
                document.getElementById('mainContainer').style.display = 'none';
                document.getElementById('landingPage').style.display = 'block';`;

html = html.replace(oldStr, newStr);

// Also apply the new hero section changes to match the attached image perfectly.
// "메인 화면은 이런 스타일로 만들어 줘"
// The attached image has the Hero section at the very top (large text "Resilient software engineers...").
// Then the Team Illustration.
// Features section is not shown in the immediate viewport of the attached image.
// So I will make the Hero Section the main thing again, and use the new generated images.

const oldLanding = `        <!-- Features Section을 상단으로 이동하여 바로 보이도록 구성 -->
        <div class="features-section" style="padding-top: 3rem;">
            <div class="features-text">
                <h2>Manage your assets securely,<br>embedded with your team.</h2>
                <ul class="features-list">
                    <li>Asset tracking isn't moving fast enough?</li>
                    <li>You don't have the right oversight?</li>
                    <li>You need additional management capacity?</li>
                    <li>Analyzing and formatting data takes too much time?</li>
                    <li>You've lost key data through attrition?</li>
                </ul>
                <button class="hero-btn" style="margin-top: 2rem;" onclick="showLoginScreen()">시작하기</button>
            </div>
            <div class="features-img">
                <img src="features_stress.png" alt="Features Illustration">
            </div>
        </div>

        <div class="hero-section" style="padding-top: 2rem; padding-bottom: 5rem;">
            <p class="hero-subtitle">Relentlessly productive, when and where you need them.</p>
            <img src="hero_team.png" alt="Team Illustration" class="hero-img">
        </div>`;

const newLanding = `        <div class="hero-section" style="padding-top: 5rem; padding-bottom: 5rem;">
            <h1 class="hero-title">Manage your assets securely,<br>embedded with your team.</h1>
            <p class="hero-subtitle">Relentlessly productive, when and where you need them.</p>
            <button class="hero-btn" onclick="showLoginScreen()" style="margin-bottom: 4rem;">시작하기</button>
            <img src="hero_asset_management.png" alt="Team Illustration" class="hero-img">
        </div>

        <div class="features-section">
            <div class="features-text">
                <h2>You're a CEO or CTO and<br>you have a problem.</h2>
                <ul class="features-list">
                    <li>Asset tracking isn't moving fast enough?</li>
                    <li>You don't have the right oversight?</li>
                    <li>You need additional management capacity?</li>
                    <li>Analyzing and formatting data takes too much time?</li>
                    <li>You've lost key data through attrition?</li>
                </ul>
            </div>
            <div class="features-img">
                <img src="features_asset_stress.png" alt="Stressed CTO Illustration">
            </div>
        </div>`;

// Wait, the user already had me change it. I'll just regex replace it to be safe.
html = html.replace(/<!-- Features Section을 상단으로 이동하여 바로 보이도록 구성 -->[\s\S]*?<img src="hero_team.png" alt="Team Illustration" class="hero-img">\s*<\/div>/, newLanding);

fs.writeFileSync('asset.html', html, 'utf8');
