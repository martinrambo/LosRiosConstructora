document.addEventListener('DOMContentLoaded', () => {

  function wireHelp(selectId, btnId, modalId){
    const select = document.getElementById(selectId);
    const btn    = document.getElementById(btnId);
    const modal  = document.getElementById(modalId);
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
    close.addEventListener('click', () => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden','true');
    });

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
  wireHelp('tipo-radier',   'help-radier',   'modal-radier');
  wireHelp('tipo-hormigon', 'help-hormigon', 'modal-hormigon');
  wireHelp('tipo-dosificacion', 'help-dosi', 'modal-dosificacion');
  wireHelp('tipo-emplazamiento', 'help-empla', 'modal-empla');
});


(() => {
  const track = document.getElementById('wiz-track');
  const steps = Array.from(track.querySelectorAll('.step'));
  const prev  = document.getElementById('wiz-prev');
  const next  = document.getElementById('wiz-next');
  const submit= document.getElementById('wiz-submit');
  const fill  = document.getElementById('wiz-progress-fill');
  const ol    = document.getElementById('wiz-steps');
  let i = 0;

  // Sincroniza títulos por si cambias data-title
  if (ol && ol.children.length !== steps.length) {
    ol.innerHTML = steps.map(s => `<li>${s.dataset.title||'Paso'}</li>`).join('');
  }

  function updateUI(){
    track.style.transform = `translateX(-${i*100}%)`;
    prev.disabled = (i===0);
    next.hidden   = (i===steps.length-1);
    submit.hidden = !(i===steps.length-1);

    const pct = Math.round((i)/(steps.length-1)*100);
    fill.style.width = `${pct}%`;

    ol.querySelectorAll('li').forEach((li,idx)=>{
      li.classList.toggle('active', idx<=i);
    });

    if (i===steps.length-1) buildSummary();
  }

  function validateStep(idx){
    const required = steps[idx].querySelectorAll('select[required], input[required]');
    for (const el of required){
      if (!el.value) { el.focus(); return false; }
    }
    return true;
  }

  function buildSummary(){
    const map = [
      ['tipo-radier','Tipo de radier'],
      ['tipo-hormigon','Hormigón'],
      ['tipo-dosificacion','Dosificación (cono)'],
      ['sel-vidrio','Vidrio (Paso 1)'],
      ['sel-medida','Medida (Paso 1)'],
      ['sel-marca','Marca (Paso 1)'],
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

  prev.addEventListener('click', () => { i=Math.max(0,i-1); updateUI(); });
  next.addEventListener('click', () => { if(!validateStep(i)) return; i=Math.min(steps.length-1,i+1); updateUI(); });
  submit.addEventListener('click', () => {
    if(!validateStep(i)) return;
    // TODO: aquí haces submit real (fetch/POST) o navegas a confirmación
    alert('Formulario listo para enviar');
  });

  // Navegación teclado
  document.addEventListener('keydown', (e)=>{
    if (e.key==='ArrowRight') next.click();
    if (e.key==='ArrowLeft')  prev.click();
  });

  updateUI();
})();







































