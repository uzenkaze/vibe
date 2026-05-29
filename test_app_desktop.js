const fs = require('fs');
const https = require('https');

async function testFetch() {
  // Mobile User-Agent
  const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
  };
  
  // URL WITH &app=desktop
  const url = `https://www.youtube.com/results?search_query=아이브&app=desktop`;
  
  try {
      const res = await fetch(url, { headers, redirect: 'manual' });
      console.log("Status:", res.status);
      console.log("Location header:", res.headers.get('location'));
  } catch (e) {
      console.log("Error:", e.message);
  }
}
testFetch();
