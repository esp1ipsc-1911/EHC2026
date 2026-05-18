/* ── EHC 2026 Stage Analysis — Supabase Edition ── */

/* ════════════════════════════════════════════════
   SUPABASE CONFIG
   Fill in after following SETUP_GUIDE.md
   ════════════════════════════════════════════════ */
const SUPABASE_URL  = 'https://ydtkremsqomtlyocjsng.supabase.co';
const SUPABASE_ANON = 'sb_publishable_PZcSch5_vSf5R3PdaYRjGQ_-46gHW1g';

/* ── State ── */
let currentModalId = null;
let editMode       = false;
let positions      = {};
let supabaseReady  = false;
let saveTimeout    = null;

const TAG_LABELS = {
  special: { label:'Special',    cls:'b-purple' },
  moving:  { label:'Movers',     cls:'b-blue'   },
  long:    { label:'24+ rds',    cls:'b-orange'  },
  reload3: { label:'3+ Reloads', cls:'b-red'    }
};
const RELOAD_BADGE = [
  {cls:'b-green',  label:'No reload' },
  {cls:'b-blue',   label:'1 Reload'  },
  {cls:'b-orange', label:'2 Reloads' },
  {cls:'b-red',    label:'3 Reloads' },
  {cls:'b-red',    label:'4 Reloads' }
];

/* ════════════════════════════════════════════════
   SUPABASE HELPERS
   ════════════════════════════════════════════════ */
function sbH() {
  return {
    'apikey': SUPABASE_ANON,
    'Authorization': 'Bearer ' + SUPABASE_ANON,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    'X-Client-Info': 'ehc2026'
  };
}

async function sbGetAll() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/stage_positions?select=*`, { headers: sbH() });
  if (!r.ok) throw new Error('GET failed ' + r.status);
  return r.json();
}

async function sbUpsert(stageId, data) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/stage_positions`, {
    method: 'POST',
    headers: { ...sbH(), 'Prefer': 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({ stage_id: stageId, positions: data, updated_at: new Date().toISOString() })
  });
  if (!r.ok) throw new Error('UPSERT failed ' + await r.text());
  return r.json();
}

/* ════════════════════════════════════════════════
   SYNC STATUS
   ════════════════════════════════════════════════ */
function setSyncStatus(state, msg) {
  const el = document.getElementById('syncStatus');
  if (!el) return;
  const colors = { ok:'#9ae6b4', saving:'#f6ad55', error:'#fc8181', loading:'#90cdf4' };
  const icons  = { ok:'●', saving:'↻', error:'✕', loading:'◌' };
  el.style.color = colors[state] || '#a0aec0';
  el.textContent = (icons[state]||'') + ' ' + msg;
}

/* ════════════════════════════════════════════════
   INIT — load positions from Supabase
   ════════════════════════════════════════════════ */
async function initPositions() {
  setSyncStatus('loading', 'Connecting…');

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    setSyncStatus('error', 'Not configured — open app.js and add Supabase keys');
    loadFallback();
    return;
  }

  try {
    const rows = await sbGetAll();
    rows.forEach(row => { positions[String(row.stage_id)] = row.positions; });
    STAGES.forEach(s => {
      if (!positions[String(s.id)]) {
        const fb = window._LOCAL && window._LOCAL[String(s.id)];
        if (fb) positions[String(s.id)] = fb;
        else positions[String(s.id)] = { markers:[], ns:[], movers:[] };
      }
    });
    supabaseReady = true;
    setSyncStatus('ok', `Live · ${rows.length} stages loaded`);
  } catch(e) {
    setSyncStatus('error', 'DB error — using local data');
    loadFallback();
  }
}

function loadFallback() {
  if (window._LOCAL) Object.assign(positions, window._LOCAL);
  STAGES.forEach(s => {
    if (!positions[String(s.id)]) positions[String(s.id)] = { markers:[], ns:[], movers:[] };
  });
}

/* ════════════════════════════════════════════════
   AUTO-SAVE (debounced 800ms after last drag)
   ════════════════════════════════════════════════ */
function scheduleSave(stageId) {
  clearTimeout(saveTimeout);
  setSyncStatus('saving', 'Saving…');
  saveTimeout = setTimeout(() => saveStage(stageId), 800);
}

async function saveStage(stageId) {
  if (!supabaseReady) { setSyncStatus('error', 'Not connected'); return; }
  try {
    await sbUpsert(stageId, positions[String(stageId)]);
    setSyncStatus('ok', 'Saved ' + new Date().toLocaleTimeString());
  } catch(e) {
    setSyncStatus('error', 'Save failed');
    console.error(e);
  }
}

