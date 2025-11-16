# Controladores de la App de Transporte

Este documento describe **exclusivamente la capa de controladores** (`controllers/`) de la aplicación, su organización por módulo y cómo se prueban mediante los tests existentes.

La idea es que esto sirva como guía si quieres montar un API REST encima (Express, Fastify, etc.) o si quieres extender la lógica de orquestación sin tocar los modelos de dominio.

---

## 1. Convención general de controladores

Todos los controladores siguen el **contrato estilo Express**:

```js
static async metodo(req, res) {
  // ...
  return res.status(200).json({ ... });
}
```

- `req` y `res` son objetos **mock** en los tests, pero tienen la misma forma que en Express:
  - `req.params` → parámetros de ruta (`/recurso/:id`).
  - `req.body` → payload de la petición.
- `res` implementa:
  - `res.status(code)` → establece el status HTTP.
  - `res.json(payload)` → devuelve el resultado en JSON.

En producción, solo tendrías que conectar cada método estático a la ruta correspondiente:

```js
app.post('/api/usuarios', UsuarioController.registrarUsuario);
app.get('/api/rutas/:id', RutaController.obtenerRuta);
// etc.
```

---

## 2. Estructura de la carpeta `controllers/`

```text
controllers/
  usuarios/
    UsuarioController.js
    UsuariosMemoryStore.js

  organizacion/
    SedeController.js
    VehiculoController.js
    ConductorController.js
    MantenimientoController.js
    OrganizacionMemoryStore.js

  rutas-viajes/
    RutaController.js
    ViajeController.js
    RutasViajesMemoryStore.js

  envios/
    EnvioController.js
    TrackingEnvioController.js
    BodegaController.js
    ManifiestoCargaController.js
    EnviosMemoryStore.js

  pagos-facturacion/
    PagoController.js
    FacturaController.js
    SeguroEnvioController.js
    PagosFacturacionMemoryStore.js

  pasajeros/
    ReservaTiqueteController.js
    TiqueteController.js
    EquipajeController.js
    PasajerosMemoryStore.js

  atencion-cliente/
    PqrsController.js
    NotificacionController.js
    AtencionClienteMemoryStore.js

  compras/
    CarritoController.js
    ProcesoCompraController.js
    ComprasMemoryStore.js
```

- Cada subcarpeta se alinea 1:1 con un **módulo funcional** del dominio.
- Cada módulo tiene un `*MemoryStore.js` que simula persistencia en memoria y encapsula colecciones/mapas/Mementos.

---

## 3. Módulo Usuarios

**Archivo principal:**

- `controllers/usuarios/UsuarioController.js`

**Responsabilidades típicas:**

- `registrarCliente(req, res)`
- `registrarAdmin(req, res)`
- `actualizarUsuario(req, res)`
- `bloquearUsuario(req, res)`
- `desbloquearUsuario(req, res)`
- `login(req, res)`
- `cambiarPassword(req, res)`
- `actualizarDatosFacturacion(req, res)`

**Store asociado:**

- `controllers/usuarios/UsuariosMemoryStore.js`  
  Mantiene usuarios en memoria, generación de IDs, búsquedas por email, etc.

**Test:**

- `tests/controllers/usuarios/usuarios-controllers.test.js`  
  Mockea `req/res` y valida altas, login, bloqueo, etc.

---

## 4. Módulo Organización

**Controladores:**

- `SedeController.js`
  - `crear(req, res)`
  - `obtener(req, res)`
  - `actualizar(req, res)`
  - `eliminar(req, res)`

- `VehiculoController.js`
  - `crear(req, res)`
  - `obtener(req, res)` (por placa)
  - `actualizar(req, res)`
  - `cambiarEstado(req, res)` (usa métodos de dominio del modelo `Vehiculo`)
  - `actualizarKilometraje(req, res)` (valida que no disminuya)

- `ConductorController.js`
  - `crear(req, res)`
  - `obtener(req, res)`
  - `actualizar(req, res)`

- `MantenimientoController.js`
  - `programar(req, res)` (estado inicial PROGRAMADO)
  - `obtener(req, res)`
  - `iniciar(req, res)` (PROGRAMADO → EN_PROCESO)
  - `finalizar(req, res)` (EN_PROCESO → COMPLETADO)

**Store:**

- `OrganizacionMemoryStore.js`  
  Administra `Sede`, `Vehiculo`, `Conductor`, `Mantenimiento` en memoria.

**Test:**

- `tests/controllers/organizacion/organizacion-controllers.test.js`

