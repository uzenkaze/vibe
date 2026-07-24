const fs = require('fs');
const file = 'D:\\VibeCoding\\task\\task-manager.html';
let content = fs.readFileSync(file, 'utf8');

const oldBtn = '<button class="modal-close" onclick="closeQueryModal()" style="position: static;">&times;</button>';
const newBtn = '<button type="button" onclick="closeQueryModal()" style="background: rgba(0,0,0,0.05); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: #1d1d1f;" onmouseover="this.style.background=\'rgba(0,0,0,0.1)\'" onmouseout="this.style.background=\'rgba(0,0,0,0.05)\'"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>';

content = content.replace(oldBtn, newBtn);
fs.writeFileSync(file, content, 'utf8');
console.log('Script done.');
