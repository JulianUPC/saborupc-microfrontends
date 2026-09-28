(function () {
  let items = [];
  let raiz = null;
  const total = () => items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const cantidad = () => items.reduce((s, i) => s + i.cantidad, 0);
  const fmt = n => '$' + n.toLocaleString('es-CO');

  function publicarActualizado() {
    window.dispatchEvent(new CustomEvent('carrito:actualizado', {
      detail: { version: 1, cantidad: cantidad(), total: total() }
    }));
  }

  // Escucha siempre (el contenedor lo precarga), esté montado o no
  window.addEventListener('carrito:item-agregado', (e) => {
    const d = e.detail;
    const ex = items.find(i => i.id === d.id);
    if (ex) ex.cantidad += d.cantidad || 1;     // tolera campos ausentes
    else items.push({ id: d.id, nombre: d.nombre, precio: d.precio, cantidad: d.cantidad || 1 });
    publicarActualizado();
    pintar();
  });

  function pintar() {
    if (!raiz) return;
    raiz.querySelector('.car-cuerpo').innerHTML = items.length ? `
      <ul>${items.map(i => `<li>${i.nombre} × ${i.cantidad} — ${fmt(i.precio * i.cantidad)}
        <button data-quitar="${i.id}">✕</button></li>`).join('')}</ul>
      <p><b>Total: ${fmt(total())}</b></p>
      <button class="car-confirmar">Confirmar pedido</button>` : '<p>Tu carrito está vacío.</p>';
  }

  function confirmar() {
    const pedido = { version: 1, id: Date.now() % 100000, items: items.map(i => ({ ...i })), total: total(), fecha: new Date().toISOString() };
    items = [];
    window.dispatchEvent(new CustomEvent('pedido:confirmado', { detail: pedido }));
    publicarActualizado();
  }

  function mount(el) {
    raiz = el;
    el.innerHTML = `<style>.car-cuerpo li{margin:6px 0}.car-confirmar{background:var(--color-ok,#2f9e44);color:#fff;border:0;padding:8px 14px;border-radius:6px;cursor:pointer}</style>
      <h2>Carrito</h2><div class="car-cuerpo"></div>`;
    el.querySelector('.car-cuerpo').onclick = (e) => {
      if (e.target.dataset.quitar) {
        items = items.filter(i => i.id != e.target.dataset.quitar);
        publicarActualizado(); pintar();
      }
      if (e.target.classList.contains('car-confirmar')) confirmar();
    };
    pintar();
  }
  function unmount(el) { el.innerHTML = ''; raiz = null; }

  window.MFE_carrito = { version: '1.0.0', mount, unmount };
})();