/* ════════════════════════════════════════════════
   LIVE POLL — check remote changes every 15s
   ════════════════════════════════════════════════ */
function startLivePoll() {
  if (!supabaseReady) return;
  setInterval(async () => {
    try {
      const rows = await sbGetAll();
      rows.forEach(row => { positions[String(row.stage_id)] = row.positions; });
      if (currentModalId) {
        renderOverlaySvg(currentModalId);
        renderOverlayMarkers(currentModalId);
      }
    } catch(e) {}
  }, 15000);
}

/* ════════════════════════════════════════════════
   HEADER + GRID
   ════════════════════════════════════════════════ */
function renderHeaderStats() {
  const total   = STAGES.reduce((a,s)=>a+s.rounds,0);
  const reloads = STAGES.reduce((a,s)=>a+s.reloads,0);
  const special = STAGES.filter(s=>s.tags.includes('special')).length;
  document.getElementById('headerStats').innerHTML = `
    <div class="hstat"><div class="hstat-val">${total}</div><div class="hstat-lbl">Total rounds</div></div>
    <div class="hstat"><div class="hstat-val">${reloads}</div><div class="hstat-lbl">Reloads</div></div>
    <div class="hstat"><div class="hstat-val">${special}</div><div class="hstat-lbl">Special</div></div>`;
  document.getElementById('cntAll').textContent     = STAGES.length;
  document.getElementById('cntSpecial').textContent = STAGES.filter(s=>s.tags.includes('special')).length;
  document.getElementById('cntMoving').textContent  = STAGES.filter(s=>s.tags.includes('moving')).length;
  document.getElementById('cntLong').textContent    = STAGES.filter(s=>s.tags.includes('long')).length;
  document.getElementById('cntReload3').textContent = STAGES.filter(s=>s.tags.includes('reload3')).length;
}

function buildBadges(s) {
  const rb = RELOAD_BADGE[Math.min(s.reloads,4)];
  let h = `<span class="badge ${rb.cls}">${rb.label}</span>`;
  s.tags.forEach(t=>{ const i=TAG_LABELS[t]; if(i) h+=`<span class="badge ${i.cls}">${i.label}</span>`; });
  return h;
}

function renderGrid() {
  document.getElementById('grid').innerHTML = STAGES.map(s => {
    const a0 = s.alerts&&s.alerts.length>0 ? s.alerts[0] : '';
    return `<article class="card" data-tags="${s.tags.join(',')}" onclick="openModal(${s.id})">
      <div class="card-top">
        <div><div class="stage-id">Stage</div><div class="stage-num">${s.id}</div></div>
        <div class="card-badges">${buildBadges(s)}</div>
      </div>
      <div class="card-img-wrap">
        <img src="images/stage_${String(s.id).padStart(2,'0')}.png" alt="Stage ${s.id}" loading="lazy">
      </div>
      <div class="card-stats">
        <div class="stat"><div class="stat-val">${s.rounds}</div><div class="stat-lbl">Rounds</div></div>
        <div class="stat"><div class="stat-val">${s.papers}</div><div class="stat-lbl">Papers</div></div>
        <div class="stat"><div class="stat-val">${s.poppers+s.plates}</div><div class="stat-lbl">Steel</div></div>
        <div class="stat"><div class="stat-val">${s.reloads}</div><div class="stat-lbl">Reloads</div></div>
      </div>
      <div class="card-summary">
        <strong>Start:</strong> ${s.start}<br>
        ${a0?`<span style="color:#fc8181;font-size:.68rem">⚠ ${a0}</span>`:''}
      </div>
      <div class="card-footer">
        <button class="btn-detail" onclick="event.stopPropagation();openModal(${s.id})">Full Analysis →</button>
      </div>
    </article>`;
  }).join('');
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.card').forEach(card => {
      const tags = card.dataset.tags.split(',');
      card.classList.toggle('hidden', f!=='all' && !tags.includes(f));
    });
  });
});

/* ════════════════════════════════════════════════
   MODAL
   ════════════════════════════════════════════════ */
function navigateModal(dir) {
  const idx = STAGES.findIndex(s=>s.id===currentModalId);
  const next = STAGES[idx+dir];
  if (next) openModal(next.id);
}

