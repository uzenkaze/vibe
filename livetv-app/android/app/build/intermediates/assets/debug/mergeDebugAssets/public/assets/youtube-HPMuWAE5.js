import"./modulepreload-polyfill-B5Qt9EMX.js";const x=[];let a=[],r=[];async function b(t,e,o){const n=`https://www.youtube.com/feeds/videos.xml?channel_id=${t}`,i=[s=>`https://api.allorigins.win/get?url=${encodeURIComponent(s)}`,s=>`https://corsproxy.io/?${encodeURIComponent(s)}`,s=>`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(s)}`];for(const s of i)try{const c=s(n);console.log(`[YouTube RSS] RSS 피드 요청 중: ${c}`);const u=await fetch(c,{signal:AbortSignal.timeout(8e3)});let d="";if(c.includes("allorigins")?d=(await u.json()).contents||"":d=await u.text(),d&&(d.includes("<entry>")||d.includes("&lt;entry&gt;"))){const m=[...new DOMParser().parseFromString(d,"text/xml").querySelectorAll("entry")].slice(0,8);if(m.length>0)return m.map(l=>{const f=l.querySelector("videoId")?.textContent||l.getElementsByTagName("yt:videoId")?.[0]?.textContent||l.querySelector("yt\\:videoId")?.textContent||"",h=l.querySelector("published")?.textContent||"";return{videoId:f,title:l.querySelector("title")?.textContent||"",channelId:t,channelName:e,channelCat:o,thumb:`https://img.youtube.com/vi/${f}/mqdefault.jpg`,published:h,timeAgo:C(h)}}).filter(l=>l.videoId)}}catch(c){console.warn(`[YouTube RSS] RSS 프록시 실패 (${s.name}):`,c)}return[]}function C(t){if(!t)return"";const e=(Date.now()-new Date(t).getTime())/1e3;return e<3600?Math.floor(e/60)+"분 전":e<86400?Math.floor(e/3600)+"시간 전":e<2592e3?Math.floor(e/86400)+"일 전":Math.floor(e/2592e3)+"개월 전"}function $(t,e){document.getElementById("yt-iframe").src=`https://www.youtube-nocookie.com/embed/${t}?autoplay=1&rel=0`,document.getElementById("player-title").textContent=e,document.getElementById("player-overlay").classList.add("open"),document.body.style.overflow="hidden"}function M(){document.getElementById("yt-iframe").src="",document.getElementById("player-overlay").classList.remove("open"),document.body.style.overflow=""}function S(){const t=a.filter(e=>e.cat==="custom");localStorage.setItem("yt_channels_page",JSON.stringify(t))}function E(){try{return JSON.parse(localStorage.getItem("yt_channels_page")||"[]")}catch{return[]}}function k(t){const e=document.createElement("div");return e.className="yt-card",e.onclick=()=>$(t.videoId,t.title),e.innerHTML=`
    <div class="yt-thumb">
      <img src="${t.thumb}" alt="${t.title}" loading="lazy" onerror="this.style.display='none'">
    </div>
    <div class="yt-card-info">
      <div class="yt-avatar" style="background:${y(t.channelName)}">${t.channelName.charAt(0)}</div>
      <div class="yt-meta">
        <div class="yt-title">${t.title}</div>
        <div class="yt-ch-name">${t.channelName}</div>
        <div class="yt-info-row">${t.timeAgo}</div>
      </div>
    </div>`,e}function y(t){const e=["#7c3aed","#1d4ed8","#059669","#b45309","#be185d","#0891b2","#dc2626"];let o=0;for(let n of t)o=o*31+n.charCodeAt(0)&4294967295;return e[Math.abs(o)%e.length]}function g(t,e){const o=document.getElementById("yt-main");if(o.innerHTML=e?`<div class="section-title">${e}</div>`:"",!t.length){o.innerHTML+='<div class="empty-state"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg><h3>영상이 없습니다</h3><p>채널을 추가하면 최신 영상이 표시됩니다</p></div>';return}const n=document.createElement("div");n.className="yt-grid",t.forEach(i=>n.appendChild(k(i))),o.appendChild(n)}function p(){const t=document.getElementById("yt-main");let e=document.getElementById("custom-channel-list-section");e&&e.remove();const o=a.filter(i=>i.cat==="custom");if(o.length===0)return;e=document.createElement("div"),e.id="custom-channel-list-section",e.style.cssText="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-bottom: 40px;",e.innerHTML=`
    <div class="section-title" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 16px; font-weight: 800; color: #f1f1f1;">내가 추가한 채널</span>
      <span style="font-size: 11px; color: #666; font-weight: normal;">총 ${o.length}개</span>
    </div>
    <div class="yt-ch-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
    </div>
  `;const n=e.querySelector(".yt-ch-list");o.forEach(i=>{const s=document.createElement("div");s.className="yt-ch-row",s.style.cssText="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 12px; transition: background 0.2s;",s.innerHTML=`
      <div style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; min-width: 0;" onclick="filterByChannel('${i.id}')">
        <div class="yt-avatar" style="background:${y(i.name)}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: white; flex-shrink: 0;">
          ${i.name.charAt(0).toUpperCase()}
        </div>
        <div class="yt-ch-info" style="min-width: 0;">
          <div class="yt-ch-title" style="font-size: 14px; font-weight: 600; color: #f1f1f1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${i.name}</div>
          <div class="yt-ch-sub" style="font-size: 11px; color: #666; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${i.handle||"@"+i.name}</div>
        </div>
      </div>
      <button onclick="removeChannel(event, '${i.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" title="채널 삭제">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    `,n.appendChild(s)}),t.appendChild(e)}window.filterByChannel=function(t){const e=a.find(n=>n.id===t);if(!e)return;const o=r.filter(n=>n.channelId===t);g(o,`"${e.name}" 채널 영상`),p()};window.removeChannel=function(t,e){t.stopPropagation(),confirm("이 채널을 삭제하시겠습니까?")&&(a=a.filter(o=>o.id!==e),S(),r=r.filter(o=>o.channelId!==e),v())};function v(){const t=r;if(!t.length&&r.length===0){document.getElementById("yt-main").innerHTML=`
      <div class="empty-state">
        <svg width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        <h3>채널이 없습니다</h3>
        <p>우측 상단 <strong>채널 추가</strong>를 눌러<br>원하는 YouTube 채널을 추가해 보세요<br><br>예: @JTBC_news · @YTN_news24 · @MBCentertain</p>
      </div>`,p();return}g(t,""),p()}async function I(){document.getElementById("yt-main").innerHTML='<div class="yt-loading"><div class="yt-spinner"></div><span>채널 영상을 불러오는 중...</span></div>';const t=E();a=[...x,...t],r=(await Promise.allSettled(a.map(n=>b(n.id,n.name,n.cat)))).flatMap((n,i)=>n.status==="fulfilled"?n.value:[]);const o=new Date;o.setMonth(o.getMonth()-1),r=r.filter(n=>n.channelCat==="custom"?new Date(n.published)>=o:!0),r.sort((n,i)=>new Date(i.published)-new Date(n.published)),v()}document.addEventListener("keydown",t=>{t.key==="Escape"&&M()});I();
