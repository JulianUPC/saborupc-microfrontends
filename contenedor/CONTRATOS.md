# Contratos de SaborUPC 2.0

## Contrato de montaje
Cada MFE expone `window.MFE_<id> = { version: string, mount(el, props), unmount(el) }`.
`mount` puede ser async. `props` = `{ usuario }`.

## Catálogo de eventos (todos en `window`, vía CustomEvent)
| Evento | Publica | Escucha | detail | Versión |
|---|---|---|---|---|
| carrito:item-agregado | mfe-catalogo | mfe-carrito | { version, id, nombre, precio, cantidad } | 1 |
| carrito:actualizado | mfe-carrito | contenedor | { version, cantidad, total } | 1 |