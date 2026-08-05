import fs from 'fs';

try {
  const html = fs.readFileSync('scratch/chosun_embed.html', 'utf8');
  
  // Find divs
  const divs = [];
  const divRegex = /<div\s+([^>]*?)>/g;
  let m;
  while ((m = divRegex.exec(html)) !== null) {
    if (m[1].includes('id="') || m[1].includes('class="')) {
      divs.push(m[0]);
    }
  }
  console.log('Div tags with ID or class (first 20):', divs.slice(0, 20));
  
  // Check for common error class or text
  console.log('Contains "error-message"?', html.includes('error-message'));
  console.log('Contains "ytp-error"?', html.includes('ytp-error'));
  console.log('Contains "unavailable"?', html.includes('unavailable'));
  
  // Print script tags
  const scripts = [];
  const scriptRegex = /<script[^>]*?>([\s\S]*?)<\/script>/g;
  while ((m = scriptRegex.exec(html)) !== null) {
    const content = m[1].trim();
    if (content.length > 0) {
      scripts.push(content.substring(0, 150));
    }
  }
  console.log(`Found ${scripts.length} script tags.`);
  console.log('Sample script snippets:', scripts.slice(0, 5));
} catch (e) {
  console.error(e);
}
