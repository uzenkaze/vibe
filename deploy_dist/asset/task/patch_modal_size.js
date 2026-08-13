const fs = require('fs');
const file = 'D:\\VibeCoding\\task\\task-manager.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Change textarea height and modal width
content = content.replace(/id="query-content" class="ts-input" style="width:100%; height:250px;/, 'id="query-content" class="ts-input" style="width:100%; height:500px;');
content = content.replace(/class="modal-content" style="width: 100%; max-width:800px;/, 'class="modal-content" style="width: 100%; max-width:1000px;');

// 2. Change modal title HTML
content = content.replace(/<h2 id="query-modal-title"([^>]*)>새 쿼리 추가<\/h2>/, '<h2 id="query-modal-title"$1>Query</h2>');

// 3. Change JS modal title setting
content = content.replace(/document\.getElementById\('query-modal-title'\)\.innerText = '쿼리 수정';/, "document.getElementById('query-modal-title').innerText = 'Query';");
content = content.replace(/document\.getElementById\('query-modal-title'\)\.innerText = '새 쿼리 추가';/, "document.getElementById('query-modal-title').innerText = 'Query';");

fs.writeFileSync(file, content, 'utf8');
console.log('Script done.');
