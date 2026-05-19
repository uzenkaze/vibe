const fs = require('fs');

let html = fs.readFileSync('asset.html', 'utf8');

// 1. Update CSS Variables and Theme
html = html.replace(
    /--accent-blue: #1C1D20;/g,
    '--accent-blue: #5D6BF8;'
);
html = html.replace(
    /--bg-color: #F9F9F9;/g,
    '--bg-color: #FFFFFF;'
);

// Add Landing Page CSS before </style>
const landingCSS = `
        /* Landing Page Styles */
        .landing-bg-circle {
            position: absolute;
            width: 120vw;
            height: 120vw;
            border-radius: 50%;
            background: #F4F5FB;
            top: -60vw;
            left: -10vw;
            z-index: -1;
        }
        .landing-bg-circle-small {
            position: absolute;
            width: 40vw;
            height: 40vw;
            border-radius: 50%;
            background: #F4F5FB;
            bottom: 10vw;
            left: -20vw;
            z-index: -1;
        }
        .landing-page {
            position: relative;
            width: 100%;
            min-height: 100vh;
            overflow: hidden;
            font-family: 'Inter', sans-serif;
            color: #1C1D20;
        }
        .landing-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 5%;
            font-weight: 700;
            font-size: 0.85rem;
        }
        .landing-nav .logo {
            font-size: 1.5rem;
            font-weight: 900;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .landing-nav ul {
            display: flex;
            gap: 2rem;
            list-style: none;
        }
        .landing-nav ul li a {
            text-decoration: none;
            color: #1C1D20;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: color 0.3s;
        }
        .landing-nav ul li a:hover {
            color: var(--accent-blue);
        }
        .btn-connect {
            background-color: var(--accent-blue);
            color: #FFFFFF;
            padding: 0.75rem 2rem;
            border-radius: 30px;
            border: none;
            font-weight: 700;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: all 0.3s;
        }
        .btn-connect:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(93, 107, 248, 0.4);
        }
        .hero-section {
            text-align: center;
            padding: 5rem 5% 0;
            max-width: 900px;
            margin: 0 auto;
        }
        .hero-title {
            font-size: 3.5rem;
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            letter-spacing: -1px;
        }
        .hero-subtitle {
            font-size: 1.25rem;
            color: #555;
            margin-bottom: 2.5rem;
            font-weight: 600;
        }
        .hero-btn {
            background-color: #2D3A8C; /* Deep blue from ref */
            color: #FFFFFF;
            padding: 1rem 3rem;
            border-radius: 40px;
            border: none;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            transition: all 0.3s;
        }
        .hero-btn:hover {
            background-color: #1C2459;
        }
        .hero-img {
            margin-top: 3rem;
            max-width: 100%;
            height: auto;
        }
        .features-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8rem 10% 5rem;
            gap: 4rem;
        }
        .features-text {
            flex: 1;
        }
        .features-text h2 {
            font-size: 2.5rem;
            font-weight: 900;
            line-height: 1.2;
            margin-bottom: 2rem;
            letter-spacing: -0.5px;
        }
        .features-list {
            list-style: none;
            padding: 0;
        }
        .features-list li {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1.2rem;
            font-size: 1rem;
            font-weight: 600;
            color: #444;
        }
        .features-list li::before {
            content: '✓';
            display: inline-flex;
            justify-content: center;
            align-items: center;
            width: 24px;
            height: 24px;
            background-color: #FFB347; /* Yellow check bg */
            color: white;
            border-radius: 50%;
            font-size: 14px;
        }
        .features-img {
            flex: 1;
            text-align: right;
        }
        .features-img img {
            max-width: 100%;
        }
`;
html = html.replace('</style>', landingCSS + '\n    </style>');

