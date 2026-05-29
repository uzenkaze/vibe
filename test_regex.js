const fs = require('fs');
const https = require('https');

https.get('https://www.youtube.com/results?search_query=test+official+audio&sp=EgIQAQ%253D%253D', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const regex1 = /(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({.+?})\s*;</;
        const match1 = data.match(regex1);
        console.log("Regex 1 match length:", match1 ? match1[1].length : 'null');
        
        const regex2 = /(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({[\s\S]+?})\s*;</;
        const match2 = data.match(regex2);
        console.log("Regex 2 match length:", match2 ? match2[1].length : 'null');
    });
});
