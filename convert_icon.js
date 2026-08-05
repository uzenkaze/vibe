const fs = require('fs');
const path = require('path');

// SVG string from d:\VibeCoding\carrep\favicon.svg
const svgPath = path.join(__dirname, 'carrep', 'favicon.svg');
const svgData = fs.readFileSync(svgPath, 'utf8');

// Simple canvas / base64 script or copy icon
console.log('SVG length:', svgData.length);
