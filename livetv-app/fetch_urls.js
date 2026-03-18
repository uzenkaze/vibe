import https from 'https';
import fs from 'fs';

https.get('https://iptv-org.github.io/iptv/countries/kr.m3u', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const lines = data.split('\n');
    let currentChannel = null;
    const channels = {};
    
    for (const line of lines) {
      if (line.startsWith('#EXTINF')) {
        currentChannel = line;
      } else if (line.trim() !== '' && !line.startsWith('#')) {
        if (currentChannel) {
          if (currentChannel.includes('KBS 1') || currentChannel.includes('KBS1')) channels['KBS1'] = line.trim();
          if (currentChannel.includes('KBS 2') || currentChannel.includes('KBS2')) channels['KBS2'] = line.trim();
          if ((currentChannel.includes('MBC') || currentChannel.includes('문화방송')) && !currentChannel.includes('Drama') && !currentChannel.includes('Net') && !currentChannel.includes('Busan') && !currentChannel.includes('Daegu') && !currentChannel.includes('Gwangju')) channels['MBC'] = line.trim();
          if (currentChannel.includes('SBS') && !currentChannel.includes('Golf') && !currentChannel.includes('Sports')) channels['SBS'] = line.trim();
          if (currentChannel.includes('YTN')) channels['YTN'] = line.trim();
          if (currentChannel.includes('Yonhap') || currentChannel.includes('연합뉴스')) channels['Yonhap'] = line.trim();
          currentChannel = null;
        }
      }
    }
    
    fs.writeFileSync('urls.json', JSON.stringify(channels, null, 2));
    console.log("Done");
  });
}).on('error', (err) => {
  console.error("Error: " + err.message);
});
