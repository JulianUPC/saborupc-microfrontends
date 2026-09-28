// Registro: el contenedor solo conoce nombre, ruta, URL y el global que expone cada MFE
const REGISTRO = [
  { id: 'catalogo', ruta: '#/catalogo', etiqueta: 'Catálogo', url: 'http://localhost:3001/catalogo.js', global: 'MFE_catalogo' },
  { id: 'carrito',  ruta: '#/carrito',  etiqueta: 'Carrito',  url: 'http://localhost:3002/carrito.js',  global: 'MFE_carrito', precarga: true }
];

const salida = document.getElementById('salida');
const cargados = new Map();   // id -> Promise del MFE (cada script se carga una sola vez)
const versiones = {};
let actual = null;
let turno = 0;

function cargar(reg) {
  if (cargados.has(reg.id)) return cargados.get(reg.id);
  const t0 = performance.now();
  const p = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = reg.url;
    s.onload = () => {
      const mfe = window[reg.global];
      if (!mfe) return reject(new Error('No expone ' + reg.global));
      const ms = (performance.now() - t0).toFixed(1);
      console.log(`[MFE] ${reg.id} v${mfe.version} cargado en ${ms} ms`);
      versiones[reg.id] = mfe.version;
      document.getElementById('versiones').textContent =
        Object.entries(versiones).map(([k, v]) => `${k} v${v}`).join(' · ');
      resolve(mfe);
    };
    s.onerror = () => { s.remove(); reject(new Error('No se pudo cargar ' + reg.url)); };
    document.head.appendChild(s);
  });
  cargados.set(reg.id, p);
  p.catch(() => cargados.delete(reg.id));   // permite reintentar
  return p;
}

async function navegar() {
  const miTurno = ++turno;
  const reg = REGISTRO.find(r => r.ruta === location.hash) || REGISTRO[0];
  document.querySelectorAll('#nav a').forEach(a =>
    a.classList.toggle('activo', a.getAttribute('href') === reg.ruta));

  if (actual) { try { actual.unmount(salida); } catch (e) { console.warn(e); } actual = null; }
  salida.innerHTML = '<p>Cargando…</p>';

  try {
    const mfe = await cargar(reg);
    if (miTurno !== turno) return;          // el usuario ya navegó a otra ruta
    salida.innerHTML = '';
    await mfe.mount(salida, { usuario: 'Estudiante' });
    actual = mfe;
  } catch (e) {
    console.error(e);
    salida.innerHTML = `<div class="sc-error">
      <p>😕 El módulo "${reg.etiqueta}" no está disponible por ahora.</p>
      <button id="reintentar">Reintentar</button></div>`;
    document.getElementById('reintentar').onclick = navegar;
  }
}
// Arranque
document.getElementById('nav').innerHTML =
  REGISTRO.map(r => `<a href="${r.ruta}">${r.etiqueta}</a>`).join('');
  REGISTRO.filter(r => r.precarga).forEach(r => cargar(r).catch(e => console.warn(e.message)));
  window.addEventListener('hashchange', navegar);
navegar();