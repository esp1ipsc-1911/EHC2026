/* ── EHC 2026 Stage Analysis — Supabase Edition v4 ── */

const SUPABASE_URL  = 'https://ydtkremsqomtlyocjsng.supabase.co';
const SUPABASE_ANON = 'sb_publishable_PZcSch5_vSf5R3PdaYRjGQ_-46gHW1g';

/* ── State ── */
let currentModalId = null;
let editMode       = false;
let positions      = {};   // {stageId: {markers:[], ns:[], movers:[]}}
let shootingOrders = {};   // {stageId: [{text,type},...] or null}
let supabaseReady  = false;
let saveTimeout    = null;

const TAG_LABELS = {
  special:{label:'Special',cls:'b-purple'},
  moving:{label:'Movers',cls:'b-blue'},
  long:{label:'24+ rds',cls:'b-orange'},
  reload3:{label:'3+ Reloads',cls:'b-red'}
};
const RELOAD_BADGE = [
  {cls:'b-green',label:'No reload'},{cls:'b-blue',label:'1 Reload'},
  {cls:'b-orange',label:'2 Reloads'},{cls:'b-red',label:'3 Reloads'},
  {cls:'b-red',label:'4 Reloads'}
];

/* ════════════ SUPABASE ════════════ */
function sbH() {
  return {
    'apikey':SUPABASE_ANON,'Authorization':'Bearer '+SUPABASE_ANON,
    'Content-Type':'application/json','Prefer':'return=representation'
  };
}
async function sbGetAll() {
  const r=await fetch(`${SUPABASE_URL}/rest/v1/stage_positions?select=*`,{headers:sbH()});
  if(!r.ok) throw new Error('GET '+r.status);
  return r.json();
}
async function sbUpsert(id,pos,order) {
  const r=await fetch(`${SUPABASE_URL}/rest/v1/stage_positions`,{
    method:'POST',
    headers:{...sbH(),'Prefer':'resolution=merge-duplicates,return=representation'},
    body:JSON.stringify({stage_id:id,positions:pos,shooting_order:order,updated_at:new Date().toISOString()})
  });
  if(!r.ok) throw new Error('UPSERT '+await r.text());
  return r.json();
}

/* ════════════ STATUS ════════════ */
function setSyncStatus(state,msg) {
  const el=document.getElementById('syncStatus'); if(!el) return;
  const c={ok:'#9ae6b4',saving:'#f6ad55',error:'#fc8181',loading:'#90cdf4'};
  const i={ok:'●',saving:'↻',error:'✕',loading:'◌'};
  el.style.color=c[state]||'#a0aec0';
  el.textContent=(i[state]||'')+' '+msg;
}

/* ════════════ INIT ════════════ */
async function initPositions() {
  setSyncStatus('loading','Connecting…');
  try {
    const rows=await sbGetAll();
    rows.forEach(row=>{
      if(row.positions)      positions[String(row.stage_id)]=row.positions;
      if(row.shooting_order) shootingOrders[String(row.stage_id)]=row.shooting_order;
    });
    STAGES.forEach(s=>{
      const k=String(s.id);
      if(!positions[k])      positions[k]={markers:[],ns:[],movers:[]};
      if(!shootingOrders[k]) shootingOrders[k]=null;
    });
    supabaseReady=true;
    setSyncStatus('ok',`Live · ${rows.length} stages loaded`);
  } catch(e) {
    setSyncStatus('error','DB error — offline mode');
    STAGES.forEach(s=>{
      const k=String(s.id);
      if(!positions[k])      positions[k]={markers:[],ns:[],movers:[]};
      if(!shootingOrders[k]) shootingOrders[k]=null;
    });
  }
}

/* ════════════ SAVE ════════════ */
function scheduleSave(id) {
  clearTimeout(saveTimeout);
  setSyncStatus('saving','Saving…');
  saveTimeout=setTimeout(()=>saveStage(id),800);
}
async function saveStage(id) {
  if(!supabaseReady){setSyncStatus('error','Not connected');return;}
  try {
    const k=String(id);
    await sbUpsert(id,positions[k],shootingOrders[k]);
    setSyncStatus('ok','Saved '+new Date().toLocaleTimeString());
  } catch(e) {
    setSyncStatus('error','Save failed: '+e.message);
    console.error(e);
  }
}