---

## 5. Módulo Rutas y Viajes

**Controladores:**

- `RutaController.js`
  - CRUD de rutas:
    - `crear(req, res)`
    - `obtener(req, res)`
    - `listar(req, res)`
    - `actualizar(req, res)`
    - `activar(req, res)`
    - `inactivar(req, res)`

- `ViajeController.js`
  - Gestión de viajes:
    - `crear(req, res)` (PROGRAMADO)
    - `obtener(req, res)`
    - `listar(req, res)`
    - `asignarVehiculoYConductor(req, res)`
    - `iniciar(req, res)` → State: `PROGRAMADO → EN_CURSO`
    - `finalizar(req, res)` → `EN_CURSO → FINALIZADO`
    - `cancelar(req, res)` → `PROGRAMADO|EN_CURSO → CANCELADO` según reglas de dominio.

**Store:**

- `RutasViajesMemoryStore.js`  
  Mantiene mapas de `Ruta` y `Viaje`, búsquedas por ID, etc.

**Test:**

- `tests/controllers/rutas-viajes/rutas-viajes-controllers.test.js`

---

## 6. Módulo Envíos

**Controladores:**

- `EnvioController.js`
  - `registrarEnvio(req, res)`
    - Usa **Chain of Responsibility** (`EnvioValidationPipeline`) antes de persistir.
  - `obtenerEnvio(req, res)`
  - `avanzarEstado(req, res)` → delega en el **State** de `Envio`.
  - `marcarDevuelto(req, res)`
  - `marcarFallido(req, res)`
  - `asignarSeguro(req, res)`

- `TrackingEnvioController.js`
  - `obtenerTracking(req, res)` → historial de eventos.
  - `registrarEvento(req, res)` → opcional, para eventos manuales.

- `BodegaController.js`
  - `crear(req, res)`
  - `obtener(req, res)`
  - `ingresoEnvio(req, res)`
  - `salidaEnvio(req, res)`
  - `inventario(req, res)`

- `ManifiestoCargaController.js`
  - `crear(req, res)`
  - `obtener(req, res)`
  - `asociarEnvio(req, res)`
  - `desasociarEnvio(req, res)`

**Store:**

- `EnviosMemoryStore.js`  
  Lleva:
  - `envios`
  - `trackingPorEnvio`
  - `bodegas` + inventario
  - `manifiestos`

**Test:**

- `tests/controllers/envios/envios-controllers.test.js`

---

## 7. Módulo Pagos y Facturación

**Controladores:**

- `PagoController.js`
  - `registrarPago(req, res)`
  - `obtenerPago(req, res)`
  - `aprobarPago(req, res)`
  - `rechazarPago(req, res)`

- `FacturaController.js`
  - `crearFactura(req, res)` (con ítems)
  - `obtenerFactura(req, res)`
  - `facturasPorCliente(req, res)`
  - `anularFactura(req, res)`

- `SeguroEnvioController.js`
  - `crear(req, res)`
  - `obtener(req, res)`
  - `actualizar(req, res)`

**Store:**

- `PagosFacturacionMemoryStore.js`  
  Maneja colecciones de `Pago`, `Factura`, `ItemFactura`, `SeguroEnvio` y facturas por cliente.

**Test:**

- `tests/controllers/pagos-facturacion/pagos-facturacion-controllers.test.js`

---

## 8. Módulo Pasajeros (Tiquetes, Reservas, Equipaje)

**Controladores:**

- `ReservaTiqueteController.js`
  - `crearReserva(req, res)`
  - `obtenerReserva(req, res)`
  - `cancelarReserva(req, res)`
  - `confirmarReserva(req, res)` → genera un `Tiquete`.

- `TiqueteController.js`
  - `crearTiquete(req, res)`
  - `obtenerTiquete(req, res)`
  - `historialCliente(req, res)`
  - `anularTiquete(req, res)` → captura errores del modelo (`400` si reglas de dominio lo prohíben).
  - `marcarUsado(req, res)`

- `EquipajeController.js`
  - `registrarEquipaje(req, res)`
  - `listarEquipajes(req, res)`
  - `eliminarEquipaje(req, res)`

**Store:**

- `PasajerosMemoryStore.js`  
  Mantiene:
  - `reservas`
  - `tiquetes`
  - `equipajes`
  - índices por cliente y por tiquete.

**Test:**

- `tests/controllers/pasajeros/pasajeros-controllers.test.js`

---

## 9. Módulo Atención al Cliente (PQRS + Notificaciones)

