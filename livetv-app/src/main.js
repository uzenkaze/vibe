import Hls from 'hls.js';

// 오늘 일자 기준 확보된 테스트용 m3u8 주소 (일부 주소는 HTTP 연결 및 지역 IP 우회 필요 가능)
const CHANNELS = [
  {
    id: 'kbs1',
    name: 'KBS 1TV',
    network: 'KBS',
    url: 'http://121.156.46.79/live/10171.m3u8?sid=60720'
  },
  {
    id: 'kbs2',
    name: 'KBS 2TV',
    network: 'KBS',
    url: 'http://121.156.46.79/live/10141.m3u8?sid=60720'
  },
  {
    id: 'mbc',
    name: 'MBC',
    network: 'MBC',
    url: 'https://5c3639aa99149.streamlock.net/live_TV/tv/playlist.m3u8'
  },
  {
    id: 'sbs',
    name: 'SBS (UBC)',
    network: 'SBS',
    url: 'https://stream.ubc.co.kr/hls/ubctvstream/index.m3u8'
  },
  {
    id: 'ytn',
    name: 'YTN',
    network: 'YTN',
    url: 'http://202.60.106.14:8080/214/playlist.m3u8'
  },
  {
    id: 'yonhap',
    name: '연합뉴스TV',
    network: 'Yonhap',
    url: 'https://wms211-kortv.akamaized.net/a_live/34402987/smil:20ch211.smil/chunklist_b2500000.m3u8'
  }
];

let hls = null;
const videoElement = document.getElementById('tv-player');
const overlayElement = document.getElementById('video-overlay');
const channelGrid = document.getElementById('channel-grid');

// 모바일 환경에서의 오토플레이를 위해 속성 추가 (muted 필수)
videoElement.muted = true;
videoElement.setAttribute('playsinline', '');
videoElement.setAttribute('autoplay', '');

function initPlayer() {
  // 채널 버튼 생성
  renderChannelButtons();
  
  // 첫 번째 채널 자동 선택
  if (CHANNELS.length > 0) {
    playChannel(CHANNELS[0]);
  }
}

function renderChannelButtons() {
  channelGrid.innerHTML = '';
  
  CHANNELS.forEach(channel => {
    const btn = document.createElement('div');
    btn.className = 'channel-btn';
    btn.dataset.id = channel.id;
    btn.dataset.network = channel.network;
    
    btn.innerHTML = `
      <div class="channel-logo">${channel.network}</div>
      <div class="channel-name">${channel.name}</div>
    `;
    
    btn.addEventListener('click', () => {
      playChannel(channel);
    });
    
    channelGrid.appendChild(btn);
  });
}

function updateActiveButton(channelId) {
  const buttons = document.querySelectorAll('.channel-btn');
  buttons.forEach(btn => {
    if (btn.dataset.id === channelId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function showLoading(show) {
  if (show) {
    overlayElement.classList.remove('hidden');
  } else {
    overlayElement.classList.add('hidden');
  }
}

function playChannel(channel) {
  showLoading(true);
  updateActiveButton(channel.id);
  
  if (hls) {
    hls.destroy();
  }
  
  // HLS를 지원하는 브라우저 (대부분의 모던 브라우저)
  if (Hls.isSupported()) {
    hls = new Hls({
      // HLS 설정 (버퍼링 등 미세조정 가능)
      maxMaxBufferLength: 30,
    });
    
    hls.loadSource(channel.url);
    hls.attachMedia(videoElement);
    
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      showLoading(false);
      videoElement.play().catch(e => {
        console.warn("Auto-play was prevented. Trying muted play...", e);
        videoElement.muted = true;
        videoElement.play().catch(err => {
            console.error("Playback failed completely:", err);
            alert("브라우저 정책으로 인해 자동 재생이 차단되었습니다. 플레이어의 재생 버튼을 직접 눌러주세요.");
        });
      });
    });
    
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.warn('HLS Error:', data);
      if (data.fatal) {
        showLoading(false);
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('네트워크 또는 CORS 오류 발생 - 주소를 가져오지 못했습니다.');
            alert("네트워크 통신 오류나 CORS 정책 차단으로 인해 해당 채널을 재생할 수 없습니다.");
            hls.destroy();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('미디어 디코딩 오류 발생');
            hls.recoverMediaError();
            break;
          default:
            console.error('치명적인 오류 발생, 재생 중지');
            hls.destroy();
            break;
        }
      }
    });
  } 
  // 네이티브 HLS 지원 브라우저 (ex. Safari)
  else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
    videoElement.src = channel.url;
    videoElement.addEventListener('loadedmetadata', () => {
      showLoading(false);
      videoElement.play();
    });
  }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', initPlayer);
