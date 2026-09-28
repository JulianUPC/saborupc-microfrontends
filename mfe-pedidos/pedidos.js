(function () {
  const ESTADOS = ['Recibido', 'En preparación', 'En camino', 'Entregado'];
  const INTERVALO = window.PEDIDOS_INTERVALO_MS || 5000;   // la prueba de contrato lo acelera
  const KEY = 'pedidos:lista';

  let pedidos = [];
  try { pedidos = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { pedidos = []; }
  const suscriptores = new Set();
  const cambio = () => {
    localStorage.setItem(KEY, JSON.stringify(pedidos));
    suscriptores.forEach(fn => fn());
  };

  // Escucha siempre (precargado): registra el pedido con estado inicial
  window.addEventListener('pedido:confirmado', (e) => {
    const d = e.detail;
    pedidos.unshift({ id: d.id, total: d.total, items: d.items, fecha: d.fecha, estado: ESTADOS[0] });
    cambio();
  });

  // Los estados avanzan solos
  setInterval(() => {
    pedidos.forEach(p => {
      const i = ESTADOS.indexOf(p.estado);
      if (i < ESTADOS.length - 1) {
        p.estado = ESTADOS[i + 1];
        window.dispatchEvent(new CustomEvent('pedido:estado', {
          detail: { version: 1, id: p.id, estado: p.estado }
        }));
      }
    });
    cambio();
  }, INTERVALO);

  // Vue se carga desde CDN, sin paso de compilación
  let vuePromise = null;
  function cargarVue() {
    if (window.Vue) return Promise.resolve(window.Vue);
    if (!vuePromise) vuePromise = new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/vue@3/dist/vue.global.prod.js';
      s.onload = () => ok(window.Vue);
      s.onerror = () => { vuePromise = null; fail(new Error('No se pudo cargar Vue')); };
      document.head.appendChild(s);
    });
    return vuePromise;
  }

  let app = null;
  async function mount(el) {
    const Vue = await cargarVue();
    el.innerHTML = `<style>
      .ped-card{background:var(--color-tarjeta,#fff);padding:12px;border-radius:10px;margin-bottom:12px}
      .ped-pasos{display:flex;gap:8px;list-style:none;padding:0}
      .ped-pasos li{flex:1;text-align:center;padding:6px;background:#eee;border-radius:6px;font-size:.85rem}
      .ped-pasos li.ped-activo{background:var(--color-ok,#2f9e44);color:#fff}
    </style>`;
    const cont = document.createElement('div');
    el.appendChild(cont);
    app = Vue.createApp({
      setup() {
        const lista = Vue.ref(pedidos.map(p => ({ ...p })));
        const refrescar = () => { lista.value = pedidos.map(p => ({ ...p })); };
        suscriptores.add(refrescar);
        Vue.onUnmounted(() => suscriptores.delete(refrescar));
        const fmt = n => '$' + n.toLocaleString('es-CO');
        return { lista, ESTADOS, fmt };
      },
      template: `
        <h2>Seguimiento de pedidos</h2>
        <p v-if="!lista.length">Aún no tienes pedidos.</p>
        <div v-for="p in lista" :key="p.id" class="ped-card">
          <b>Pedido #{{ p.id }}</b> — {{ fmt(p.total) }}
          <ul class="ped-pasos">
            <li v-for="e in ESTADOS" :class="{ 'ped-activo': ESTADOS.indexOf(e) <= ESTADOS.indexOf(p.estado) }">{{ e }}</li>
          </ul>
        </div>`
    });
    app.mount(cont);
  }
  function unmount(el) { if (app) app.unmount(); app = null; el.innerHTML = ''; }

  window.MFE_pedidos = { version: '1.0.0', mount, unmount };
})();