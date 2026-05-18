/* ── EHC 2026 Stage Analysis App ── */

const TAG_LABELS = {
  special: { label: 'Special', cls: 'b-purple' },
  moving:  { label: 'Movers',  cls: 'b-blue'   },
  long:    { label: '24+ rds', cls: 'b-orange'  },
  reload3: { label: '3+ Reloads', cls: 'b-red'  }
};

const RELOAD_BADGE = [
  { cls: 'b-green',  label: 'No Reload'  },
  { cls: 'b-blue',   label: '1 Reload'   },
  { cls: 'b-orange', label: '2 Reloads'  },
  { cls: 'b-red',    label: '3 Reloads'  },
  { cls: 'b-red',    label: '4 Reloads'  }
];

/* ── Header stats ── */
function renderHeaderStats() {
  const totalRounds = STAGES.reduce((a, s) => a + s.rounds, 0);
  const totalReloads = STAGES.reduce((a, s) => a + s.reloads, 0);
  const specialCount = STAGES.filter(s => s.tags.includes('special')).length;
  document.getElementById('headerStats').innerHTML = `
    <div class="hstat"><div class="hstat-val">${totalRounds}</div><div class="hstat-lbl">Total rounds</div></div>
    <div class="hstat"><div class="hstat-val">${totalReloads}</div><div class="hstat-lbl">Total reloads</div></div>
    <div class="hstat"><div class="hstat-val">${specialCount}</div><div class="hstat-lbl">Special stages</div></div>
  `;
  document.getElementById('cntAll').textContent = STAGES.length;
  document.getElementById('cntSpecial').textContent = STAGES.filter(s => s.tags.includes('special')).length;
  document.getElementById('cntMoving').textContent = STAGES.filter(s => s.tags.includes('moving')).length;
  document.getElementById('cntLong').textContent = STAGES.filter(s => s.tags.includes('long')).length;
  document.getElementById('cntReload3').textContent = STAGES.filter(s => s.tags.includes('reload3')).length;
}

/* ── Build card badges ── */
function buildBadges(s) {
  const rb = RELOAD_BADGE[Math.min(s.reloads, 4)];
  let html = `<span class="badge ${rb.cls}">${rb.label}</span>`;
  s.tags.forEach(t => {
    const info = TAG_LABELS[t];
    if (info) html += `<span class="badge ${info.cls}">${info.label}</span>`;
  });
  return html;
}

/* ── Render grid cards ── */
function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = STAGES.map(s => {
    const hasAlerts = s.alerts && s.alerts.length > 0;
    const firstAlert = hasAlerts ? s.alerts[0] : '';
    return `
    <article class="card" data-tags="${s.tags.join(',')}" data-id="${s.id}" onclick="openModal(${s.id})">
      <div class="card-top">
        <div>
          <div class="stage-id">Stage</div>
          <div class="stage-num">${s.id}</div>
        </div>
        <div class="card-badges">${buildBadges(s)}</div>
      </div>
      <div class="card-img-wrap" style="height:180px">
        <img src="images/stage_${String(s.id).padStart(2,'0')}.png" alt="Stage ${s.id} diagram" loading="lazy" style="height:180px;object-fit:cover;object-position:top">
      </div>
      <div class="card-stats">
        <div class="stat"><div class="stat-val">${s.rounds}</div><div class="stat-lbl">Rounds</div></div>
        <div class="stat"><div class="stat-val">${s.papers}</div><div class="stat-lbl">Papers</div></div>
        <div class="stat"><div class="stat-val">${s.poppers + s.plates}</div><div class="stat-lbl">Steel</div></div>
        <div class="stat"><div class="stat-val">${s.reloads}</div><div class="stat-lbl">Reloads</div></div>
      </div>
      <div class="card-summary">
        <strong>Start:</strong> ${s.start}<br>
        ${hasAlerts ? `<span style="color:#fc8181">⚠ ${firstAlert}</span>` : ''}
      </div>
      <div class="card-footer">
        <button class="btn-detail" onclick="event.stopPropagation();openModal(${s.id})">Full Analysis →</button>
      </div>
    </article>`;
  }).join('');
}

