# Contratos de SaborUPC 2.0

## Contrato de montaje
Cada MFE expone `window.MFE_<id> = { version: string, mount(el, props), unmount(el) }`.
`mount` puede ser async. `props` = `{ usuario }`.

## Catálogo de eventos (todos en `window`, vía CustomEvent)
| Evento | Publica | Escucha | detail | Versión |
|---|---|---|---|---|
| carrito:item-agregado | mfe-catalogo | mfe-carrito | { version, id, nombre, precio, cantidad } | 1 |
| carrito:actualizado | mfe-carrito | contenedor | { version, cantidad, total } | 1 |
| pedido:confirmado | mfe-carrito | mfe-pedidos, contenedor | { version, id, items[], total, fecha } | 1 |
| pedido:estado | mfe-pedidos | contenedor | { version, id, estado } | 1 |

## Reglas de evolución
- Solo se agregan campos opcionales; los consumidores ignoran campos desconocidos.
- Un cambio que rompa compatibilidad sube `version` y se publican ambas versiones un tiempo.

## Rutas
#/catalogo → mfe-catalogo · #/carrito → mfe-carrito · #/pedidos → mfe-pedidos · #/perfil → mfe-perfil