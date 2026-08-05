fetch('https://www.youtube.com/channel/UCsU-I-vHLiaMfV_ceaYz5rQ/live')
  .then(r => r.text())
  .then(t => {
    const match = t.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (match) console.log(match[1]);
    else console.log('not found');
  })
  .catch(console.error);