/* ════════════ LIVE POLL ════════════ */
function startLivePoll() {
  if(!supabaseReady) return;
  setInterval(async()=>{
    try {
      const rows=await sbGetAll();
      rows.forEach(row=>{
        if(row.positions)      positions[String(row.stage_id)]=row.positions;
        if(row.shooting_order) shootingOrders[String(row.stage_id)]=row.shooting_order;
      });
      if(currentModalId){
        renderOverlaySvg(currentModalId);
        renderOverlayMarkers(currentModalId);
        renderShootingOrder(currentModalId);
      }
    } catch(e){}
  },15000);
}

/* ════════════ HEADER + GRID ════════════ */
function renderHeaderStats() {
  const total=STAGES.reduce((a,s)=>a+s.rounds,0);
  const rel=STAGES.reduce((a,s)=>a+s.reloads,0);
  const sp=STAGES.filter(s=>s.tags.includes('special')).length;
  document.getElementById('headerStats').innerHTML=`
    <div class="hstat"><div class="hstat-val">${total}</div><div class="hstat-lbl">Total rounds</div></div>
    <div class="hstat"><div class="hstat-val">${rel}</div><div class="hstat-lbl">Reloads</div></div>
    <div class="hstat"><div class="hstat-val">${sp}</div><div class="hstat-lbl">Special</div></div>`;
  document.getElementById('cntAll').textContent=STAGES.length;
  document.getElementById('cntSpecial').textContent=STAGES.filter(s=>s.tags.includes('special')).length;
  document.getElementById('cntMoving').textContent=STAGES.filter(s=>s.tags.includes('moving')).length;
  document.getElementById('cntLong').textContent=STAGES.filter(s=>s.tags.includes('long')).length;
  document.getElementById('cntReload3').textContent=STAGES.filter(s=>s.tags.includes('reload3')).length;
}

function buildBadges(s) {
  const rb=RELOAD_BADGE[Math.min(s.reloads,4)];
  let h=`<span class="badge ${rb.cls}">${rb.label}</span>`;
  s.tags.forEach(t=>{const i=TAG_LABELS[t];if(i) h+=`<span class="badge ${i.cls}">${i.label}</span>`;});
  return h;
}

function renderGrid() {
  document.getElementById('grid').innerHTML=STAGES.map(s=>{
    const a0=s.alerts&&s.alerts.length>0?s.alerts[0]:'';
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

document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f=btn.dataset.filter;
    document.querySelectorAll('.card').forEach(card=>{
      const tags=card.dataset.tags.split(',');
      card.classList.toggle('hidden',f!=='all'&&!tags.includes(f));
    });
  });
});

/* ════════════ MODAL ════════════ */
function navigateModal(dir) {
  const idx=STAGES.findIndex(s=>s.id===currentModalId);
  const next=STAGES[idx+dir];
  if(next) openModal(next.id);
}

function openModal(id) {
  currentModalId=id; editMode=false;
  const s=STAGES.find(x=>x.id===id); if(!s) return;
  document.getElementById('modalStageLabel').textContent=`Stage ${id} of ${STAGES.length}`;
  document.getElementById('btnPrev').disabled=STAGES.findIndex(x=>x.id===id)===0;
  document.getElementById('btnNext').disabled=STAGES.findIndex(x=>x.id===id)===STAGES.length-1;
  const btnE=document.getElementById('btnEditMode');
  btnE.classList.remove('active'); btnE.textContent='✏ Edit';
  document.getElementById('editHint').style.display='none';
  renderModalContent(s);
  document.getElementById('backdrop').classList.add('open');
  document.getElementById('modal').classList.add('open');
  document.getElementById('modal').scrollTop=0;
}

function closeModal() {
  closePopup();
  document.getElementById('backdrop').classList.remove('open');
  document.getElementById('modal').classList.remove('open');
  document.getElementById('editHint').style.display='none';
  editMode=false; currentModalId=null;
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closePopup()||closeModal();}
  if(e.key==='ArrowLeft'&&currentModalId) navigateModal(-1);
  if(e.key==='ArrowRight'&&currentModalId) navigateModal(1);
});

function toggleEditMode() {
  editMode=!editMode;
  const btn=document.getElementById('btnEditMode');
  btn.classList.toggle('active',editMode);
  btn.textContent=editMode?'✓ Done':'✏ Edit';
  document.getElementById('editHint').style.display=editMode?'block':'none';
  const c=document.querySelector('.stage-img-container');
  if(c) c.classList.toggle('edit-mode',editMode);
  renderOverlayMarkers(currentModalId);
  renderShootingOrder(currentModalId);
  if(!editMode) closePopup();
}

