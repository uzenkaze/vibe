const fs = require('fs');

let html = fs.readFileSync('asset.html', 'utf8');

const loginStyleUpdates = `
        /* New Login Screen Styles */
        .login-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .login-card {
            background: #FFFFFF;
            padding: 4rem 3rem;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            width: 100%;
            max-width: 450px;
            position: relative;
            text-align: center;
            border: 1px solid #E5E5E5;
        }
        .login-card h1 {
            font-size: 2rem;
            font-weight: 900;
            margin-bottom: 2rem;
            color: #1C1D20;
        }
        .login-input input {
            width: 100%;
            padding: 1rem;
            margin-bottom: 1rem;
            border: 1px solid #E5E5E5;
            border-radius: 10px;
            font-size: 1rem;
            background-color: #F9F9F9;
            transition: border-color 0.3s;
        }
        .login-input input:focus {
            outline: none;
            border-color: #5D6BF8;
            background-color: #FFFFFF;
        }
        .login-btn {
            width: 100%;
            padding: 1rem;
            background-color: #5D6BF8;
            color: #FFFFFF;
            border: none;
            border-radius: 30px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 1rem;
        }
        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(93, 107, 248, 0.4);
        }
`;

// Insert the new login styles into the existing CSS block
html = html.replace('</style>', loginStyleUpdates + '\n    </style>');

fs.writeFileSync('asset.html', html, 'utf8');
console.log('Login screen styles updated.');