/* ── Filter logic ── */
let activeFilter = 'all';
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    document.querySelectorAll('.card').forEach(card => {
      const tags = card.dataset.tags.split(',');
      card.classList.toggle('hidden', activeFilter !== 'all' && !tags.includes(activeFilter));
    });
  });
});

/* ── Modal ── */
function openModal(id) {
  const s = STAGES.find(x => x.id === id);
  if (!s) return;

  const rb = RELOAD_BADGE[Math.min(s.reloads, 4)];
  const steps = s.order.map((step, i) => {
    const isReload = step.toUpperCase().includes('RELOAD');
    return `<li class="order-list-item">
      <span class="step-num ${isReload ? 'reload' : ''}">${i + 1}</span>
      <span>${step}</span>
    </li>`;
  }).join('');

  const alerts = (s.alerts || []).map(a => `<div class="alert-box">${a}</div>`).join('');
  const specialItems = (s.special || []).map(sp => `<div class="alert-box">${sp}</div>`).join('');
  const tagBadges = buildBadges(s);

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-header">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px">${tagBadges}</div>
      <h2>Stage ${s.id}</h2>
      <p>EHC 2026 · Classic Division · 10-round magazines</p>
    </div>

    <div class="modal-image-wrap">
      <img id="modalImg${s.id}" src="images/stage_${String(s.id).padStart(2,'0')}.png" alt="Stage ${s.id}" onload="drawOverlay(${s.id})">
      <canvas class="overlay-canvas" id="overlay${s.id}"></canvas>
    </div>

    <div class="modal-section">
      <h3>Key information</h3>
      <div class="info-row">
        <div class="info-chip"><strong>${s.rounds}</strong> rounds</div>
        <div class="info-chip"><strong>${s.papers}</strong> papers</div>
        <div class="info-chip"><strong>${s.poppers}</strong> poppers</div>
        <div class="info-chip"><strong>${s.plates}</strong> plates</div>
        <div class="info-chip"><strong>${s.ns}</strong> NS targets</div>
        <div class="info-chip"><strong>${s.reloads}</strong> reloads</div>
      </div>
      <div class="info-row">
        <div class="info-chip" style="flex:1"><strong>Start:</strong> ${s.start}</div>
      </div>
      <div class="info-row">
        <div class="info-chip" style="flex:1"><strong>Ready condition:</strong> ${s.ready}</div>
      </div>
    </div>

    ${s.moving !== 'None' ? `
    <div class="modal-section">
      <h3>Moving targets / activations</h3>
      <div class="info-chip" style="display:inline-block">${s.moving}</div>
    </div>` : ''}

    <div class="modal-section">
      <h3>Classic magazine plan (10-round mags)</h3>
      <div class="mag-plan">${s.magPlan}</div>
    </div>

    <div class="modal-section">
      <h3>Recommended shooting order</h3>
      <ol class="order-list">${steps}</ol>
    </div>

    ${s.special && s.special.length > 0 ? `
    <div class="modal-section">
      <h3>Special constraints</h3>
      ${specialItems}
    </div>` : ''}

    <div class="modal-section">
      <h3>Critical alerts</h3>
      ${alerts}
    </div>
  `;

  document.getElementById('backdrop').classList.add('open');
  document.getElementById('modal').classList.add('open');

  // Draw overlay once image is loaded
  const img = document.getElementById(`modalImg${s.id}`);
  if (img.complete) drawOverlay(s.id);
}

function closeModal() {
  document.getElementById('backdrop').classList.remove('open');
  document.getElementById('modal').classList.remove('open');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── Overlay drawing on stage image ── */
function drawOverlay(stageId) {
  const s = STAGES.find(x => x.id === stageId);
  const img = document.getElementById(`modalImg${stageId}`);
  const canvas = document.getElementById(`overlay${stageId}`);
  if (!img || !canvas) return;

  const W = img.clientWidth;
  const H = img.clientHeight;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  // Only draw on the 3D stage diagram portion (lower ~65% of the page image)
  const imgTop = H * 0.36;
  const imgH = H - imgTop;

  /* ── Helper functions ── */
  function circle(x, y, r, fill, stroke, lw) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  function label(text, x, y, bg, fg, size) {
    ctx.font = `bold ${size || 13}px -apple-system, sans-serif`;
    const tw = ctx.measureText(text).width;
    const pad = 5;
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(x - tw/2 - pad, y - size*0.8, tw + pad*2, size*1.4, 4);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y - size*0.1);
  }

  function arrow(x1, y1, x2, y2, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    // arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 12 * Math.cos(angle - 0.4), y2 - 12 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - 12 * Math.cos(angle + 0.4), y2 - 12 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function stepCircle(num, x, y, isReload) {
    const bg = isReload ? '#c05621' : '#2b6cb0';
    circle(x, y, 16, bg, '#fff', 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(num), x, y);
  }

  function alertBanner(text, y) {
    ctx.fillStyle = 'rgba(116,42,42,0.9)';
    ctx.beginPath();
    ctx.roundRect(8, y, W - 16, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#feb2b2';
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠  ' + text, 16, y + 12);
  }

  function infoBanner(text, y) {
    ctx.fillStyle = 'rgba(26,54,93,0.92)';
    ctx.beginPath();
    ctx.roundRect(8, y, W - 16, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#90cdf4';
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 16, y + 12);
  }

  /* ── Per-stage overlay content ── */
  // All coordinate positions are expressed as fractions of the IMAGE portion
  // (not the full page) so they land on the 3D diagram area.
  // cx/cy helpers convert fraction → pixel:
  function cx(fx) { return W * fx; }
  function cy(fy) { return imgTop + imgH * fy; }

  // Draw mag plan banner at top of image area
  infoBanner(`Mags: ${s.magPlan.split('.')[0]}`, imgTop + 4);

  // Draw round-count + reload strip
  const stripY = imgTop + 32;
  ctx.fillStyle = 'rgba(15,17,23,0.85)';
  ctx.beginPath();
  ctx.roundRect(8, stripY, W - 16, 22, 4);
  ctx.fill();
  ctx.fillStyle = '#f6ad55';
  ctx.font = 'bold 11px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${s.rounds} rounds total  |  ${s.reloads} reload${s.reloads !== 1 ? 's' : ''}  |  ${s.ns} NS target${s.ns !== 1 ? 's' : ''}`, 16, stripY + 11);

  // Draw special constraint banner if applicable
  if (s.special && s.special.length > 0) {
    const sc = s.special[0];
    if (sc.includes('WEAK') || sc.includes('STRONG') || sc.includes('Tunnel') || sc.includes('DISAPPEAR') || sc.includes('disappear')) {
      alertBanner(sc, imgTop + 58);
    }
  }

  // Draw numbered shooting order steps positioned on diagram
  // Positions are per-stage based on visual inspection of stage layouts
  const overlays = getStageOverlayData(s.id, W, H, imgTop, imgH);
  overlays.steps.forEach((step, i) => {
    const isReload = s.order[i] && s.order[i].toUpperCase().includes('RELOAD');
    stepCircle(i + 1, step.x, step.y, isReload);
  });

  // Draw movement arrows
  overlays.arrows.forEach(a => {
    arrow(a.x1, a.y1, a.x2, a.y2, a.color || '#68d391');
  });

  // Draw NS target warnings
  overlays.ns.forEach(n => {
    circle(n.x, n.y, 14, 'rgba(197,48,48,0.7)', '#fc8181', 2);
    ctx.fillStyle = '#fc8181';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NS', n.x, n.y);
  });

  // Moving target activation lines
  overlays.movers.forEach(m => {
    ctx.beginPath();
    ctx.arc(m.px, m.py, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(66,153,225,0.8)';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', m.px, m.py);
    arrow(m.px, m.py, m.tx, m.ty, '#68d391');
    ctx.fillStyle = m.disappears ? '#fc8181' : '#9ae6b4';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(m.disappears ? '!' : '✓', m.tx, m.ty);
  });
}

