// =====================
// Modales de ayuda
// =====================
document.addEventListener('DOMContentLoaded', () => {
  function wireHelp(selectId, btnId, modalId){
    const select = document.getElementById(selectId);
    const btn    = document.getElementById(btnId);
    const modal  = document.getElementById(modalId);
    if (!select || !btn || !modal) return; // defensivo por si falta algo
    const close  = modal.querySelector('.close');

    // Mostrar el botón al interactuar con este select
    select.addEventListener('click', () => {
      btn.style.display = 'inline-block';
    });

    // Ocultar el botón si se hace click en otro select
    document.querySelectorAll('select').forEach(s => {
      if (s !== select) {
        s.addEventListener('click', () => { btn.style.display = 'none'; });
      }
    });

    // Abrir modal
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden','false');
    });

    // Cerrar modal (X)
    if (close){
      close.addEventListener('click', () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden','true');
      });
    }

    // Cerrar si clic en overlay
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden','true');
      }
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden','true');
      }
    });
  }

  // Conecta cada trío select-botón-modal
  wireHelp('tipo-radier',         'help-radier',   'modal-radier');
  wireHelp('tipo-hormigon',       'help-hormigon', 'modal-hormigon');
  wireHelp('tipo-dosificacion',   'help-dosi',     'modal-dosificacion');
  wireHelp('tipo-emplazamiento',  'help-empla',    'modal-empla');
  wireHelp('tipo-elevacion',  'help-elevacion',    'modal-elevacion');
  wireHelp('tipo-madera',  'help-madera',    'modal-madera');
  wireHelp('tipo-vulco',  'help-vulcometal',    'modal-vulcometal');
  wireHelp('tipo-sip',  'help-sip',    'modal-sip');
  wireHelp('tipo-muro',  'help-muro',    'modal-muro');
  wireHelp('tipo-ladrillo',  'help-ladrillo',    'modal-ladrillo');
});


// =====================
// Wizard (navegación + validación)
// =====================
(() => {
  const track  = document.getElementById('wiz-track');
  const steps  = Array.from(track.querySelectorAll('.step'));
  const prev   = document.getElementById('wiz-prev');
  const next   = document.getElementById('wiz-next');
  const submit = document.getElementById('wiz-submit');
  const fill   = document.getElementById('wiz-progress-fill');
  const ol     = document.getElementById('wiz-steps');

  // Tabs (botones)
  let tabs = Array.from(ol.querySelectorAll('.step-tab'));
  // Defensa: si faltan tabs o no coinciden con steps, las reindexamos (sin tocar el HTML visible)
  tabs.forEach((btn, idx) => {
    btn.dataset.step = String(idx);
    const stepId = steps[idx]?.id || '';
    if (stepId) btn.setAttribute('aria-controls', stepId);
  });

  let i = 0;

  function updateUI(){
    track.style.transform = `translateX(-${i*100}%)`;
    prev.disabled = (i===0);
    next.hidden   = (i===steps.length-1);
    submit.hidden = !(i===steps.length-1);

    const pct = Math.round((i)/(steps.length-1)*100);
    fill.style.width = `${pct}%`;

    // Estado visual (li activo) y accesibilidad (aria-selected en botón)
    Array.from(ol.children).forEach((li, idx)=>{
      li.classList.toggle('active', idx<=i);
    });
    tabs.forEach((btn, idx)=>{
      btn.classList.toggle('active', idx===i);
      btn.setAttribute('aria-selected', idx===i ? 'true' : 'false');
    });

    // Actualiza hash para deep-linking
    if (steps[i]?.id) {
      history.replaceState(null, '', `#${steps[i].id}`);
    }

    if (i===steps.length-1) buildSummary();
  }

  // Valida SOLO el paso "idx"
  function validateStep(idx){
    const required = steps[idx].querySelectorAll('select[required], input[required]');
    for (const el of required){
      if (!el.value) { el.focus(); return false; }
    }
    return true;
  }

  // Valida TODOS y retorna el primero inválido, o -1 si todo OK
  function firstInvalidStep(){
    for (let k=0; k<steps.length; k++){
      if (!validateStep(k)) return k;
    }
    return -1;
  }

  // Navega a "idx"; si requireValid, exige validación del paso actual al avanzar
  function goTo(idx, { requireValid = false } = {}){
    idx = Math.max(0, Math.min(steps.length-1, idx));
    const goingForward = idx > i;
    if (requireValid && goingForward) {
      if (!validateStep(i)) return;
    }
    i = idx;
    updateUI();
  }

  // Construye resumen con campos claves
  function buildSummary(){
    const map = [
      ['tipo-emplazamiento','Emplazamiento'],
      ['tipo-radier','Tipo de radier'],
      ['tipo-hormigon','Hormigón'],
      ['tipo-dosificacion','Dosificación (cono)'],
      ['tipo-Elevacion','Elevaciones/Estructura'],
      // Ventanas
      ['sel-vidrio_2','Vidrio (Ventanas)'],
      ['sel-medida_2','Medida (Ventanas)'],
      ['sel-marca_2','Marca (Ventanas)']
    ];
    const out = [];
    map.forEach(([id,label])=>{
      const el = document.getElementById(id);
      if (el){
        const text = el.options ? (el.options[el.selectedIndex]?.text || '') : (el.value || '');
        out.push(`<div><strong>${label}:</strong> ${text || '—'}</div>`);
      }
    });
    const container = document.getElementById('wiz-summary');
    if (container) container.innerHTML = out.join('');
  }

  // Botones Anterior/Siguiente/Enviar
  prev.addEventListener('click', () => goTo(i-1, { requireValid: false }));
  next.addEventListener('click', () => goTo(i+1, { requireValid: true  }));

  submit.addEventListener('click', () => {
    const bad = firstInvalidStep();
    if (bad !== -1) {
      goTo(bad, { requireValid: false });
      alert('Faltan datos obligatorios en este paso.');
      return;
    }
    alert('Formulario listo para enviar');
    // TODO: aquí haces el POST real si corresponde
  });

  // Clic en la barra de pasos (delegación a .step-tab)
  ol.addEventListener('click', (e) => {
    const btn = e.target.closest('.step-tab');
    if (!btn) return;
    const idx = parseInt(btn.dataset.step, 10);
    goTo(idx, { requireValid: false });
  });

  // Navegación teclado global (flechas)
  document.addEventListener('keydown', (e)=>{
    if (e.key==='ArrowRight') goTo(i+1, { requireValid: true  });
    if (e.key==='ArrowLeft')  goTo(i-1, { requireValid: false });
  });

  // Deep-link inicial por hash (ej: #step-radier)
  const hash = location.hash.slice(1);
  if (hash) {
    const idx = steps.findIndex(s => s.id === hash);
    if (idx >= 0) i = idx;
  }

  updateUI();
})();


