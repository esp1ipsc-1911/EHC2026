/* ── EHC 2026 Stage Analysis — Main App ── */

/* ── State ── */
let currentModalId = null;
let editMode = false;
let positions = {}; // live in-memory positions, keyed by stage id string

const TAG_LABELS = {
  special: { label: 'Special', cls: 'b-purple' },
  moving:  { label: 'Movers',  cls: 'b-blue'   },
  long:    { label: '24+ rds', cls: 'b-orange'  },
  reload3: { label: '3+ Reloads', cls: 'b-red'  }
};

const RELOAD_BADGE = [
  { cls: 'b-green',  label: 'No reload'  },
  { cls: 'b-blue',   label: '1 Reload'   },
  { cls: 'b-orange', label: '2 Reloads'  },
  { cls: 'b-red',    label: '3 Reloads'  },
  { cls: 'b-red',    label: '4 Reloads'  }
];

/* ── Load positions.json async ── */
async function loadPositions() {
  try {
    const r = await fetch('positions.json?v=' + Date.now());
    if (r.ok) {
      const data = await r.json();
      // Strip _meta key
      Object.keys(data).forEach(k => {
        if (k !== '_meta') positions[k] = data[k];
      });
      console.log('positions.json loaded — ' + Object.keys(positions).length + ' stages');
    }
  } catch(e) {
    console.warn('positions.json not available, using defaults');
  }
  // Merge any missing stages with empty defaults
  STAGES.forEach(s => {
    if (!positions[String(s.id)]) {
      positions[String(s.id)] = { markers: [], ns: [], movers: [], start: {x:0.5, y:0.85} };
    }
  });
}

