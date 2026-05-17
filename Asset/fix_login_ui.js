const fs = require('fs');
let html = fs.readFileSync('asset.html', 'utf8');

// 1. Remove login button from landing nav
html = html.replace('<button class="btn-connect" onclick="showLoginScreen()">로그인</button>', '');

// 2. Remove features section
const featuresRegex = /<div class="features-section">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
// Wait, the div structure:
/*
        <div class="features-section">
            <div class="features-text">...</div>
            <div class="features-img">...</div>
        </div>
*/
const featuresRegex2 = /<div class="features-section">[\s\S]*?<img src="features_asset_stress\.png" alt="Stressed CTO Illustration">\s*<\/div>\s*<\/div>/;

html = html.replace(featuresRegex2, '');

// 3. Improve Login Screen UI
// Change background to glassmorphism
html = html.replace('background-color: #FFFFFF;', 'background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px);');

// Improve the login card UI slightly
html = html.replace('padding: 4rem 3rem;', 'padding: 4rem 3.5rem;');
html = html.replace('border-radius: 20px;', 'border-radius: 28px;');
html = html.replace('box-shadow: 0 20px 40px rgba(0,0,0,0.08);', 'box-shadow: 0 24px 48px rgba(0,0,0,0.06);');
html = html.replace('border: 1px solid #E5E5E5;', 'border: 1px solid rgba(229, 229, 229, 0.5);');

// Make the login title bigger and bolder
html = html.replace('font-size: 2rem;', 'font-size: 2.5rem; letter-spacing: -0.5px;');

// Improve the inputs
html = html.replace('border-radius: 10px;', 'border-radius: 14px;');

// Also remove \n artifact inside loginFormContainer and format the close button
html = html.replace('<div class="login-card" id="loginFormContainer">\\n<button', '<div class="login-card" id="loginFormContainer">\n<button');
html = html.replace('color: #7F7F7F;"', 'color: #7F7F7F; transition: color 0.2s;" onmouseover="this.style.color=\'#1C1D20\'" onmouseout="this.style.color=\'#7F7F7F\'"');

fs.writeFileSync('asset.html', html, 'utf8');
console.log("Applied all changes.");