// 2. Insert Landing Page HTML
const landingHTML = `
    <!-- Landing Page -->
    <div id="landingPage" class="landing-page" style="display: none;">
        <div class="landing-bg-circle"></div>
        <div class="landing-bg-circle-small"></div>
        
        <nav class="landing-nav">
            <div class="logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 22H22L12 2Z" stroke="#1C1D20" stroke-width="2" stroke-linejoin="round"/>
                    <path d="M12 10L7 20H17L12 10Z" fill="#5D6BF8"/>
                </svg>
                Asset Manager
            </div>
            <ul>
                <li><a href="#" style="border-bottom: 2px solid var(--accent-blue); padding-bottom: 4px;">HOME</a></li>
                <li><a href="#">FEATURES</a></li>
                <li><a href="#">PRACTICES</a></li>
                <li><a href="#">ABOUT US</a></li>
            </ul>
            <button class="btn-connect" onclick="showLoginScreen()">LET'S CONNECT</button>
        </nav>

        <div class="hero-section">
            <h1 class="hero-title">Manage your assets securely,<br>embedded with your team.</h1>
            <p class="hero-subtitle">Relentlessly productive, when and where you need them.</p>
            <button class="hero-btn" onclick="showLoginScreen()">PRICING & AVAILABILITY</button>
            <img src="hero_team.png" alt="Team Illustration" class="hero-img">
        </div>

        <div class="features-section">
            <div class="features-text">
                <h2>You're a CEO or CTO and<br>you have a problem.</h2>
                <ul class="features-list">
                    <li>Asset tracking isn't moving fast enough</li>
                    <li>You don't have the right oversight</li>
                    <li>You need additional management capacity</li>
                    <li>Analyzing, calculating and formatting data takes too much time</li>
                    <li>You've lost key data through attrition</li>
                </ul>
            </div>
            <div class="features-img">
                <img src="features_stress.png" alt="Stressed CTO Illustration">
            </div>
        </div>
    </div>
`;
html = html.replace('<body>', '<body>\n' + landingHTML);

// 3. Update Login Flow Script
html = html.replace(
    "document.documentElement.style.setProperty('--login-flash-display', 'flex');",
    "document.documentElement.style.setProperty('--login-flash-display', 'none');"
); // We handle display manually now.

html = html.replace(
    '<body>',
    `<script>
        document.addEventListener("DOMContentLoaded", function() {
            if (sessionStorage.getItem('assetLoginSession') === 'true' && sessionStorage.getItem('temp_master_pw')) {
                document.getElementById('landingPage').style.display = 'none';
                document.getElementById('loginScreen').style.display = 'none';
            } else {
                document.getElementById('landingPage').style.display = 'block';
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('mainContainer').style.display = 'none';
            }
        });
        function showLoginScreen() {
            document.getElementById('landingPage').style.display = 'none';
            document.getElementById('loginScreen').style.display = 'flex';
        }
    </script>
    <body>`
);

// 4. Update loginSuccess and logout functions
html = html.replace(
    "document.getElementById('loginScreen').style.display = 'none';",
    "document.getElementById('loginScreen').style.display = 'none';\n            document.getElementById('landingPage').style.display = 'none';"
);
html = html.replace(
    "isLoggedIn = false;",
    "isLoggedIn = false;\n            document.getElementById('mainContainer').style.display = 'none';\n            document.getElementById('landingPage').style.display = 'block';"
);
html = html.replace(
    "document.getElementById('mainContainer').style.display = 'none';",
    "" // Remove redundant line if it exists
);

// In loginSuccess, make sure mainContainer display is block
// Already there: document.getElementById('mainContainer').style.display = 'block';

// In init.js area
// Add cancel button to login screen so user can go back to landing page
const loginCardHtml = `<div class="login-card" id="loginFormContainer">`;
const loginCardCancelBtn = `<button style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #7F7F7F;" onclick="hideLoginScreen()">&times;</button>`;
html = html.replace(loginCardHtml, loginCardHtml + '\\n' + loginCardCancelBtn);
html = html.replace('</script>\n    <body>', `
        function hideLoginScreen() {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('landingPage').style.display = 'block';
        }
    </script>
    <body>`);

// Make sure loginScreen is position: fixed or absolute to act as modal, or just takes full screen. It is currently flex center.

fs.writeFileSync('asset.html', html, 'utf8');
console.log('Done modifying asset.html');