function openModal(id) {
  currentModalId = id; editMode = false;
  const s = STAGES.find(x=>x.id===id); if (!s) return;
  document.getElementById('modalStageLabel').textContent = `Stage ${id} of ${STAGES.length}`;
  document.getElementById('btnPrev').disabled = STAGES.findIndex(x=>x.id===id)===0;
  document.getElementById('btnNext').disabled = STAGES.findIndex(x=>x.id===id)===STAGES.length-1;
  const btnE = document.getElementById('btnEditMode');
  btnE.classList.remove('active'); btnE.textContent = '✏ Edit positions';
  document.getElementById('editHint').style.display = 'none';
  renderModalContent(s);
  document.getElementById('backdrop').classList.add('open');
  document.getElementById('modal').classList.add('open');
  document.getElementById('modal').scrollTop = 0;
}

function closeModal() {
  document.getElementById('backdrop').classList.remove('open');
  document.getElementById('modal').classList.remove('open');
  document.getElementById('editHint').style.display = 'none';
  editMode = false; currentModalId = null;
}

document.addEventListener('keydown', e => {
  if (e.key==='Escape') closeModal();
  if (e.key==='ArrowLeft'  && currentModalId) navigateModal(-1);
  if (e.key==='ArrowRight' && currentModalId) navigateModal(1);
});

function toggleEditMode() {
  editMode = !editMode;
  const btn = document.getElementById('btnEditMode');
  btn.classList.toggle('active', editMode);
  btn.textContent = editMode ? '✓ Done editing' : '✏ Edit positions';
  document.getElementById('editHint').style.display = editMode ? 'block' : 'none';
  const c = document.querySelector('.stage-img-container');
  if (c) c.classList.toggle('edit-mode', editMode);
  renderOverlayMarkers(currentModalId);
}

