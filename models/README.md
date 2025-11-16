# TransporteApp – Modelo de Dominio + Patrones de Comportamiento

Aplicación de ejemplo para una empresa de transporte de pasajeros, mensajería y paquetería, organizada en una arquitectura tipo MVC (por ahora centrados en la **capa de modelo**), con varios **patrones de comportamiento** aplicados sobre el dominio.

## Requisitos

- Node.js 18+ (recomendado)
- Proyecto configurado como ES Modules:

```json
// package.json
{
  "name": "transporte-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node tests/run-all-tests.js"
  }
}
```

> Si no pones `"type": "module"`, Node mostrará warnings al ejecutar los tests con `import`.

---

## Estructura general de carpetas

Solo se listan las partes más relevantes para el modelo y los patrones:

```text
models/
├── usuarios/
│   ├── Usuario.js
│   ├── Cliente.js
│   └── index.js
├── rutas-viajes/
│   ├── Ruta.js
│   ├── Viaje.js
│   ├── state/
│   │   ├── EstadoViaje.js
│   │   ├── ViajeProgramadoState.js
│   │   ├── ViajeEnCursoState.js
│   │   ├── ViajeFinalizadoState.js
│   │   ├── ViajeCanceladoState.js
│   │   └── ViajeStateFactory.js
│   └── index.js
├── envios/
│   ├── Envio.js
│   ├── TrackingEnvio.js
│   ├── Bodega.js
│   ├── ItemInventarioBodega.js
│   ├── ManifiestoCarga.js
│   ├── state/
│   │   ├── EstadoEnvio.js
│   │   ├── EnvioRegistradoState.js
│   │   ├── EnvioEnBodegaOrigenState.js
│   │   ├── EnvioEnTransitoState.js
│   │   ├── EnvioEnBodegaDestinoState.js
│   │   ├── EnvioEnRepartoState.js
│   │   ├── EnvioEntregadoState.js
│   │   ├── EnvioDevueltoState.js
│   │   └── EnvioFallidoState.js
│   ├── chain/
│   │   ├── EnvioValidationHandler.js
│   │   ├── ValidarDatosBasicosHandler.js
│   │   ├── ValidarPesoYDimensionesHandler.js
│   │   ├── CalcularTarifaHandler.js
│   │   ├── ValidarCoberturaRutaHandler.js
│   │   ├── SeguroOpcionalHandler.js
│   │   ├── NotificarClienteHandler.js
│   │   └── EnvioValidationPipeline.js
│   └── index.js
├── pasajeros/
│   ├── Tiquete.js
│   ├── ReservaTiquete.js
│   ├── Equipaje.js
│   └── index.js
├── pagos-facturacion/
│   ├── Pago.js
│   ├── Factura.js
│   ├── ItemFactura.js
│   ├── SeguroEnvio.js
│   └── index.js
├── atencion-cliente/
│   ├── PQRS.js
│   ├── Notificacion.js
│   └── index.js
├── procesos-compra/
│   ├── ProcesoCompra.js
│   ├── ProcesoCompraTiquete.js
│   ├── ProcesoCompraEnvio.js
│   └── index.js
└── carrito/
    ├── CarritoCompra.js
    ├── CarritoMemento.js
    ├── CarritoHistory.js
    └── index.js

tests/
└── models/
    ├── usuarios/...
    ├── rutas-viajes/
    │   ├── rutas-viajes.test.js
    │   └── viaje-state.test.js
    ├── envios/
    │   ├── envios.test.js
    │   ├── envio-chain.test.js
    │   └── envio-state.test.js
    ├── pasajeros/
    │   └── pasajeros.test.js
    ├── pagos-facturacion/
    │   └── pagos-facturacion.test.js
    ├── atencion-cliente/
    │   └── atencion-cliente.test.js
    ├── procesos-compra/
    │   └── procesos-compra.test.js
    └── carrito/
        └── carrito-memento.test.js
```

---

## Modelos de dominio (resumen)

- **Usuarios**
  - `Usuario`: datos base de acceso.
  - `Cliente`: info de perfil, contacto, etc.

- **Rutas y viajes**
  - `Ruta`: origen, destino, paradas, distancia, duración.
  - `Viaje`: instancia concreta de una ruta con fechas, vehículo, conductor, ocupación y carga.

- **Pasajeros**
  - `Tiquete`: compra de asiento para un viaje (precio, estado, QR, factura).
  - `ReservaTiquete`: reserva previa a emisión de tiquete(s).
  - `Equipaje`: bultos asociados a tiquetes (peso, tipo, observaciones).

- **Envíos**
  - `Envio`: paquete/documento con datos de remitente/destinatario, tipo de servicio, valor declarado, estados de envío.
  - `TrackingEnvio`: eventos de seguimiento (estado, ubicación).
  - `Bodega`, `ItemInventarioBodega`, `ManifiestoCarga`: gestión de carga en bodegas y vehículos.

