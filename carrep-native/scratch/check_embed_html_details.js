import fs from 'fs';

try {
  const html = fs.readFileSync('scratch/chosun_embed.html', 'utf8');
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  console.log('Title:', titleMatch ? titleMatch[1] : 'Not found');
  
  // Print first 500 characters
  console.log('First 500 chars:', html.substring(0, 500).replace(/\n/g, ' '));
  
  // Search for player response
  const playerResponseIdx = html.indexOf('ytInitialPlayerResponse');
  if (playerResponseIdx !== -1) {
    console.log('Found ytInitialPlayerResponse at index:', playerResponseIdx);
    console.log('Snippet around player response:', html.substring(playerResponseIdx, playerResponseIdx + 300).replace(/\n/g, ' '));
  } else {
    console.log('ytInitialPlayerResponse NOT found.');
  }
  
  // Search for consent
  console.log('Contains "consent"?', html.includes('consent'));
  console.log('Contains "Before you continue"?', html.includes('Before you continue'));
  console.log('Contains "이동하기 전에"?', html.includes('이동하기 전에'));
  console.log('Contains "동의"?', html.includes('동의'));
} catch (e) {
  console.error(e);
}