/* ════════════ MODAL CONTENT ════════════ */
function renderModalContent(s) {
  const hasDis=s.order.some(o=>o&&o.toUpperCase&&o.toUpperCase().includes('DISAPPEAR'))||
    (s.moving&&s.moving.toUpperCase().includes('DISAPPEAR'));
  document.getElementById('modalContent').innerHTML=`
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
    <div class="modal-section">
      <h3>Key information</h3>
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
    <div class="modal-section">
      <h3>Shooting order</h3>
      <div id="shootingOrderList"></div>
    </div>
    ${s.special&&s.special.length>0?`<div class="modal-section"><h3>Special constraints</h3>
      ${s.special.map(sp=>`<div class="alert-box">${sp}</div>`).join('')}</div>`:''}
    <div class="modal-section"><h3>Critical alerts</h3>
      ${(s.alerts||[]).map(a=>`<div class="alert-box">${a}</div>`).join('')}</div>`;
  renderShootingOrder(s.id);
}

function onImgLoad(id) {
  const s=STAGES.find(x=>x.id===id);
  if(s){
    const b=document.getElementById('imgBannerTop');
    if(b) b.textContent=`${s.rounds} rounds · ${s.reloads} reload${s.reloads!==1?'s':''} · ${s.ns} NS · ${s.magPlan.split('.')[0]}`;
  }
  renderOverlaySvg(id);
  renderOverlayMarkers(id);
  // Attach click-to-add on image container
  const container=document.getElementById('stageImgContainer');
  if(container) {
    container.removeEventListener('click',container._clickHandler);
    container._clickHandler=e=>onImageClick(e,id);
    container.addEventListener('click',container._clickHandler);
  }
}

/* ════════════ ACTIVE ORDER ════════════ */
function getActiveOrder(id) {
  const k=String(id);
  if(shootingOrders[k]&&shootingOrders[k].length>0) return shootingOrders[k];
  return []; // blank by default
}

/* ════════════ SHOOTING ORDER RENDER ════════════ */
function renderShootingOrder(id) {
  const container=document.getElementById('shootingOrderList'); if(!container) return;
  const order=getActiveOrder(id);

  if(!editMode) {
    if(order.length===0) {
      container.innerHTML=`<div class="order-empty">No shooting order added yet. Click <strong>✏ Edit</strong> and tap the stage image to add steps.</div>`;
      return;
    }
    container.innerHTML=`<ol class="order-list">${order.map((step,i)=>{
      const text=typeof step==='string'?step:step.text;
      const type=typeof step==='object'?step.type:(text.toUpperCase().includes('RELOAD')?'reload':i===0?'start':'shoot');
      return `<li><span class="step-num ${type}">${i+1}</span><span>${text||''}</span></li>`;
    }).join('')}</ol>`;
    return;
  }

  // Edit mode
  container.innerHTML=`
    <div class="order-edit-hint">Tap image to add markers · Drag list items to reorder · Click text to edit</div>
    ${order.length===0?`<div class="order-empty-edit">Tap anywhere on the stage image above to add your first step.</div>`:''}
    <ol class="order-list-edit" id="orderDragList">
      ${order.map((step,i)=>{
        const text=typeof step==='string'?step:step.text||'';
        const type=typeof step==='object'?step.type:(text.toUpperCase().includes('RELOAD')?'reload':i===0?'start':'shoot');
        return `<li class="order-edit-item" draggable="true" data-idx="${i}">
          <span class="drag-handle">⠿</span>
          <span class="step-num ${type} step-num-edit" onclick="cycleStepType(${id},${i})" title="Click to change type">${i+1}</span>
          <span class="step-text-edit" contenteditable="true"
            data-placeholder="Optional description…"
            onblur="updateStepText(${id},${i},this.textContent)"
            onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}">${text}</span>
          <button class="btn-step-del" onclick="deleteStep(${id},${i})" title="Delete">✕</button>
        </li>`;
      }).join('')}
    </ol>
    ${order.length>0?`<div class="order-add-row">
      <button class="btn-reset-order" onclick="resetOrder(${id})">↺ Clear all</button>
    </div>`:''}`;
  if(order.length>0) initDragSort(id);
  renderOverlayMarkers(id);
}

