(function () {
  const PRODUCTOS = [
    { id: 1, nombre: 'Arepa de huevo', categoria: 'Desayuno', precio: 4500 },
    { id: 2, nombre: 'Empanada', categoria: 'Desayuno', precio: 2500 },
    { id: 3, nombre: 'Bandeja paisa', categoria: 'Almuerzo', precio: 18000 },
    { id: 4, nombre: 'Sancocho', categoria: 'Almuerzo', precio: 16000 },
    { id: 5, nombre: 'Limonada de coco', categoria: 'Bebidas', precio: 5000 },
    { id: 6, nombre: 'Jugo de mango', categoria: 'Bebidas', precio: 4000 },
  ];
  let raiz = null;

  function pintar() {
    const q = raiz.querySelector('.cat-buscar').value.toLowerCase();
    const c = raiz.querySelector('.cat-categoria').value;
    const lista = PRODUCTOS.filter(p => p.nombre.toLowerCase().includes(q) && (!c || p.categoria === c));
    raiz.querySelector('.cat-lista').innerHTML = lista.map(p => `
      <div class="cat-card"><h3>${p.nombre}</h3><small>${p.categoria}</small>
        <p>$${p.precio.toLocaleString('es-CO')}</p>
        <button data-id="${p.id}">Agregar</button></div>`).join('') || '<p>Sin resultados</p>';
  }

  function mount(el) {
    raiz = el;
    const cats = [...new Set(PRODUCTOS.map(p => p.categoria))];
    el.innerHTML = `
      <style>
        .cat-filtros{display:flex;gap:8px;margin-bottom:12px}
        .cat-lista{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
        .cat-card{background:var(--color-tarjeta,#fff);padding:12px;border-radius:var(--radio,10px)}
        .cat-card button{background:var(--color-primario,#d9480f);color:#fff;border:0;padding:6px 10px;border-radius:6px;cursor:pointer}
      </style>
      <h2>Catálogo</h2>
      <div class="cat-filtros">
        <input class="cat-buscar" placeholder="Buscar…">
        <select class="cat-categoria"><option value="">Todas</option>${cats.map(c => `<option>${c}</option>`).join('')}</select>
      </div>
      <div class="cat-lista"></div>`;
    el.querySelector('.cat-buscar').oninput = pintar;
    el.querySelector('.cat-categoria').onchange = pintar;
    el.querySelector('.cat-lista').onclick = (e) => {
      const id = e.target.dataset.id;
      if (!id) return;
      const p = PRODUCTOS.find(x => x.id == id);
      window.dispatchEvent(new CustomEvent('carrito:item-agregado', {
        detail: { version: 1, id: p.id, nombre: p.nombre, precio: p.precio, cantidad: 1 }
      }));
    };
    pintar();
  }
  function unmount(el) { el.innerHTML = ''; raiz = null; }

  window.MFE_catalogo = { version: '1.0.0', mount, unmount };
})();