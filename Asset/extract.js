const fs = require('fs');
const html = fs.readFileSync('d:/VibeCoding/Asset/installment.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
scripts.forEach((s, i) => {
    fs.writeFileSync('d:/VibeCoding/Asset/temp_script_'+i+'.js', s[1]);
});