/* ════════════ CLICK-TO-ADD POPUP ════════════ */
let pendingClick={x:0,y:0};

function onImageClick(e,id) {
  if(!editMode) return;
  // Ignore clicks on existing markers
  if(e.target.classList.contains('marker')||e.target.classList.contains('marker-tooltip')) return;
  // Ignore clicks on the popup itself
  if(e.target.closest('#addMarkerPopup')) return;

  const container=document.getElementById('stageImgContainer');
  const rect=container.getBoundingClientRect();
  const img=document.getElementById('stageImg');
  const W=img.clientWidth, H=img.clientHeight;
  const b=getBounds(); if(!b) return;

  // Calculate position as fraction within the diagram area
  const clickX=e.clientX-rect.left;
  const clickY=e.clientY-rect.top;
  const fx=Math.max(0,Math.min(1,clickX/W));
  const fy=Math.max(0,Math.min(1,(clickY-b.off)/b.dH));

  // Only trigger within the diagram area (below the table header)
  if(clickY < b.off) return;

  pendingClick={fx,fy};
  showAddPopup(e.clientX,e.clientY,id);
}

function showAddPopup(clientX,clientY,id) {
  closePopup();
  const popup=document.createElement('div');
  popup.id='addMarkerPopup';
  popup.className='add-marker-popup';

  popup.innerHTML=`
    <div class="popup-title">Add marker</div>
    <div class="popup-types">
      <button class="popup-type-btn type-shoot"  onclick="confirmAddMarker(${id},'shoot')" title="Shooting step">🔵 Shoot</button>
      <button class="popup-type-btn type-reload"  onclick="confirmAddMarker(${id},'reload')" title="Reload point">🟠 Reload</button>
      <button class="popup-type-btn type-start"   onclick="confirmAddMarker(${id},'start')" title="Start position">🟢 Start</button>
      <button class="popup-type-btn type-ns"      onclick="confirmAddMarker(${id},'ns')" title="NS target — do not shoot">🔴 NS</button>
    </div>
    <input class="popup-text-input" id="popupTextInput" type="text"
           placeholder="Optional description…" maxlength="60"
           onkeydown="if(event.key==='Enter') document.querySelector('.popup-type-btn.selected')&&confirmAddMarker(${id},document.querySelector('.popup-type-btn.selected').dataset.type)">
    <div class="popup-actions">
      <button class="popup-cancel" onclick="closePopup()">Cancel</button>
    </div>`;

  document.body.appendChild(popup);

  // Position popup near click, keep within viewport
  const pw=220, ph=160;
  let left=clientX+10, top=clientY+10;
  if(left+pw>window.innerWidth)  left=clientX-pw-10;
  if(top+ph>window.innerHeight)  top=clientY-ph-10;
  popup.style.left=left+'px';
  popup.style.top=top+'px';

  // Type button selection
  popup.querySelectorAll('.popup-type-btn').forEach(btn=>{
    btn.dataset.type=btn.className.match(/type-(\w+)/)[1];
    btn.addEventListener('click',function(){
      popup.querySelectorAll('.popup-type-btn').forEach(b=>b.classList.remove('selected'));
      this.classList.add('selected');
    });
  });
  // Pre-select shoot
  popup.querySelector('.type-shoot').classList.add('selected');
  setTimeout(()=>document.getElementById('popupTextInput')&&document.getElementById('popupTextInput').focus(),50);
}

function confirmAddMarker(id,type) {
  const textEl=document.getElementById('popupTextInput');
  const text=textEl?textEl.value.trim():'';
  closePopup();

  const k=String(id);
  if(!positions[k]) positions[k]={markers:[],ns:[],movers:[]};

  if(type==='ns') {
    // NS target — just a position marker, no step number
    positions[k].ns.push({x:pendingClick.fx, y:pendingClick.fy});
  } else {
    // Get next step number
    const nextStep=(positions[k].markers||[]).length+1;
    positions[k].markers.push({
      step:nextStep, x:pendingClick.fx, y:pendingClick.fy,
      type, label:text
    });
    // Also add to shooting order list
    if(!shootingOrders[k]) shootingOrders[k]=[];
    const orderText = text || (type==='reload'?'RELOAD':type==='start'?'Start position':'Step '+nextStep);
    shootingOrders[k].push({text:orderText, type});
  }

  scheduleSave(id);
  renderOverlaySvg(id);
  renderOverlayMarkers(id);
  renderShootingOrder(id);
}

