const fs = require('fs');
let html = fs.readFileSync('asset.html', 'utf8');

// Replace the checkLoginState loginScreen show logic
const loginRegex = /if \(accountsData\.length === 0\) \{\s*document\.getElementById\('loginScreen'\)\.style\.display = 'flex';\s*document\.getElementById\('loginFormContainer'\)\.style\.display = 'none';\s*document\.getElementById\('adminCreateContainer'\)\.style\.display = 'block';\s*document\.getElementById\('mainContainer'\)\.style\.display = 'none';\s*\} else \{\s*document\.getElementById\('loginScreen'\)\.style\.display = 'flex';\s*document\.getElementById\('loginFormContainer'\)\.style\.display = 'block';\s*document\.getElementById\('adminCreateContainer'\)\.style\.display = 'none';\s*document\.getElementById\('mainContainer'\)\.style\.display = 'none';/;

const newStr = `if (accountsData.length === 0) {
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

html = html.replace(loginRegex, newStr);

// Also replace the landing page to put Hero Section on top, as the attached image has it on top.
const landingRegex = /<!-- Features Section을 상단으로 이동하여 바로 보이도록 구성 -->[\s\S]*?<img src="hero_team.png" alt="Team Illustration" class="hero-img">\s*<\/div>/;

const newLanding = `<!-- Hero Section을 메인 화면 상단으로 배치 (참조 이미지 스타일) -->
        <div class="hero-section" style="padding-top: 5rem; padding-bottom: 5rem;">
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

html = html.replace(landingRegex, newLanding);

fs.writeFileSync('asset.html', html, 'utf8');
console.log("Updated asset.html");