- **Pagos y facturación**
  - `Pago`: monto, método, estado, referencia de pasarela.
  - `Factura`: totales, impuestos, estado, metadata de emisión.
  - `ItemFactura`: línea de factura (cantidad, precio, impuestos).
  - `SeguroEnvio`: valor asegurado, prima, vigencia.

- **Atención al cliente**
  - `PQRS`: peticiones, quejas, reclamos, sugerencias, asociadas opcionalmente a tiquetes o envíos.
  - `Notificacion`: mensajes al cliente por distintos canales (email, SMS, push…).

- **Procesos de compra**
  - `ProcesoCompra` (abstracto): flujo genérico de compra.
  - `ProcesoCompraTiquete`: compra de tiquete.
  - `ProcesoCompraEnvio`: compra de envío/guía.

- **Carrito**
  - `CarritoCompra`: borrador de compras (tiquetes y envíos en construcción).
  - `CarritoMemento` / `CarritoHistory`: snapshots del carrito y undo/redo.

---

## Patrones de comportamiento implementados

### 1. Chain of Responsibility – Validación de Envíos

**Objetivo:** montar un pipeline flexible para registrar/validar un `Envio`.

- Base: `EnvioValidationHandler`
- Handlers concretos:
  - `ValidarDatosBasicosHandler`
  - `ValidarPesoYDimensionesHandler`
  - `CalcularTarifaHandler`
  - `ValidarCoberturaRutaHandler`
  - `SeguroOpcionalHandler`
  - `NotificarClienteHandler`
- Builder:
  - `EnvioValidationPipeline.buildEnvioValidationChain()`
  - Helper de alto nivel: `validarYCrearEnvio(envioDTO)`

**Uso típico:**

```js
import { validarYCrearEnvio } from './models/envios/chain/EnvioValidationPipeline.js';

const dto = { /* datos del envío */ };
const resultado = validarYCrearEnvio(dto);

if (!resultado.ok) {
  console.error(resultado.errores);
} else {
  console.log('Envio creado:', resultado.envio);
}
```

**Test relacionado:**

```bash
node tests/models/envios/envio-chain.test.js
```

---

### 2. State – Ciclo de vida de Envíos y Viajes

#### 2.1. `Envio` State

Estados:

- `REGISTRADO`
- `EN_BODEGA_ORIGEN`
- `EN_TRANSITO`
- `EN_BODEGA_DESTINO`
- `EN_REPARTO`
- `ENTREGADO`
- `DEVUELTO`
- `FALLIDO`

Clases:

- Base: `EstadoEnvio`
- Concretas:
  - `EnvioRegistradoState`
  - `EnvioEnBodegaOrigenState`
  - `EnvioEnTransitoState`
  - `EnvioEnBodegaDestinoState`
  - `EnvioEnRepartoState`
  - `EnvioEntregadoState`
  - `EnvioDevueltoState`
  - `EnvioFallidoState`
- Factory: `EnvioStateFactory`
- Integración: `Envio` mantiene un `_estadoObj` interno (no enumerable) y expone:
  - `avanzar()`
  - `devolver()`
  - `marcarFallido(motivo)`

**Uso:**

```js
const envio = new Envio({ /* estado: 'REGISTRADO' */ });
envio.avanzar(); // REGISTRADO -> EN_BODEGA_ORIGEN
envio.avanzar(); // EN_BODEGA_ORIGEN -> EN_TRANSITO
// ...
```

**Test:**

```bash
node tests/models/envios/envio-state.test.js
```

---

#### 2.2. `Viaje` State

Estados:

- `PROGRAMADO`
- `EN_CURSO`
- `FINALIZADO`
- `CANCELADO`

Clases:

- Base: `EstadoViaje`
- Concretas:
  - `ViajeProgramadoState`
  - `ViajeEnCursoState`
  - `ViajeFinalizadoState`
  - `ViajeCanceladoState`
- Factory: `ViajeStateFactory`
- Integración en `Viaje`:
  - `iniciarViaje(fechaSalidaReal?)`
  - `finalizarViaje(fechaLlegadaReal?)`
  - `cancelar(motivo)`

**Uso:**

```js
const viaje = new Viaje({ estado: 'PROGRAMADO', vehiculoPlaca: 'ABC123', idConductor: 1 });
viaje.iniciarViaje();   // PROGRAMADO -> EN_CURSO
viaje.finalizarViaje(); // EN_CURSO -> FINALIZADO
```

**Test:**

```bash
node tests/models/rutas-viajes/viaje-state.test.js
```

---

### 3. Template Method – Procesos de compra

**Objetivo:** encapsular el flujo común de compra, permitiendo variaciones entre tiquetes y envíos.

- Clase base: `ProcesoCompra`  
  Método plantilla:

  ```js
  async ejecutarCompra() {
    await this.validarDatosEntrada();
    await this.calcularPrecio();
    await this.registrarTransaccion();
    await this.procesarPago();
    await this.generarDocumentoSoporte();
    await this.notificarCliente();
  }
  ```