function closePopup() {
  const p=document.getElementById('addMarkerPopup');
  if(p){p.remove();return true;}
  return false;
}

/* ════════════ ORDER EDIT HELPERS ════════════ */
function cycleStepType(id,idx) {
  const order=getActiveOrder(id);
  const step=order[idx];
  const types=['shoot','reload','start'];
  const cur=(typeof step==='object'?step.type:'shoot')||'shoot';
  const next=types[(types.indexOf(cur)+1)%types.length];
  order[idx]={text:typeof step==='string'?step:step.text||'',type:next};
  shootingOrders[String(id)]=order;
  // Sync marker type on image
  const k=String(id);
  if(positions[k]&&positions[k].markers&&positions[k].markers[idx]) {
    positions[k].markers[idx].type=next;
  }
  scheduleSave(id);
  renderShootingOrder(id);
  renderOverlayMarkers(id);
}

function updateStepText(id,idx,newText) {
  const order=getActiveOrder(id);
  const step=order[idx];
  const cur=typeof step==='object'?step:{text:step,type:'shoot'};
  cur.text=newText.trim();
  if(cur.text.toUpperCase().includes('RELOAD')) cur.type='reload';
  order[idx]=cur;
  // Sync label on marker
  const k=String(id);
  if(positions[k]&&positions[k].markers&&positions[k].markers[idx]) {
    positions[k].markers[idx].label=cur.text;
  }
  shootingOrders[String(id)]=order;
  scheduleSave(id);
  renderOverlayMarkers(id);
}

function deleteStep(id,idx) {
  const order=getActiveOrder(id);
  order.splice(idx,1);
  shootingOrders[String(id)]=order;
  // Also remove marker from image
  const k=String(id);
  if(positions[k]&&positions[k].markers) {
    positions[k].markers.splice(idx,1);
    // Renumber remaining
    positions[k].markers.forEach((m,i)=>{m.step=i+1;});
  }
  scheduleSave(id);
  renderOverlayMarkers(id);
  renderShootingOrder(id);
}

function resetOrder(id) {
  if(!confirm('Clear all markers and shooting order for this stage?')) return;
  shootingOrders[String(id)]=null;
  positions[String(id)]={markers:[],ns:[],movers:[]};
  scheduleSave(id);
  renderOverlayMarkers(id);
  renderShootingOrder(id);
}

