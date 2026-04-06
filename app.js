// ===========================
//  DATA & CONFIG
// ===========================

const iconColors = [
  { bg: 'ic-blue',   stroke: '#1a6ef5' },
  { bg: 'ic-purple', stroke: '#7c3aed' },
  { bg: 'ic-green',  stroke: '#16a34a' },
  { bg: 'ic-amber',  stroke: '#d97706' },
];

let medicines = [
  { id: 1, name: 'Paracétamol',  dose: '500 mg',   freq: '3x par jour', time: '08:00', notes: 'Avec de la nourriture', taken: true,  ic: 0 },
  { id: 2, name: 'Amoxicilline', dose: '1000 mg',  freq: '2x par jour', time: '12:00', notes: '',                      taken: false, ic: 1 },
  { id: 3, name: 'Vitamine D',   dose: '1000 UI',  freq: '1x par jour', time: '07:30', notes: 'À jeun',                taken: false, ic: 2 },
];

let nextId = 4;


// ===========================
//  SVG HELPERS
// ===========================

function pillSVG(stroke) {
  return `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="10" width="20" height="4" rx="2"/>
      <rect x="8" y="6" width="8" height="12" rx="4"/>
    </svg>`;
}

function checkSVG() {
  return `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;
}

function crossSVG() {
  return `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="#ef4444" stroke-width="2.5" stroke-linecap="round">
      <line x1="18" y1="6"  x2="6"  y2="18"/>
      <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>`;
}

function pendingDot() {
  return `<div style="width:8px;height:8px;border-radius:50%;background:#d1d5db;"></div>`;
}


// ===========================
//  RENDER
// ===========================

function render() {
  const list = document.getElementById('med-list');

  if (medicines.length === 0) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-ico">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
               stroke="#8888aa" stroke-width="2" stroke-linecap="round">
            <rect x="2" y="10" width="20" height="4" rx="2"/>
            <rect x="8" y="6"  width="8"  height="12" rx="4"/>
          </svg>
        </div>
        <div class="empty-title">Aucun médicament</div>
        <div class="empty-sub">Ajoutez votre premier médicament</div>
      </div>`;
    updateStats();
    return;
  }

  list.innerHTML = medicines.map(m => {
    const ic = iconColors[m.ic % iconColors.length];
    return `
      <div class="med-card" id="mc-${m.id}">
        <div class="med-icon ${ic.bg}">${pillSVG(ic.stroke)}</div>
        <div class="med-body">
          <div class="med-name">${m.name}</div>
          <div class="med-row">
            <span class="med-dose">${m.dose}</span>
            <span class="med-freq">${m.freq}</span>
          </div>
          ${m.notes ? `<div class="med-note">${m.notes}</div>` : ''}
        </div>
        <div class="med-right">
          <span class="med-time">${m.time}</span>
          <div class="med-actions">
            <div class="med-taken ${m.taken ? 'done' : 'pending'}"
                 onclick="toggleTaken(${m.id})"
                 title="${m.taken ? 'Pris' : 'Marquer comme pris'}">
              ${m.taken ? checkSVG() : pendingDot()}
            </div>
            <div class="del-btn" onclick="delMed(${m.id})">${crossSVG()}</div>
          </div>
        </div>
      </div>`;
  }).join('');

  updateStats();
}


// ===========================
//  STATS
// ===========================

function updateStats() {
  document.getElementById('cnt-today').textContent = medicines.length;
  document.getElementById('cnt-taken').textContent  = medicines.filter(m => m.taken).length;
}


// ===========================
//  ACTIONS
// ===========================

function toggleTaken(id) {
  const m = medicines.find(x => x.id === id);
  if (m) {
    m.taken = !m.taken;
    render();
  }
}

function delMed(id) {
  const el = document.getElementById('mc-' + id);
  if (!el) return;
  el.style.transition = 'all 0.22s ease';
  el.style.opacity    = '0';
  el.style.transform  = 'translateX(20px)';
  setTimeout(() => {
    medicines = medicines.filter(x => x.id !== id);
    render();
  }, 220);
}


// ===========================
//  MODAL SHEET
// ===========================

function openSheet() {
  document.getElementById('overlay').classList.add('show');
}

function closeSheet() {
  document.getElementById('overlay').classList.remove('show');
}

function handleOverlay(e) {
  if (e.target === document.getElementById('overlay')) closeSheet();
}


// ===========================
//  ADD MEDICINE
// ===========================

function addMed() {
  const name  = document.getElementById('f-name').value.trim();
  const dose  = document.getElementById('f-dose').value.trim();
  const time  = document.getElementById('f-time').value;
  const freq  = document.getElementById('f-freq').value;
  const notes = document.getElementById('f-notes').value.trim();

  // Validation highlight
  setFieldError('f-name', !name);
  setFieldError('f-dose', !dose);
  setFieldError('f-freq', !freq);

  if (!name || !dose || !freq) return;

  medicines.push({ id: nextId, name, dose, freq, time, notes, taken: false, ic: nextId });
  nextId++;

  render();
  closeSheet();
  resetForm();
  showToast(`${name} ajouté avec succès`);
}

function setFieldError(id, hasError) {
  document.getElementById(id).style.borderColor = hasError ? '#ef4444' : '#eaeaf5';
}

function resetForm() {
  ['f-name', 'f-dose', 'f-notes'].forEach(id => {
    const el = document.getElementById(id);
    el.value = '';
    el.style.borderColor = '#eaeaf5';
  });
  document.getElementById('f-freq').value = '';
  document.getElementById('f-time').value = '08:00';
}


// ===========================
//  TOAST
// ===========================

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}


// ===========================
//  INIT
// ===========================

document.addEventListener('DOMContentLoaded', render);
