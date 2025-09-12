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
});