function renderModalContent(s) {
  const steps = s.order.map((step,i)=>{
    const isR=step.toUpperCase().includes('RELOAD'), isS=i===0;
    const cls=isS?'start':isR?'reload':'shoot';
    return `<li><span class="step-num ${cls}">${i+1}</span><span>${step}</span></li>`;
  }).join('');
  const alerts = (s.alerts||[]).map(a=>`<div class="alert-box">${a}</div>`).join('');
  const hasDis = s.order.some(o=>o.toUpperCase().includes('DISAPPEAR'));

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-title-row">${buildBadges(s)}</div>
    <div class="modal-title">Stage ${s.id}</div>
    <div class="modal-subtitle">EHC 2026 · Classic Division · 10-round magazines</div>
    <div class="stage-img-container" id="stageImgContainer">
      <img id="stageImg" src="images/stage_${String(s.id).padStart(2,'0')}.png"
           alt="Stage ${s.id}" onload="onImgLoad(${s.id})">
      <div class="img-banner img-banner-top" id="imgBannerTop"></div>
      ${hasDis?`<div class="img-banner img-banner-warn">⚠ DISAPPEARING TARGETS — engage immediately</div>`:''}
      <svg class="overlay-svg" id="overlaySvg"></svg>
      <div class="overlay-wrap" id="overlayWrap"></div>
    </div>
    <div class="modal-section"><h3>Key information</h3>
      <div class="info-row">
        <div class="info-chip"><strong>${s.rounds}</strong> rounds</div>
        <div class="info-chip"><strong>${s.papers}</strong> papers</div>
        <div class="info-chip"><strong>${s.poppers}</strong> poppers</div>
        <div class="info-chip"><strong>${s.plates}</strong> plates</div>
        <div class="info-chip"><strong>${s.ns}</strong> NS</div>
        <div class="info-chip"><strong>${s.reloads}</strong> reloads</div>
      </div>
      <div class="info-row"><div class="info-chip" style="flex:1"><strong>Start:</strong> ${s.start}</div></div>
      <div class="info-row"><div class="info-chip" style="flex:1"><strong>Ready:</strong> ${s.ready}</div></div>
    </div>
    ${s.moving!=='None'?`<div class="modal-section"><h3>Moving targets</h3>
      <div class="info-chip" style="display:inline-block">${s.moving}</div></div>`:''}
    <div class="modal-section"><h3>Classic magazine plan</h3>
      <div class="mag-plan">${s.magPlan}</div></div>
    <div class="modal-section"><h3>Shooting order</h3>
      <ol class="order-list">${steps}</ol></div>
    ${s.special&&s.special.length>0?`<div class="modal-section"><h3>Special constraints</h3>
      ${s.special.map(sp=>`<div class="alert-box">${sp}</div>`).join('')}</div>`:''}
    <div class="modal-section"><h3>Critical alerts</h3>${alerts}</div>`;
}

function onImgLoad(id) {
  const s = STAGES.find(x=>x.id===id);
  if (s) {
    const b = document.getElementById('imgBannerTop');
    if (b) b.textContent = `${s.rounds} rounds · ${s.reloads} reload${s.reloads!==1?'s':''} · ${s.ns} NS · ${s.magPlan.split('.')[0]}`;
  }
  renderOverlaySvg(id); renderOverlayMarkers(id);
}

/* ════════════════════════════════════════════════
   OVERLAY
   ════════════════════════════════════════════════ */
function getBounds() {
  const img = document.getElementById('stageImg'); if (!img) return null;
  const W=img.clientWidth, H=img.clientHeight;
  const off=H*0.37, dH=H-off;
  return {W,H,off,dH};
}

function renderOverlaySvg(id) {
  const svg=document.getElementById('overlaySvg'); if(!svg) return;
  const pos=positions[String(id)]; if(!pos||!pos.movers||!pos.movers.length){svg.innerHTML='';return;}
  const b=getBounds(); if(!b) return;
  const px=fx=>fx*b.W, py=fy=>b.off+fy*b.dH;
  let s=`<defs>
    <marker id="ag" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#68d391"/></marker>
    <marker id="ar" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#fc8181"/></marker>
  </defs>`;
  pos.movers.forEach(m=>{
    const c=m.disappears?'#fc8181':'#68d391', mi=m.disappears?'ar':'ag';
    s+=`<line x1="${px(m.from_x)}" y1="${py(m.from_y)}" x2="${px(m.to_x)}" y2="${py(m.to_y)}"
         stroke="${c}" stroke-width="2.5" stroke-dasharray="6,4" marker-end="url(#${mi})" opacity="0.9"/>`;
  });
  svg.innerHTML=s;
}

function renderOverlayMarkers(id) {
  const wrap=document.getElementById('overlayWrap'); if(!wrap) return;
  wrap.innerHTML='';
  const pos=positions[String(id)]; if(!pos) return;
  const b=getBounds(); if(!b) return;
  const toP=(fx,fy)=>({x:fx*b.W, y:b.off+fy*b.dH});

  function makeDrag(el, obj) {
    if (!editMode) return;
    el.classList.add('draggable');
    let drag=false, sx,sy,ox,oy;
    const down=(cx,cy)=>{drag=true;sx=cx;sy=cy;ox=obj.x;oy=obj.y;};
    const move=(cx,cy)=>{
      if(!drag)return;
      obj.x=Math.max(0,Math.min(1,ox+(cx-sx)/b.W));
      obj.y=Math.max(0,Math.min(1,oy+(cy-sy)/b.dH));
      const p=toP(obj.x,obj.y); el.style.left=p.x+'px'; el.style.top=p.y+'px';
      renderOverlaySvg(id);
    };
    const up=()=>{ if(!drag)return; drag=false; scheduleSave(id); };
    el.addEventListener('mousedown',e=>{down(e.clientX,e.clientY);e.preventDefault();});
    document.addEventListener('mousemove',e=>move(e.clientX,e.clientY));
    document.addEventListener('mouseup',up);
    el.addEventListener('touchstart',e=>{down(e.touches[0].clientX,e.touches[0].clientY);e.preventDefault();},{passive:false});
    document.addEventListener('touchmove',e=>{if(drag)move(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
    document.addEventListener('touchend',up);
  }

  (pos.markers||[]).forEach(m=>{
    const p=toP(m.x,m.y);
    const el=document.createElement('div');
    el.className=`marker type-${m.type||'shoot'}`;
    el.style.left=p.x+'px'; el.style.top=p.y+'px';
    el.innerHTML=`${m.type==='reload'?'↺':m.step}<span class="marker-tooltip">${m.label||''}</span>`;
    makeDrag(el,m); wrap.appendChild(el);
  });

  (pos.ns||[]).forEach(n=>{
    const p=toP(n.x,n.y);
    const el=document.createElement('div');
    el.className='marker type-ns';
    el.style.left=p.x+'px'; el.style.top=p.y+'px';
    el.innerHTML=`NS<span class="marker-tooltip">NS Target — DO NOT SHOOT</span>`;
    makeDrag(el,n); wrap.appendChild(el);
  });
}

/* ════════════════════════════════════════════════
   BOOT
   ════════════════════════════════════════════════ */
async function init() {
  try { const r=await fetch('positions.json'); if(r.ok) window._LOCAL=await r.json(); } catch(e){}
  renderHeaderStats();
  renderGrid();
  await initPositions();
  startLivePoll();
}

init();