function initDragSort(id) {
  const list=document.getElementById('orderDragList'); if(!list) return;
  let dragIdx=null;
  list.querySelectorAll('.order-edit-item').forEach(item=>{
    item.addEventListener('dragstart',e=>{dragIdx=parseInt(item.dataset.idx);item.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    item.addEventListener('dragend',()=>{item.classList.remove('dragging');list.querySelectorAll('.order-edit-item').forEach(i=>i.classList.remove('drag-over'));});
    item.addEventListener('dragover',e=>{e.preventDefault();list.querySelectorAll('.order-edit-item').forEach(i=>i.classList.remove('drag-over'));item.classList.add('drag-over');});
    item.addEventListener('drop',e=>{
      e.preventDefault();
      const dropIdx=parseInt(item.dataset.idx);
      if(dragIdx===null||dragIdx===dropIdx) return;
      const order=getActiveOrder(id);
      const [moved]=order.splice(dragIdx,1);
      order.splice(dropIdx,0,moved);
      // Sync markers array
      const k=String(id);
      if(positions[k]&&positions[k].markers) {
        const [mm]=positions[k].markers.splice(dragIdx,1);
        positions[k].markers.splice(dropIdx,0,mm);
        positions[k].markers.forEach((m,i)=>{m.step=i+1;});
      }
      shootingOrders[k]=order;
      scheduleSave(id);
      renderShootingOrder(id);
      renderOverlayMarkers(id);
    });
  });
}

/* ════════════ OVERLAY ════════════ */
function getBounds() {
  const img=document.getElementById('stageImg'); if(!img) return null;
  const W=img.clientWidth,H=img.clientHeight;
  const ms=Math.max(18,Math.min(36,W*0.035));
  const fs=Math.max(9,Math.min(14,W*0.016));
  const off=H*0.37,dH=H-off;
  return{W,H,off,dH,ms,fs};
}

function renderOverlaySvg(id) {
  const svg=document.getElementById('overlaySvg'); if(!svg) return;
  const pos=positions[String(id)];
  if(!pos||!pos.movers||!pos.movers.length){svg.innerHTML='';return;}
  const b=getBounds(); if(!b) return;
  const px=fx=>fx*b.W,py=fy=>b.off+fy*b.dH;
  const lw=Math.max(1.5,b.W*0.003);
  let s=`<defs>
    <marker id="ag" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#68d391"/></marker>
    <marker id="ar" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#fc8181"/></marker>
  </defs>`;
  pos.movers.forEach(m=>{
    const c=m.disappears?'#fc8181':'#68d391',mi=m.disappears?'ar':'ag';
    s+=`<line x1="${px(m.from_x)}" y1="${py(m.from_y)}" x2="${px(m.to_x)}" y2="${py(m.to_y)}"
         stroke="${c}" stroke-width="${lw}" stroke-dasharray="${lw*2.5},${lw*1.8}"
         marker-end="url(#${mi})" opacity="0.9"/>`;
  });
  svg.innerHTML=s;
}

function renderOverlayMarkers(id) {
  const wrap=document.getElementById('overlayWrap'); if(!wrap) return;
  wrap.innerHTML='';
  const pos=positions[String(id)]; if(!pos) return;
  const b=getBounds(); if(!b) return;
  const toP=(fx,fy)=>({x:fx*b.W,y:b.off+fy*b.dH});

  function applySize(el,size,fsize) {
    el.style.width=size+'px'; el.style.height=size+'px';
    el.style.fontSize=fsize+'px';
    el.style.borderWidth=Math.max(1.5,size*0.07)+'px';
  }

  function makeDrag(el,obj) {
    if(!editMode) return;
    el.classList.add('draggable');
    let drag=false,sx,sy,ox,oy;
    const down=(cx,cy)=>{drag=true;sx=cx;sy=cy;ox=obj.x;oy=obj.y;};
    const move=(cx,cy)=>{
      if(!drag) return;
      obj.x=Math.max(0,Math.min(1,ox+(cx-sx)/b.W));
      obj.y=Math.max(0,Math.min(1,oy+(cy-sy)/b.dH));
      const p=toP(obj.x,obj.y);
      el.style.left=p.x+'px'; el.style.top=p.y+'px';
      renderOverlaySvg(id);
    };
    const up=()=>{if(!drag)return;drag=false;scheduleSave(id);};
    el.addEventListener('mousedown',e=>{down(e.clientX,e.clientY);e.stopPropagation();e.preventDefault();});
    document.addEventListener('mousemove',e=>move(e.clientX,e.clientY));
    document.addEventListener('mouseup',up);
    el.addEventListener('touchstart',e=>{down(e.touches[0].clientX,e.touches[0].clientY);e.stopPropagation();e.preventDefault();},{passive:false});
    document.addEventListener('touchmove',e=>{if(drag)move(e.touches[0].clientX,e.touches[0].clientY);},{passive:false});
    document.addEventListener('touchend',up);
  }

  const ns=Math.max(14,b.ms*0.75);
  const nfs=Math.max(7,b.fs*0.8);

  (pos.markers||[]).forEach(m=>{
    const p=toP(m.x,m.y);
    const el=document.createElement('div');
    el.className=`marker type-${m.type||'shoot'}`;
    el.style.left=p.x+'px'; el.style.top=p.y+'px';
    el.innerHTML=`${m.type==='reload'?'↺':m.step}<span class="marker-tooltip">${m.label||''}</span>`;
    applySize(el,b.ms,b.fs);
    makeDrag(el,m);
    wrap.appendChild(el);
  });

  (pos.ns||[]).forEach(n=>{
    const p=toP(n.x,n.y);
    const el=document.createElement('div');
    el.className='marker type-ns';
    el.style.left=p.x+'px'; el.style.top=p.y+'px';
    el.innerHTML=`NS<span class="marker-tooltip">NS Target — DO NOT SHOOT</span>`;
    applySize(el,ns,nfs);
    makeDrag(el,n);
    wrap.appendChild(el);
  });
}

let resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>{
    if(currentModalId){renderOverlaySvg(currentModalId);renderOverlayMarkers(currentModalId);}
  },150);
});

/* ════════════ BOOT ════════════ */
async function init() {
  renderHeaderStats();
  renderGrid();
  await initPositions();
  startLivePoll();
}
init();
