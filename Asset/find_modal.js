const fs = require('fs');
const lines = fs.readFileSync('asset.html', 'utf8').split('\n');
for(let i=0; i<lines.length; i++) {
    if(lines[i].includes('accountModal')) {
        console.log('Line ' + (i+1) + ': ' + lines[i].trim());
    }
}