/* ── Per-stage overlay coordinate data ── */
// These positions reflect the general layout of each stage's 3D render.
// cx/cy already computed as absolute pixels passed in.
function getStageOverlayData(id, W, H, imgTop, imgH) {
  function cx(fx) { return W * fx; }
  function cy(fy) { return imgTop + imgH * fy; }

  const defaults = { steps: [], arrows: [], ns: [], movers: [] };

  const data = {
    1: {
      steps: [
        {x:cx(.5), y:cy(.85)},  // 1 pick up
        {x:cx(.5), y:cy(.75)},  // 2 rack
        {x:cx(.25),y:cy(.5)},   // 3 papers left
        {x:cx(.6), y:cy(.4)},   // 4 papers right
        {x:cx(.35),y:cy(.3)},   // 5 P2
        {x:cx(.58),y:cy(.3)},   // 6 P3
        {x:cx(.18),y:cy(.45)},  // 7 T1
        {x:cx(.82),y:cy(.45)},  // 8 T2
        {x:cx(.25),y:cy(.3)},   // 9 P1
      ],
      arrows: [{x1:cx(.5),y1:cy(.82),x2:cx(.3),y2:cy(.55),color:'#68d391'}],
      ns: [{x:cx(.5),y:cy(.45)}],
      movers: [
        {px:cx(.35),py:cy(.28),tx:cx(.18),ty:cy(.42),disappears:false},
        {px:cx(.58),py:cy(.28),tx:cx(.82),ty:cy(.42),disappears:false}
      ]
    },
    2: {
      steps: [
        {x:cx(.5), y:cy(.9)},
        {x:cx(.22),y:cy(.55)},
        {x:cx(.78),y:cy(.55)},
        {x:cx(.35),y:cy(.25)},
        {x:cx(.65),y:cy(.25)},
        {x:cx(.5), y:cy(.65)},
        {x:cx(.5), y:cy(.75)},
        {x:cx(.5), y:cy(.85)},
      ],
      arrows: [
        {x1:cx(.5),y1:cy(.87),x2:cx(.25),y2:cy(.6),color:'#68d391'},
        {x1:cx(.5),y1:cy(.87),x2:cx(.75),y2:cy(.6),color:'#68d391'}
      ],
      ns: [{x:cx(.5),y:cy(.5)}],
      movers: [
        {px:cx(.35),py:cy(.23),tx:cx(.18),ty:cy(.45),disappears:false},
        {px:cx(.65),py:cy(.23),tx:cx(.82),ty:cy(.45),disappears:false}
      ]
    },
    3: {
      steps: [
        {x:cx(.5), y:cy(.88)},
        {x:cx(.28),y:cy(.5)},
        {x:cx(.32),y:cy(.35)},
        {x:cx(.5), y:cy(.68)},
        {x:cx(.72),y:cy(.5)},
        {x:cx(.68),y:cy(.35)},
      ],
      arrows: [
        {x1:cx(.28),y1:cy(.5),x2:cx(.72),y2:cy(.5),color:'#68d391'}
      ],
      ns:[],movers:[]
    },
    4: {
      steps: [
        {x:cx(.5), y:cy(.85)},
        {x:cx(.2), y:cy(.5)},
        {x:cx(.5), y:cy(.35)},
        {x:cx(.8), y:cy(.5)},
        {x:cx(.5), y:cy(.65)},
        {x:cx(.5), y:cy(.5)},
        {x:cx(.5), y:cy(.75)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.83),x2:cx(.22),y2:cy(.55),color:'#68d391'}],
      ns:[{x:cx(.5),y:cy(.48)}],
      movers:[{px:cx(.5),py:cy(.32),tx:cx(.65),ty:cy(.45),disappears:false}]
    },
    5: {
      steps: [
        {x:cx(.5), y:cy(.87)},
        {x:cx(.2), y:cy(.6)},
        {x:cx(.35),y:cy(.6)},
        {x:cx(.5), y:cy(.55)},
        {x:cx(.65),y:cy(.6)},
        {x:cx(.8), y:cy(.6)},
        {x:cx(.5), y:cy(.75)},
      ],
      arrows:[
        {x1:cx(.5),y1:cy(.85),x2:cx(.2),y2:cy(.65),color:'#68d391'},
        {x1:cx(.2),y1:cy(.65),x2:cx(.8),y2:cy(.65),color:'#68d391'}
      ],
      ns:[{x:cx(.15),y:cy(.45)},{x:cx(.85),y:cy(.45)}],
      movers:[]
    },
    6: {
      steps: [
        {x:cx(.5), y:cy(.88)},
        {x:cx(.5), y:cy(.78)},
        {x:cx(.38),y:cy(.35)},
        {x:cx(.28),y:cy(.5)},
        {x:cx(.52),y:cy(.35)},
        {x:cx(.5), y:cy(.68)},
        {x:cx(.62),y:cy(.5)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.86),x2:cx(.38),y2:cy(.4),color:'#68d391'}],
      ns:[],
      movers:[{px:cx(.52),py:cy(.32),tx:cx(.7),ty:cy(.48),disappears:false},{px:cx(.52),py:cy(.32),tx:cx(.78),ty:cy(.48),disappears:false}]
    },
    7: {
      steps: [
        {x:cx(.5), y:cy(.85)},
        {x:cx(.48),y:cy(.3)},
        {x:cx(.28),y:cy(.5)},
        {x:cx(.52),y:cy(.5)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.25),y:cy(.35)},
        {x:cx(.72),y:cy(.4)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.83),x2:cx(.48),y2:cy(.35),color:'#68d391'}],
      ns:[{x:cx(.15),y:cy(.35)},{x:cx(.85),y:cy(.35)}],
      movers:[{px:cx(.48),py:cy(.28),tx:cx(.5),ty:cy(.42),disappears:false}]
    },
    8: {
      steps: [
        {x:cx(.5), y:cy(.88)},
        {x:cx(.48),y:cy(.3)},
        {x:cx(.2), y:cy(.5)},
        {x:cx(.4), y:cy(.5)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.6), y:cy(.5)},
        {x:cx(.8), y:cy(.5)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.86),x2:cx(.48),y2:cy(.35),color:'#f6ad55'}],
      ns:[{x:cx(.28),y:cy(.6)},{x:cx(.72),y:cy(.6)}],
      movers:[{px:cx(.48),py:cy(.28),tx:cx(.5),ty:cy(.4),disappears:false}]
    },
    9: {
      steps: [
        {x:cx(.5), y:cy(.85)},
        {x:cx(.2), y:cy(.55)},
        {x:cx(.38),y:cy(.45)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.62),y:cy(.45)},
        {x:cx(.8), y:cy(.55)},
        {x:cx(.5), y:cy(.8)},
      ],
      arrows:[
        {x1:cx(.5),y1:cy(.83),x2:cx(.2),y2:cy(.6),color:'#68d391'},
        {x1:cx(.2),y1:cy(.6),x2:cx(.8),y2:cy(.6),color:'#68d391'}
      ],
      ns:[{x:cx(.15),y:cy(.48)},{x:cx(.38),y:cy(.35)},{x:cx(.62),y:cy(.35)},{x:cx(.85),y:cy(.48)}],
      movers:[]
    },
    10: {
      steps: [
        {x:cx(.5), y:cy(.85)},
        {x:cx(.32),y:cy(.35)},
        {x:cx(.48),y:cy(.35)},
        {x:cx(.28),y:cy(.55)},
        {x:cx(.55),y:cy(.55)},
        {x:cx(.72),y:cy(.55)},
        {x:cx(.5), y:cy(.7)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.83),x2:cx(.32),y2:cy(.4),color:'#68d391'}],
      ns:[{x:cx(.15),y:cy(.42)}],
      movers:[{px:cx(.48),py:cy(.32),tx:cx(.5),ty:cy(.45),disappears:false}]
    },
    11: {
      steps: [
        {x:cx(.5), y:cy(.85)},
        {x:cx(.42),y:cy(.3)},
        {x:cx(.22),y:cy(.5)},
        {x:cx(.45),y:cy(.5)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.65),y:cy(.45)},
        {x:cx(.5), y:cy(.8)},
        {x:cx(.38),y:cy(.4)},
        {x:cx(.48),y:cy(.4)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.83),x2:cx(.42),y2:cy(.35),color:'#68d391'}],
      ns:[{x:cx(.3),y:cy(.32)},{x:cx(.7),y:cy(.32)},{x:cx(.75),y:cy(.55)}],
      movers:[
        {px:cx(.42),py:cy(.28),tx:cx(.35),ty:cy(.42),disappears:false},
        {px:cx(.42),py:cy(.28),tx:cx(.5),ty:cy(.42),disappears:false}
      ]
    },
    12: {
      steps: [
        {x:cx(.5), y:cy(.85)},
        {x:cx(.35),y:cy(.35)},
        {x:cx(.65),y:cy(.35)},
        {x:cx(.42),y:cy(.55)},
        {x:cx(.22),y:cy(.5)},
        {x:cx(.28),y:cy(.42)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.72),y:cy(.5)},
        {x:cx(.78),y:cy(.42)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.83),x2:cx(.35),y2:cy(.4),color:'#68d391'}],
      ns:[],
      movers:[
        {px:cx(.35),py:cy(.32),tx:cx(.18),ty:cy(.48),disappears:false},
        {px:cx(.65),py:cy(.32),tx:cx(.82),ty:cy(.48),disappears:false}
      ]
    },
    13: {
      steps: [
        {x:cx(.5), y:cy(.85)},
        {x:cx(.3), y:cy(.35)},
        {x:cx(.38),y:cy(.5)},
        {x:cx(.52),y:cy(.5)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.72),y:cy(.5)},
        {x:cx(.5), y:cy(.8)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.83),x2:cx(.3),y2:cy(.4),color:'#68d391'}],
      ns:[{x:cx(.75),y:cy(.55)}],
      movers:[{px:cx(.3),py:cy(.32),tx:cx(.5),ty:cy(.42),disappears:false}]
    },
    14: {
      steps: [
        {x:cx(.5), y:cy(.88)},
        {x:cx(.52),y:cy(.32)},
        {x:cx(.42),y:cy(.32)},
        {x:cx(.43),y:cy(.45)},
        {x:cx(.38),y:cy(.55)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.62),y:cy(.5)},
        {x:cx(.5), y:cy(.8)},
        {x:cx(.52),y:cy(.45)},
        {x:cx(.55),y:cy(.32)},
      ],
      arrows:[
        {x1:cx(.5),y1:cy(.86),x2:cx(.52),y2:cy(.37),color:'#68d391'},
        {x1:cx(.42),y1:cy(.35),x2:cx(.38),y2:cy(.5),color:'#fc8181'}
      ],
      ns:[{x:cx(.65),y:cy(.35)}],
      movers:[
        {px:cx(.52),py:cy(.3),tx:cx(.55),ty:cy(.45),disappears:false},
        {px:cx(.42),py:cy(.3),tx:cx(.3),ty:cy(.42),disappears:true},
        {px:cx(.42),py:cy(.3),tx:cx(.38),ty:cy(.42),disappears:true}
      ]
    },
    15: {
      steps: [
        {x:cx(.5), y:cy(.85)},
        {x:cx(.2), y:cy(.55)},
        {x:cx(.38),y:cy(.45)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.62),y:cy(.45)},
        {x:cx(.8), y:cy(.55)},
        {x:cx(.5), y:cy(.8)},
      ],
      arrows:[
        {x1:cx(.5),y1:cy(.83),x2:cx(.2),y2:cy(.6),color:'#68d391'},
        {x1:cx(.2),y1:cy(.6),x2:cx(.8),y2:cy(.6),color:'#68d391'}
      ],
      ns:[{x:cx(.15),y:cy(.48)},{x:cx(.35),y:cy(.35)},{x:cx(.65),y:cy(.35)},{x:cx(.85),y:cy(.48)}],
      movers:[]
    },
    16: {
      steps: [
        {x:cx(.5), y:cy(.88)},
        {x:cx(.22),y:cy(.5)},
        {x:cx(.35),y:cy(.5)},
        {x:cx(.5), y:cy(.72)},
        {x:cx(.65),y:cy(.5)},
        {x:cx(.78),y:cy(.5)},
      ],
      arrows:[{x1:cx(.22),y1:cy(.5),x2:cx(.78),y2:cy(.5),color:'#f6ad55'}],
      ns:[{x:cx(.15),y:cy(.42)},{x:cx(.38),y:cy(.38)},{x:cx(.62),y:cy(.38)},{x:cx(.85),y:cy(.42)}],
      movers:[]
    },
    17: {
      steps: [
        {x:cx(.5), y:cy(.88)},
        {x:cx(.2), y:cy(.55)},
        {x:cx(.35),y:cy(.45)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.65),y:cy(.45)},
        {x:cx(.8), y:cy(.55)},
        {x:cx(.5), y:cy(.8)},
      ],
      arrows:[
        {x1:cx(.5),y1:cy(.86),x2:cx(.2),y2:cy(.6),color:'#68d391'},
        {x1:cx(.2),y1:cy(.6),x2:cx(.8),y2:cy(.6),color:'#68d391'}
      ],
      ns:[{x:cx(.12),y:cy(.45)},{x:cx(.5),y:cy(.32)},{x:cx(.88),y:cy(.45)}],
      movers:[]
    },
    18: {
      steps: [
        {x:cx(.5), y:cy(.87)},
        {x:cx(.4), y:cy(.3)},
        {x:cx(.28),y:cy(.5)},
        {x:cx(.45),y:cy(.5)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.65),y:cy(.5)},
        {x:cx(.75),y:cy(.5)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.85),x2:cx(.4),y2:cy(.35),color:'#68d391'}],
      ns:[{x:cx(.25),y:cy(.62)}],
      movers:[{px:cx(.4),py:cy(.28),tx:cx(.5),ty:cy(.42),disappears:false}]
    },
    19: {
      steps: [
        {x:cx(.5), y:cy(.88)},
        {x:cx(.3), y:cy(.35)},
        {x:cx(.55),y:cy(.35)},
        {x:cx(.3), y:cy(.55)},
        {x:cx(.5), y:cy(.55)},
        {x:cx(.5), y:cy(.72)},
        {x:cx(.65),y:cy(.5)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.86),x2:cx(.3),y2:cy(.4),color:'#68d391'}],
      ns:[{x:cx(.72),y:cy(.55)}],
      movers:[{px:cx(.55),py:cy(.32),tx:cx(.5),ty:cy(.42),disappears:false}]
    },
    20: {
      steps: [
        {x:cx(.5), y:cy(.87)},
        {x:cx(.2), y:cy(.55)},
        {x:cx(.35),y:cy(.45)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.65),y:cy(.5)},
        {x:cx(.8), y:cy(.45)},
        {x:cx(.5), y:cy(.8)},
      ],
      arrows:[
        {x1:cx(.5),y1:cy(.85),x2:cx(.2),y2:cy(.6),color:'#68d391'},
        {x1:cx(.2),y1:cy(.6),x2:cx(.8),y2:cy(.5),color:'#68d391'}
      ],
      ns:[{x:cx(.5),y:cy(.3)},{x:cx(.18),y:cy(.42)},{x:cx(.82),y:cy(.42)}],
      movers:[]
    },
    21: {
      steps: [
        {x:cx(.5), y:cy(.88)},
        {x:cx(.22),y:cy(.5)},
        {x:cx(.35),y:cy(.45)},
        {x:cx(.5), y:cy(.7)},
        {x:cx(.65),y:cy(.5)},
        {x:cx(.78),y:cy(.5)},
        {x:cx(.5), y:cy(.8)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.86),x2:cx(.22),y2:cy(.55),color:'#68d391'}],
      ns:[{x:cx(.42),y:cy(.35)},{x:cx(.58),y:cy(.35)}],
      movers:[]
    },
    22: {
      steps: [
        {x:cx(.5), y:cy(.8)},
        {x:cx(.18),y:cy(.55)},
        {x:cx(.28),y:cy(.48)},
        {x:cx(.5), y:cy(.65)},
        {x:cx(.58),y:cy(.48)},
        {x:cx(.82),y:cy(.55)},
        {x:cx(.5), y:cy(.75)},
      ],
      arrows:[
        {x1:cx(.5),y1:cy(.78),x2:cx(.18),y2:cy(.6),color:'#68d391'},
        {x1:cx(.18),y1:cy(.6),x2:cx(.82),y2:cy(.6),color:'#68d391'}
      ],
      ns:[{x:cx(.15),y:cy(.48)},{x:cx(.85),y:cy(.48)}],
      movers:[]
    },
    23: {
      steps: [
        {x:cx(.5), y:cy(.87)},
        {x:cx(.42),y:cy(.35)},
        {x:cx(.42),y:cy(.45)},
        {x:cx(.55),y:cy(.35)},
        {x:cx(.28),y:cy(.55)},
        {x:cx(.45),y:cy(.55)},
        {x:cx(.5), y:cy(.72)},
        {x:cx(.75),y:cy(.5)},
        {x:cx(.85),y:cy(.5)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.85),x2:cx(.42),y2:cy(.4),color:'#68d391'}],
      ns:[{x:cx(.12),y:cy(.5)},{x:cx(.88),y:cy(.5)}],
      movers:[{px:cx(.42),py:cy(.32),tx:cx(.5),ty:cy(.42),disappears:true}]
    },
    24: {
      steps: [
        {x:cx(.5), y:cy(.88)},
        {x:cx(.5), y:cy(.78)},
        {x:cx(.3), y:cy(.45)},
        {x:cx(.58),y:cy(.45)},
        {x:cx(.25),y:cy(.55)},
        {x:cx(.48),y:cy(.55)},
        {x:cx(.65),y:cy(.55)},
      ],
      arrows:[{x1:cx(.5),y1:cy(.86),x2:cx(.3),y2:cy(.5),color:'#f6ad55'},{x1:cx(.3),y1:cy(.5),x2:cx(.65),y2:cy(.5),color:'#f6ad55'}],
      ns:[],
      movers:[
        {px:cx(.3),py:cy(.42),tx:cx(.22),ty:cy(.52),disappears:false},
        {px:cx(.58),py:cy(.42),tx:cx(.68),ty:cy(.52),disappears:false}
      ]
    }
  };

  return data[id] || defaults;
}

/* ── Init ── */
renderHeaderStats();
renderGrid();
