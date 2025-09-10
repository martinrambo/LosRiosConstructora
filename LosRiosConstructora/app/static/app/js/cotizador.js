// Dataset DEMO (puedes reemplazarlo por JSON desde Django)
const WINDOWS = [
  {
    id: "wintec-140x120-mono",
    sistema: "Americana",
    marca: "WINTEC",
    vidrio: "Monolítico",
    medida: "140x120",
    precio: 109990,
    img: STATIC_URL("app/img/windows/wintec_140x120.jpg"),
    nombre: "Ventana PVC 140×120 cm monolítico blanco corredera"
  },
  {
    id: "generica-120x100-dvh",
    sistema: "Europea",
    marca: "GENÉRICA",
    vidrio: "Termopanel",
    medida: "120x100",
    precio: 154990,
    img: STATIC_URL("app/img/windows/generica_120x100.jpg"),
    nombre: "Ventana PVC 120×100 cm termopanel corredera"
  }
];

/* ===== Utilidad para construir rutas estáticas sin mezclar Django dentro del JS.
   Cambia BASE_STATIC si tu carpeta cambia, o si prefieres, genera el JSON desde Django con las URLs absolutas. */
const BASE_STATIC = document.querySelector("link[rel='stylesheet'][href*='/static/']")
  ? document.querySelector("link[rel='stylesheet'][href*='/static/']").href.split("/app/")[0] + "/"
  : "/static/";
function STATIC_URL(path){ return BASE_STATIC + path; }

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// --- Render de opciones de "sistema" a partir de los datos
(function initVentanas(){
  const sistemas = [...new Set(WINDOWS.map(w => w.sistema))]; // ej: ["Americana", "Europea"]
  const cont = document.getElementById('opt-sistema');

  sistemas.forEach((s,i) => {
    const id = `sys-${i}`;
    const chip = document.createElement('label');
    chip.className = 'radio-chip';
    chip.innerHTML = `
      <input type="radio" name="sistema" value="${s}" ${i===0?'checked':''}>
      <span>${s}</span>
    `;
    cont.appendChild(chip);
  });

  // Estado inicial
  updatePreview();

  // Listeners
  cont.addEventListener('change', () => {
    // activar estilo
    $$('#opt-sistema .radio-chip').forEach(l => l.classList.remove('active'));
    const checked = $('#opt-sistema input:checked')?.closest('.radio-chip');
    checked && checked.classList.add('active');
    updatePreview();
  });
  $('#sel-vidrio').addEventListener('change', updatePreview);
  $('#sel-medida').addEventListener('change', updatePreview);
  $('#sel-marca').addEventListener('change', updatePreview);

  // Marcar activo visual del primero
  const firstChip = $('#opt-sistema .radio-chip');
  firstChip && firstChip.classList.add('active');

  // Agregar al pedido (demo)
  $('#btn-add-ventana').addEventListener('click', () => {
    const sel = pickCurrent();
    if(!sel){ alert('Completa las selecciones de ventana.'); return; }
    // Aquí puedes hacer POST via fetch a tu endpoint Django para agregar al carrito/cotización
    console.log('Agregar item:', sel);
    alert('Ventana agregada a la cotización.');
  });
})();

function pickCurrent(){
  const sistema = $('#opt-sistema input:checked')?.value || '';
  const vidrio  = $('#sel-vidrio').value || '';
  const medida  = $('#sel-medida').value || '';
  const marca   = $('#sel-marca').value || '';

  if(!sistema || !vidrio || !medida || !marca) return null;

  // Buscar coincidencia exacta en dataset (si no hay, arma un ítem estimado)
  let item = WINDOWS.find(w => 
    w.sistema===sistema && w.vidrio===vidrio && w.medida===medida && w.marca===marca
  );

  if(!item){
    // Item “estimado” (sin foto específica)
    item = {
      sistema, vidrio, medida, marca,
      precio: null,
      img: STATIC_URL("app/img/windows/placeholder_window.png"),
      nombre: `Ventana ${sistema} ${medida} ${vidrio}`
    };
  }
  return item;
}

function updatePreview(){
  const item = pickCurrent();
  const title = $('#preview-title');
  const desc  = $('#preview-desc');
  const price = $('#preview-price');
  const img   = $('#preview-img');

  if(!item){
    title.textContent = 'Selecciona una opción';
    desc.textContent  = 'Aquí verás el detalle de la ventana elegida.';
    price.textContent = '—';
    return;
  }

  title.textContent = `Ventana ${item.sistema} ${item.medida}`;
  desc.innerHTML    = `${item.nombre} <span class="badge">Marca: ${item.marca}</span> · <span class="badge">${item.vidrio}</span>`;
  price.textContent = (item.precio!=null) ? clp(item.precio) : 'Precio a confirmar';
  if(item.img) img.src = item.img;
}

function clp(n){ 
  return new Intl.NumberFormat('es-CL', { style:'currency', currency:'CLP', maximumFractionDigits:0 }).format(n);
}