/* ── Export positions.json ── */
function exportPositions() {
  const out = {
    _meta: {
      version: window.POSITIONS_VERSION || '1.1',
      exported: new Date().toISOString(),
      description: 'EHC 2026 stage overlay positions. x/y are fractions (0-1) of the diagram image area.'
    }
  };
  Object.assign(out, positions);
  const blob = new Blob([JSON.stringify(out, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'positions.json';
  a.click();
}

/* ── Import positions.json ── */
function importPositions(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      Object.keys(data).forEach(k => {
        if (k !== '_meta') positions[k] = data[k];
      });
      alert('Positions loaded from ' + file.name + '. Reopen any stage to see updated overlays.');
    } catch(err) {
      alert('Error reading file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

/* ── Header stats ── */
function renderHeaderStats() {
  const total = STAGES.reduce((a,s)=>a+s.rounds,0);
  const reloads = STAGES.reduce((a,s)=>a+s.reloads,0);
  const special = STAGES.filter(s=>s.tags.includes('special')).length;
  document.getElementById('headerStats').innerHTML = `
    <div class="hstat"><div class="hstat-val">${total}</div><div class="hstat-lbl">Total rounds</div></div>
    <div class="hstat"><div class="hstat-val">${reloads}</div><div class="hstat-lbl">Reloads</div></div>
    <div class="hstat"><div class="hstat-val">${special}</div><div class="hstat-lbl">Special</div></div>
  `;
  document.getElementById('cntAll').textContent = STAGES.length;
  document.getElementById('cntSpecial').textContent = STAGES.filter(s=>s.tags.includes('special')).length;
  document.getElementById('cntMoving').textContent = STAGES.filter(s=>s.tags.includes('moving')).length;
  document.getElementById('cntLong').textContent = STAGES.filter(s=>s.tags.includes('long')).length;
  document.getElementById('cntReload3').textContent = STAGES.filter(s=>s.tags.includes('reload3')).length;
}

/* ── Build badge HTML ── */
function buildBadges(s) {
  const rb = RELOAD_BADGE[Math.min(s.reloads,4)];
  let h = `<span class="badge ${rb.cls}">${rb.label}</span>`;
  s.tags.forEach(t=>{
    const i=TAG_LABELS[t]; if(i) h+=`<span class="badge ${i.cls}">${i.label}</span>`;
  });
  return h;
}

/* ── Render grid cards ── */
function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = STAGES.map(s => {
    const alert0 = s.alerts && s.alerts.length > 0 ? s.alerts[0] : '';
    return `
    <article class="card" data-tags="${s.tags.join(',')}" onclick="openModal(${s.id})">
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
        ${alert0 ? `<span style="color:#fc8181;font-size:0.68rem">⚠ ${alert0}</span>` : ''}
      </div>
      <div class="card-footer">
        <button class="btn-detail" onclick="event.stopPropagation();openModal(${s.id})">Full Analysis →</button>
      </div>
    </article>`;
  }).join('');
}

/* ── Filter ── */
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

/* ── Modal navigation ── */
function navigateModal(dir) {
  const idx = STAGES.findIndex(s=>s.id===currentModalId);
  const next = STAGES[idx+dir];
  if (next) openModal(next.id);
}

/* ── Open Modal ── */
function openModal(id) {
  currentModalId = id;
  editMode = false;
  const s = STAGES.find(x=>x.id===id);
  if (!s) return;

  document.getElementById('modalStageLabel').textContent = `Stage ${id} of ${STAGES.length}`;
  document.getElementById('btnPrev').disabled = (STAGES.findIndex(x=>x.id===id) === 0);
  document.getElementById('btnNext').disabled = (STAGES.findIndex(x=>x.id===id) === STAGES.length-1);
  document.getElementById('btnEditMode').classList.remove('active');
  document.getElementById('btnEditMode').textContent = '✏ Edit positions';
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
  editMode = false;
  currentModalId = null;
}

document.addEventListener('keydown', e => {
  if (e.key==='Escape') closeModal();
  if (e.key==='ArrowLeft' && currentModalId) navigateModal(-1);
  if (e.key==='ArrowRight' && currentModalId) navigateModal(1);
});

/* ── Toggle edit mode ── */
function toggleEditMode() {
  editMode = !editMode;
  const btn = document.getElementById('btnEditMode');
  btn.classList.toggle('active', editMode);
  btn.textContent = editMode ? '✓ Done editing' : '✏ Edit positions';
  document.getElementById('editHint').style.display = editMode ? 'block' : 'none';

  const container = document.querySelector('.stage-img-container');
  if (container) container.classList.toggle('edit-mode', editMode);

  // Rerender markers with/without drag
  renderOverlayMarkers(currentModalId);
}

/* ── Render modal content ── */
function renderModalContent(s) {
  const rb = RELOAD_BADGE[Math.min(s.reloads,4)];
  const steps = s.order.map((step,i)=>{
    const isReload = step.toUpperCase().includes('RELOAD');
    const isStart = i===0;
    const cls = isStart ? 'start' : isReload ? 'reload' : 'shoot';
    return `<li><span class="step-num ${cls}">${i+1}</span><span>${step}</span></li>`;
  }).join('');
  const alerts = (s.alerts||[]).map(a=>`<div class="alert-box">${a}</div>`).join('');
  const tagBadges = buildBadges(s);
  const hasDisappear = s.order.some(o=>o.includes('DISAPPEAR')||o.includes('disappear'));

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-title-row">${tagBadges}</div>
    <div class="modal-title">Stage ${s.id}</div>
    <div class="modal-subtitle">EHC 2026 · Classic Division · 10-round magazines</div>

    <div class="stage-img-container" id="stageImgContainer">
      <img id="stageImg" src="images/stage_${String(s.id).padStart(2,'0')}.png"
           alt="Stage ${s.id}" onload="onImgLoad(${s.id})">
      <div class="img-banner img-banner-top" id="imgBannerTop"></div>
      ${hasDisappear ? `<div class="img-banner img-banner-warn">⚠ DISAPPEARING TARGETS — engage immediately after popper falls</div>` : ''}
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
      <div class="info-row">
        <div class="info-chip" style="flex:1"><strong>Start:</strong> ${s.start}</div>
      </div>
      <div class="info-row">
        <div class="info-chip" style="flex:1"><strong>Ready:</strong> ${s.ready}</div>
      </div>
    </div>

    ${s.moving !== 'None' ? `
    <div class="modal-section">
      <h3>Moving targets / activations</h3>
      <div class="info-chip" style="display:inline-block">${s.moving}</div>
    </div>` : ''}

    <div class="modal-section">
      <h3>Classic magazine plan</h3>
      <div class="mag-plan">${s.magPlan}</div>
    </div>

    <div class="modal-section">
      <h3>Shooting order</h3>
      <ol class="order-list">${steps}</ol>
    </div>

    ${s.special && s.special.length > 0 ? `
    <div class="modal-section">
      <h3>Special constraints</h3>
      ${s.special.map(sp=>`<div class="alert-box">${sp}</div>`).join('')}
    </div>` : ''}

    <div class="modal-section">
      <h3>Critical alerts</h3>
      ${alerts}
    </div>
  `;
}

function onImgLoad(stageId) {
  // Set banner text
  const s = STAGES.find(x=>x.id===stageId);
  if (s) {
    const banner = document.getElementById('imgBannerTop');
    if (banner) banner.textContent = `${s.rounds} rounds · ${s.reloads} reload${s.reloads!==1?'s':''} · ${s.ns} NS target${s.ns!==1?'s':''} · ${s.magPlan.split('.')[0]}`;
  }
  renderOverlaySvg(stageId);
  renderOverlayMarkers(stageId);
}

/* ── Get image display bounds (within container) ── */
function getImgBounds() {
  const img = document.getElementById('stageImg');
  if (!img) return null;
  const cr = img.getBoundingClientRect();
  const pr = img.parentElement.getBoundingClientRect();
  return {
    left: cr.left - pr.left,
    top: cr.top - pr.top,
    width: cr.width,
    height: cr.height
  };
}

/* ── Render SVG arrows ── */
function renderOverlaySvg(stageId) {
  const svg = document.getElementById('overlaySvg');
  if (!svg) return;
  const pos = positions[String(stageId)];
  if (!pos || !pos.movers) { svg.innerHTML=''; return; }

  const img = document.getElementById('stageImg');
  const W = img ? img.clientWidth : 800;
  const H = img ? img.clientHeight : 600;

  // We need to find the 3D diagram area within the full page image
  // The diagram starts at roughly 37% down the page image
  const diagOffset = H * 0.37;
  const diagH = H - diagOffset;

  function px(fx) { return fx * W; }
  function py(fy) { return diagOffset + fy * diagH; }

  let svgContent = `<defs>
    <marker id="arr-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#68d391"/>
    </marker>
    <marker id="arr-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#fc8181"/>
    </marker>
  </defs>`;

  pos.movers.forEach(m => {
    const color = m.disappears ? '#fc8181' : '#68d391';
    const markerId = m.disappears ? 'arr-red' : 'arr-green';
    const x1=px(m.from_x), y1=py(m.from_y), x2=px(m.to_x), y2=py(m.to_y);
    svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${color}" stroke-width="2" stroke-dasharray="6,4"
      marker-end="url(#${markerId})" opacity="0.85"/>`;
  });

  svg.innerHTML = svgContent;
}

/* ── Render draggable markers ── */
function renderOverlayMarkers(stageId) {
  const wrap = document.getElementById('overlayWrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  const pos = positions[String(stageId)];
  if (!pos) return;

  const img = document.getElementById('stageImg');
  const W = img ? img.clientWidth : 800;
  const H = img ? img.clientHeight : 600;
  const diagOffset = H * 0.37;
  const diagH = H - diagOffset;

  function toPixel(fx, fy) {
    return { x: fx * W, y: diagOffset + fy * diagH };
  }

  function makeDraggable(el, markerObj, type, idx) {
    if (!editMode) return;
    el.classList.add('draggable');
    let dragging = false, startX, startY, origX, origY;

    el.addEventListener('mousedown', e => {
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      origX = markerObj.x; origY = markerObj.y;
      e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = (e.clientX - startX) / W;
      const dy = (e.clientY - startY) / diagH;
      markerObj.x = Math.max(0, Math.min(1, origX + dx));
      markerObj.y = Math.max(0, Math.min(1, origY + dy));
      const p = toPixel(markerObj.x, markerObj.y);
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      // Update SVG arrows too
      renderOverlaySvg(stageId);
    });

    // Touch support
    el.addEventListener('touchstart', e => {
      dragging = true;
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
      origX = markerObj.x; origY = markerObj.y;
      e.preventDefault();
    }, {passive:false});

    document.addEventListener('touchmove', e => {
      if (!dragging) return;
      const dx = (e.touches[0].clientX - startX) / W;
      const dy = (e.touches[0].clientY - startY) / diagH;
      markerObj.x = Math.max(0, Math.min(1, origX + dx));
      markerObj.y = Math.max(0, Math.min(1, origY + dy));
      const p = toPixel(markerObj.x, markerObj.y);
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
    }, {passive:false});

    document.addEventListener('touchend', () => { dragging = false; renderOverlaySvg(stageId); });
  }

  // Draw step markers
  (pos.markers || []).forEach((m, idx) => {
    const p = toPixel(m.x, m.y);
    const el = document.createElement('div');
    el.className = `marker type-${m.type||'shoot'}`;
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    const isReload = m.type === 'reload';
    el.textContent = isReload ? '↺' : m.step;
    el.innerHTML = `${isReload ? '↺' : m.step}<span class="marker-tooltip">${m.label||''}</span>`;
    makeDraggable(el, m, 'marker', idx);
    wrap.appendChild(el);
  });

  // Draw NS warning markers
  (pos.ns || []).forEach((n, idx) => {
    const p = toPixel(n.x, n.y);
    const el = document.createElement('div');
    el.className = 'marker type-ns';
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
    el.innerHTML = `NS<span class="marker-tooltip">NS Target — DO NOT SHOOT</span>`;
    makeDraggable(el, n, 'ns', idx);
    wrap.appendChild(el);
  });
}

/* ── Init ── */
async function init() {
  renderHeaderStats();
  renderGrid();
  await loadPositions();
}

init();
