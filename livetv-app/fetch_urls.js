import https from 'https';
import fs from 'fs';

https.get('https://iptv-org.github.io/iptv/countries/kr.m3u', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const lines = data.split('\n');
    let currentChannelInfo = null;
    const channels = {};
    
    for (const line of lines) {
      if (line.startsWith('#EXTINF')) {
        currentChannelInfo = line;
      } else if (line.trim() !== '' && !line.startsWith('#')) {
        if (currentChannelInfo) {
          const url = line.trim();
          const info = currentChannelInfo.toLowerCase();
          
          if (info.includes('kbs 1') || info.includes('kbs1')) channels['KBS1'] = url;
          if (info.includes('kbs 2') || info.includes('kbs2')) channels['KBS2'] = url;
          if ((info.includes('mbc') || info.includes('문화방송')) && !info.includes('drama') && !info.includes('net') && !info.includes('busan') && !info.includes('daegu') && !info.includes('gwangju')) channels['MBC'] = url;
          if (info.includes('sbs') && !info.includes('golf') && !info.includes('sports') && !info.includes('ubc')) channels['SBS'] = url;
          if (info.includes('ubc')) channels['SBS_UBC'] = url;
          if (info.includes('ytn')) channels['YTN'] = url;
          if (info.includes('yonhap') || info.includes('연합뉴스')) channels['YONHAP'] = url;
          if (info.includes('ebs 1') || info.includes('ebs1')) channels['EBS1'] = url;
          if (info.includes('ebs 2') || info.includes('ebs2')) channels['EBS2'] = url;
          if (info.includes('ktv') || info.includes('korea tv')) channels['KTV'] = url;
          if (info.includes('arirang tv')) channels['ARIRANG'] = url;
          if (info.includes('obs')) channels['OBS'] = url;
          if (info.includes('tbs')) channels['TBS'] = url;
          if (info.includes('tv chosun') || info.includes('tv조선')) channels['TV_CHOSUN'] = url;
          if (info.includes('channel a') || info.includes('채널a')) channels['CHANNEL_A'] = url;
          if (info.includes('mbn')) channels['MBN'] = url;
          if (info.includes('cj onstyle') || info.includes('cj온스타일')) channels['CJ_SHOP'] = url;
          if (info.includes('gs shop') || info.includes('gs홈쇼핑')) channels['GS_SHOP'] = url;
          if (info.includes('gongyoung shopping') || info.includes('공영쇼핑')) channels['GONG_SHOP'] = url;
          if (info.includes('home & shopping') || info.includes('홈앤쇼핑')) channels['HOMENSHOP'] = url;
          if (info.includes('hyundai home shopping') || info.includes('현대홈쇼핑')) channels['HYUNDAI_SHOP'] = url;
          if (info.includes('lotte home shopping') || info.includes('롯데홈쇼핑')) channels['LOTTE_SHOP'] = url;
          if (info.includes('ns home shopping') || info.includes('ns홈쇼핑')) channels['NS_SHOP'] = url;
          if (info.includes('shinsegae shopping') || info.includes('신세계쇼핑')) channels['SHINSEGAE_SHOP'] = url;
          if (info.includes('shopping nt') || info.includes('쇼핑엔티')) channels['SHOPPING_NT'] = url;
          if (info.includes('w shopping') || info.includes('w쇼핑')) channels['W_SHOP'] = url;
          if (info.includes('kshopping') || info.includes('k쇼핑')) channels['K_SHOPPING'] = url;
          if (info.includes('mtn') || info.includes('머니투데이')) channels['MTN'] = url;
          if (info.includes('job plus tv') || info.includes('한국직업방송')) channels['JOB_PLUS'] = url;
          if (info.includes('nbs') || info.includes('한국농업방송')) channels['NBS_TV'] = url;
          if (info.includes('oun') || info.includes('방송대학TV')) channels['OUN'] = url;
          if (info.includes('gugaktv') || info.includes('국악방송')) channels['GUGAK_TV'] = url;
          
          currentChannelInfo = null;
        }
      }
    }
    
    fs.writeFileSync('urls.json', JSON.stringify(channels, null, 2));
    console.log("Done. Saved " + Object.keys(channels).length + " channels.");
  });
}).on('error', (err) => {
  console.error("Error: " + err.message);
});