**Controladores:**

- `PqrsController.js`
  - `registrarPQRS(req, res)`
  - `obtenerPQRS(req, res)`
  - `asignarArea(req, res)`
  - `registrarRespuesta(req, res)`
  - `cerrarPQRS(req, res)`  
    Genera notificaciones al cliente al registrar/cerrar PQRS.

- `NotificacionController.js`
  - `listarPorUsuario(req, res)`
  - `obtener(req, res)`
  - `marcarLeida(req, res)`

**Store:**

- `AtencionClienteMemoryStore.js`  
  Gestiona:
  - `pqrsMap`
  - `notifMap`
  - `notifPorUsuario`

**Test:**

- `tests/controllers/atencion-cliente/atencion-cliente-controllers.test.js`

---

## 10. Módulo Compras (Carrito + Procesos de Compra)

Este módulo es donde se integran **Memento** (para el carrito) y **Template Method** (para los procesos de compra).

### 10.1. `CarritoController.js`

Operaciones:

- `crearCarrito(req, res)`
  - Crea un `CarritoCompra` y un `CarritoHistory` asociado.
  - Devuelve el `carrito` y snapshots iniciales.

- `obtenerCarrito(req, res)`
  - Devuelve estado actual y lista de snapshots.

- `agregarTiquete(req, res)`
  - Agrega un borrador de tiquete (`tiquetesDraft`) al carrito.

- `agregarEnvio(req, res)`
  - Agrega un borrador de envío (`enviosDraft`) al carrito.

- `guardarSnapshot(req, res)`
  - Llama a `history.snapshot()` para capturar estado actual.

- `deshacer(req, res)`
  - `history.undo()` → restaura el último snapshot.

- `rehacer(req, res)`
  - `history.redo()` → restaura el snapshot siguiente si existe.

**Store:**

- `ComprasMemoryStore.js`  
  Mantiene un mapa: `idCarrito -> { carrito, history }`.

### 10.2. `ProcesoCompraController.js`

Usa directamente los procesos concretos basados en Template Method:

- `comprarTiquete(req, res)`
  - Construye un `ProcesoCompraTiquete` con:
    - `cliente`
    - `viaje`
    - `datosPago`
  - Llama `ejecutarCompra()`.
  - Devuelve `{ tiquete, pago, factura }` si todo va bien.

- `comprarEnvio(req, res)`
  - Construye un `ProcesoCompraEnvio` con:
    - `cliente`
    - `envioDraft`
    - `datosPago`
  - Llama `ejecutarCompra()`.
  - Devuelve `{ envio, pago, factura }`.

El detalle de cada paso del Template Method vive en los modelos:

```js
// ProcesoCompra (abstracto)
ejecutarCompra() {
  this.validarDatosEntrada();
  this.calcularPrecio();
  this.registrarTransaccion();
  this.procesarPago();
  this.generarDocumentoSoporte();
  this.notificarCliente();
}
```

**Test:**

- `tests/controllers/compras/compras-controllers.test.js`  
  Verifica:
  - Flujo del carrito (agregar, snapshot, undo).
  - Ejecución de procesos de compra para tiquete y envío (enfocado en que el Template Method corre sin romper).

---

## 11. Tests de controladores

Para cada módulo hay un test de controladores que:

- Crea un `resMock()` con métodos `status()` y `json()`.
- Construye un `req` con `params` y `body`.
- Invoca los métodos del controlador.
- Valida:
  - `statusCode` esperado.
  - Estructura básica del `body` (por ejemplo, que exista `ok: true`, o que contenga los campos de dominio esperados).

Ejemplo de ejecución manual:

```bash
node tests/controllers/organizacion/organizacion-controllers.test.js
node tests/controllers/envios/envios-controllers.test.js
node tests/controllers/pasajeros/pasajeros-controllers.test.js
node tests/controllers/compras/compras-controllers.test.js
```

---

## 12. Cómo usarlos en un servidor HTTP real

Si quieres exponer estos controladores vía Express:

```js
import express from 'express';
import UsuarioController from './controllers/usuarios/UsuarioController.js';

const app = express();
app.use(express.json());

app.post('/api/usuarios', (req, res) => UsuarioController.registrarCliente(req, res));
app.post('/api/login', (req, res) => UsuarioController.login(req, res));
// ...

app.listen(3000, () => {
  console.log('API escuchando en http://localhost:3000');
});
```

La capa de controladores ya está pensada para encajar de forma directa con este tipo de wiring.