- Subclases:
  - `ProcesoCompraTiquete`
    - Usa `Tiquete`, `Pago`, `Factura`, `ItemFactura`, `Notificacion`.
    - Valida asiento disponible y marca el tiquete como `PAGADO`.
  - `ProcesoCompraEnvio`
    - Usa `Envio`, `Pago`, `Factura`, `ItemFactura`, `Notificacion`.
    - Registra un envío con estado `REGISTRADO`.

**Uso:**

```js
import { ProcesoCompraTiquete, ProcesoCompraEnvio } from './models/procesos-compra/index.js';

// Tiquete
const procesoTiquete = new ProcesoCompraTiquete({ cliente, viaje, datosPago });
await procesoTiquete.ejecutarCompra();

// Envío
const procesoEnvio = new ProcesoCompraEnvio({ cliente, envioDraft, datosPago });
await procesoEnvio.ejecutarCompra();
```

**Test:**

```bash
node tests/models/procesos-compra/procesos-compra.test.js
```

---

### 4. Memento – Carrito de compra (borradores + undo/redo)

**Objetivo:** permitir “borradores” de compra de tiquetes y envíos, con soporte de deshacer/rehacer.

Clases:

- `CarritoCompra` (Originator)
  - Estado interno:
    - `tiquetesDraft`: lista de tiquetes en borrador.
    - `enviosDraft`: lista de envíos en borrador.
    - `descuentoGlobal`.
  - Métodos:
    - `agregarTiquete`, `eliminarTiquete`
    - `agregarEnvio`, `eliminarEnvio`
    - `aplicarDescuentoGlobal`
    - `calcularTotal`
    - `crearMemento()`, `restaurarDesdeMemento(m)`

- `CarritoMemento` (Memento)
  - Guarda una copia del estado y un `timestamp`.
  - `getState()`, `getName()`.

- `CarritoHistory` (Caretaker)
  - Mantiene una lista de `CarritoMemento` y un `currentIndex`.
  - Métodos:
    - `snapshot()`
    - `undo()`
    - `redo()`
    - `listarSnapshots()`

**Uso:**

```js
import { CarritoCompra, CarritoHistory } from './models/carrito/index.js';

const carrito = new CarritoCompra({ idCliente: 10 });
const history = new CarritoHistory(carrito);

history.snapshot(); // estado inicial

carrito.agregarTiquete({ viajeId: 100, asiento: 1, precio: 50000 });
history.snapshot();

carrito.agregarEnvio({ idTemporal: 'ENV-1', dto: { origenSedeId: 100, destinoSedeId: 200 }, precio: 30000 });
carrito.aplicarDescuentoGlobal(5000);
history.snapshot();

// undo / redo
history.undo();
history.undo();
history.redo();
```

**Test:**

```bash
node tests/models/carrito/carrito-memento.test.js
```

---

## Cómo ejecutar los tests

Puedes ejecutar cada test individualmente:

```bash
node tests/models/envios/envios.test.js
node tests/models/envios/envio-chain.test.js
node tests/models/envios/envio-state.test.js
node tests/models/rutas-viajes/rutas-viajes.test.js
node tests/models/rutas-viajes/viaje-state.test.js
node tests/models/pasajeros/pasajeros.test.js
node tests/models/pagos-facturacion/pagos-facturacion.test.js
node tests/models/atencion-cliente/atencion-cliente.test.js
node tests/models/procesos-compra/procesos-compra.test.js
node tests/models/carrito/carrito-memento.test.js
```

Si quieres algo tipo “`npm test`”, puedes crear un pequeño runner:

```js
// tests/run-all-tests.js
import './models/envios/envios.test.js';
import './models/envios/envio-chain.test.js';
import './models/envios/envio-state.test.js';
import './models/rutas-viajes/rutas-viajes.test.js';
import './models/rutas-viajes/viaje-state.test.js';
import './models/pasajeros/pasajeros.test.js';
import './models/pagos-facturacion/pagos-facturacion.test.js';
import './models/atencion-cliente/atencion-cliente.test.js';
import './models/procesos-compra/procesos-compra.test.js';
import './models/carrito/carrito-memento.test.js';
```

y en `package.json`:

```json
"scripts": {
  "test": "node tests/run-all-tests.js"
}
```

---

## Próximos pasos posibles

- Añadir **controllers** y **rutas HTTP** (Express/Koa) encima de estos modelos.
- Extraer los **string literals** (`estado`, `tipoServicio`, etc.) a enums/constantes comunes.
- Documentar los **diagramas PlantUML** en una carpeta `docs/` (`docs/patrones/`), reutilizando el código de diagramas que ya tienes.
- Integrar una base de datos real (por ejemplo, repositorios para `Envio`, `Viaje`, `Tiquete`, etc.) y mover la lógica de persistencia fuera de los modelos.

Este README está pensado como vista rápida de **qué hay en el modelo**, **qué patrones se están usando** y **cómo probar que todo está vivo**.  
A partir de aquí ya puedes ir montando la capa de presentación (controllers, vistas) encima de esta base. 💻🚍📦