// ====== Dependencias Elevación ======
const tipoElevacion = document.getElementById("tipo-elevacion");
const selMadera     = document.getElementById("tipo-madera");
const selVulco      = document.getElementById("tipo-vulco");
const selSip        = document.getElementById("tipo-sip");
const selMuro       = document.getElementById("tipo-muro");
const selLadrillo   = document.getElementById("tipo-ladrillo");

const wrapMadera   = document.getElementById("wrap-madera");
const wrapVulco    = document.getElementById("wrap-vulco");
const wrapSip      = document.getElementById("wrap-sip");
const wrapMuro     = document.getElementById("wrap-muro");
const wrapLadrillo = document.getElementById("wrap-ladrillo");

// helpers: mostrar/ocultar WRAPPERS
function showWrap(wrap) {
  if (!wrap) return;
  wrap.style.display = "block";
  const s = wrap.querySelector("select");
  if (s) { s.required = true; s.disabled = false; }
}
function hideWrap(wrap) {
  if (!wrap) return;
  wrap.style.display = "none";
  const s = wrap.querySelector("select");
  if (s) { s.required = false; s.disabled = true; s.value = ""; }
}
function hideAll() {
  [wrapMadera, wrapVulco, wrapSip, wrapMuro, wrapLadrillo].forEach(hideWrap);
}

// cambio principal
tipoElevacion.addEventListener("change", function () {
  hideAll();
  if (this.value === "Emadera") {
    showWrap(wrapMadera);
  } else if (this.value === "Evulco") {
    showWrap(wrapVulco);
  } else if (this.value === "Esip") {
    showWrap(wrapSip);
  } else if (this.value === "Esolido") {
    showWrap(wrapMuro);
    hideWrap(wrapLadrillo); // por si venía abierto
  }
});

// subdependencia: ladrillo dentro de muro
selMuro.addEventListener("change", function () {
  if (this.value === "ladrillo") {
    showWrap(wrapLadrillo);
  } else {
    hideWrap(wrapLadrillo);
  }
});

// estado inicial (por si hay valores precargados)
tipoElevacion.dispatchEvent(new Event("change"));



