(function () {
  const KEY = 'perfil:datos';   // con prefijo: el localStorage es del origen de la página (3000), compartido
  function mount(el, props) {
    const g = JSON.parse(localStorage.getItem(KEY) || '{}');
    el.innerHTML = `<style>.per-form{display:grid;gap:8px;max-width:320px}</style>
      <h2>Perfil</h2>
      <div class="per-form">
        <input class="per-nombre" placeholder="Nombre">
        <input class="per-correo" placeholder="Correo">
        <button class="per-guardar">Guardar</button>
        <small class="per-msg"></small>
      </div>`;
    el.querySelector('.per-nombre').value = g.nombre || props.usuario || '';
    el.querySelector('.per-correo').value = g.correo || '';
    el.querySelector('.per-guardar').onclick = () => {
      localStorage.setItem(KEY, JSON.stringify({
        nombre: el.querySelector('.per-nombre').value,
        correo: el.querySelector('.per-correo').value }));
      el.querySelector('.per-msg').textContent = 'Guardado ✓';
    };
  }
  function unmount(el) { el.innerHTML = ''; }
  window.MFE_perfil = { version: '1.0.0', mount, unmount };
})();