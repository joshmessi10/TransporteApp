# Sistema de Transporte de Pasajeros, Mensajería y Paquetería

Aplicación de back-end (modelo + controladores) para un sistema de transporte que cubre:

- Transporte de pasajeros (tiquetes, reservas, equipaje)
- Mensajería y paquetería (envíos, bodegas, manifiestos)
- Rutas, vehículos, conductores y mantenimientos
- Pagos y facturación
- Atención al cliente (PQRS y notificaciones)
- Módulo de compras con carrito (borradores) y procesos de compra

La arquitectura sigue un estilo **MVC ligero** (Model + Controllers + Tests) y utiliza varios **patrones de comportamiento**.

---

## 1. Estructura general del proyecto

Ejemplo de estructura de carpetas (simplificada):

```text
models/
  usuarios/
  organizacion/
  rutas-viajes/
  envios/
  pagos-facturacion/
  pasajeros/
  atencion-cliente/
  carrito/
  procesos-compra/

controllers/
  usuarios/
  organizacion/
  rutas-viajes/
  envios/
  pagos-facturacion/
  pasajeros/
  atencion-cliente/
  compras/

tests/
  models/
  controllers/
```

- `models/` → Clases de dominio puras (reglas de negocio, estados, validaciones).
- `controllers/` → Controladores estilo HTTP (firma `controller(req, res)` con `res.status().json()`), que **usan** los modelos.
- `tests/` → Scripts Node que instancian los controladores con `req/res` mock y validan el flujo.

> El proyecto está pensado para correr con **Node.js (ESM)** (`"type": "module"` en `package.json`).

---

## 2. Módulos de dominio y controladores

A continuación, se resumen los módulos y sus controladores, alineados con los casos de uso definidos.

### 2.1. Usuarios

**Modelo principal:**

- `models/usuarios/Usuario.js` (Admin / Cliente)

**Controlador:**

- `controllers/usuarios/UsuarioController.js`

**Responsabilidades principales:**

- Registro y edición de clientes.
- Registro y edición de admins (solo admins).
- Login / logout.
- Recuperación / cambio de contraseña.
- Bloqueo / desbloqueo de usuario.
- Actualización de datos de contacto y facturación del cliente.

**Test asociado:**

- `tests/controllers/usuarios/usuarios-controllers.test.js`

---

### 2.2. Organización (Sedes, Vehículos, Conductores, Mantenimientos)

**Modelos:**

- `models/organizacion/Sede.js`
- `models/organizacion/Vehiculo.js`
- `models/organizacion/Conductor.js`
- `models/organizacion/Mantenimiento.js`
- `models/organizacion/index.js` (re-exporta)

**Store en memoria:**

- `controllers/organizacion/OrganizacionMemoryStore.js`

**Controladores:**

- `controllers/organizacion/SedeController.js`
- `controllers/organizacion/VehiculoController.js`
- `controllers/organizacion/ConductorController.js`
- `controllers/organizacion/MantenimientoController.js`

**Casos de uso:**

- CRUD de sedes.
- CRUD de vehículos.
- Cambiar estado operativo de vehículo.
- Actualizar kilometraje del vehículo (con validaciones de dominio).
- CRUD de conductores (validación de licencia, etc. en modelo).
- Programar mantenimientos (preventivos/correctivos).
- Iniciar y finalizar mantenimientos (estados manejados en el modelo `Mantenimiento`).

**Test:**

- `tests/controllers/organizacion/organizacion-controllers.test.js`

---

### 2.3. Rutas y Viajes (con patrón State)

**Modelos:**

- `models/rutas-viajes/Ruta.js`
- `models/rutas-viajes/Viaje.js`
- `models/rutas-viajes/state/EstadoViaje.js` + estados concretos
  - `ViajeProgramadoState`
  - `ViajeEnCursoState`
  - `ViajeFinalizadoState`
  - `ViajeCanceladoState`
- `models/rutas-viajes/index.js`

**Store en memoria:**

- `controllers/rutas-viajes/RutasViajesMemoryStore.js`

**Controladores:**

- `controllers/rutas-viajes/RutaController.js`
- `controllers/rutas-viajes/ViajeController.js`

**Casos de uso:**

- CRUD de rutas.
- Activar / inactivar rutas.
- Crear viajes programados (asociados a una ruta).
- Cambiar estado del viaje usando el **patrón State**:
  - `ViajeController.iniciar()` → `PROGRAMADO → EN_CURSO`
  - `ViajeController.finalizar()` → `EN_CURSO → FINALIZADO`
  - `ViajeController.cancelar()` → según reglas de estado.

**Test:**

- `tests/controllers/rutas-viajes/rutas-viajes-controllers.test.js`

---

### 2.4. Envíos (Chain of Responsibility + State)

**Modelos:**

- `models/envios/Envio.js`
- `models/envios/state/EstadoEnvio.js` + estados concretos:
  - `EnvioRegistradoState`
  - `EnvioEnBodegaOrigenState`
  - `EnvioEnTransitoState`
  - `EnvioEnBodegaDestinoState`
  - `EnvioEnRepartoState`
  - `EnvioEntregadoState`
  - `EnvioDevueltoState`
  - `EnvioFallidoState`
- `models/envios/state/EnvioStateFactory.js`
- `models/envios/TrackingEnvio.js`
- `models/envios/Bodega.js`
- `models/envios/ItemInventarioBodega.js`
- `models/envios/ManifiestoCarga.js`
- `models/envios/chain/EnvioValidationPipeline.js` (Chain of Responsibility)
- `models/envios/index.js`

**Store en memoria:**

- `controllers/envios/EnviosMemoryStore.js`

**Controladores:**

- `controllers/envios/EnvioController.js`
- `controllers/envios/TrackingEnvioController.js`
- `controllers/envios/BodegaController.js`
- `controllers/envios/ManifiestoCargaController.js`

**Casos de uso:**

- Registrar envíos usando **Chain of Responsibility**:
  - Validar datos básicos, peso/dimensiones, calcular tarifa, validar ruta, seguro opcional, notificación al cliente.
- Cambiar estado del envío usando **State** (`avanzar`, `devolver`, `marcarFallido`).
- Seguimiento de envíos (historial de `TrackingEnvio`).
- Operación de bodegas:
  - Ingreso/salida de envíos.
  - Inventario por bodega.
- Manifiestos de carga:
  - Crear manifiesto.
  - Asociar/desasociar envíos a un viaje.
  - Recalcular totales (en el modelo).

**Test:**

- `tests/controllers/envios/envios-controllers.test.js`

---

### 2.5. Pagos y Facturación

**Modelos:**

- `models/pagos-facturacion/Pago.js`
- `models/pagos-facturacion/Factura.js`
- `models/pagos-facturacion/ItemFactura.js`
- `models/pagos-facturacion/SeguroEnvio.js`
- `models/pagos-facturacion/index.js`

**Store en memoria:**

- `controllers/pagos-facturacion/PagosFacturacionMemoryStore.js`

**Controladores:**

- `controllers/pagos-facturacion/PagoController.js`
- `controllers/pagos-facturacion/FacturaController.js`
- `controllers/pagos-facturacion/SeguroEnvioController.js`

**Casos de uso:**

- Registro de pagos para tiquetes y envíos.
- Validación de montos y cambio de estado del pago.
- Creación de facturas con ítems.
- Consulta de facturas por cliente.
- Anulación de facturas.
- Gestión de seguros de envío.

**Test:**

- `tests/controllers/pagos-facturacion/pagos-facturacion-controllers.test.js`

---

### 2.6. Pasajeros (Tiquetes, Reservas, Equipaje)

**Modelos:**

- `models/pasajeros/Tiquete.js`
- `models/pasajeros/ReservaTiquete.js`
- `models/pasajeros/Equipaje.js`
- `models/pasajeros/index.js`

**Store en memoria:**

- `controllers/pasajeros/PasajerosMemoryStore.js`

**Controladores:**

- `controllers/pasajeros/ReservaTiqueteController.js`
- `controllers/pasajeros/TiqueteController.js`
- `controllers/pasajeros/EquipajeController.js`

**Casos de uso:**

- Reserva de tiquetes (con expiración).
- Confirmación de reservas que generan tiquetes.
- Compra directa de tiquetes (sin reserva).
- Historial de tiquetes por cliente.
- Anulación de tiquetes según reglas de dominio (modelo `Tiquete`).
- Marcado de tiquete como usado (embarque).
- Registro, consulta y eliminación de equipaje asociado a tiquetes.

**Test:**

- `tests/controllers/pasajeros/pasajeros-controllers.test.js`

---

### 2.7. Atención al Cliente (PQRS + Notificaciones)

**Modelos:**

- `models/atencion-cliente/PQRS.js`
- `models/atencion-cliente/Notificacion.js`
- `models/atencion-cliente/index.js`

**Store en memoria:**

- `controllers/atencion-cliente/AtencionClienteMemoryStore.js`

**Controladores:**

- `controllers/atencion-cliente/PqrsController.js`
- `controllers/atencion-cliente/NotificacionController.js`

**Casos de uso:**

- Registro de PQRS asociadas a tiquetes o envíos.
- Asignación de área responsable.
- Registro de respuestas parciales.
- Cierre de PQRS.
- Notificaciones automáticas:
  - PQRS registrada.
  - PQRS cerrada.
- Consulta de notificaciones por usuario.
- Marcar notificaciones como leídas.

**Test:**

- `tests/controllers/atencion-cliente/atencion-cliente-controllers.test.js`

---

### 2.8. Carrito y Procesos de Compra (Memento + Template Method)

#### Carrito (Memento)

**Modelos:**

- `models/carrito/CarritoCompra.js`
- `models/carrito/CarritoMemento.js`
- `models/carrito/CarritoHistory.js`
- `models/carrito/index.js`

**Store en memoria:**

- `controllers/compras/ComprasMemoryStore.js`  
  (mantiene `{ carrito, history }` por `idCarrito`)

**Controlador:**

- `controllers/compras/CarritoController.js`

**Casos de uso (Memento):**

- Crear carrito de compra para un cliente.
- Agregar tiquetes preliminares (`tiquetesDraft`).
- Agregar envíos preliminares (`enviosDraft`).
- Guardar snapshots del carrito (borradores).
- Deshacer (`undo`) y rehacer (`redo`) usando `CarritoHistory`.

#### Procesos de compra (Template Method)

**Modelos:**

- `models/procesos-compra/ProcesoCompra.js` (clase abstracta)
- `models/procesos-compra/ProcesoCompraTiquete.js`
- `models/procesos-compra/ProcesoCompraEnvio.js`
- `models/procesos-compra/index.js`

Ambos concretos implementan el **Template Method**:

```js
ejecutarCompra() {
  this.validarDatosEntrada();
  this.calcularPrecio();
  this.registrarTransaccion();
  this.procesarPago();
  this.generarDocumentoSoporte(); // Tiquete o Guía / Envío
  this.notificarCliente();
}
```

**Controlador:**

- `controllers/compras/ProcesoCompraController.js`

**Casos de uso:**

- Compra de tiquetes (`comprarTiquete`):
  - Usa `ProcesoCompraTiquete`.
  - Genera tiquete, pago y factura.
- Compra de envíos (`comprarEnvio`):
  - Usa `ProcesoCompraEnvio`.
  - Genera envío, pago y factura.

**Test:**

- `tests/controllers/compras/compras-controllers.test.js`  
  Cubre:
  - Flujo del carrito (agregar, snapshot, undo).
  - Ejecución de procesos de compra de tiquete y envío (Template Method).

---

## 3. Patrones de diseño usados

1. **Chain of Responsibility**
   - Implementado en `models/envios/chain/EnvioValidationPipeline.js`.
   - Usado desde `EnvioController.registrarEnvio` para validar y construir un envío antes de persistirlo.

2. **State**
   - `Envio` usa estados concretos en `models/envios/state`.
   - `Viaje` usa estados concretos en `models/rutas-viajes/state`.
   - Los métodos de dominio (`avanzar`, `iniciar`, `finalizar`, `cancelar`, etc.) delegan la lógica a los objetos estado.

3. **Template Method**
   - `ProcesoCompra` define la plantilla del flujo de compra.
   - `ProcesoCompraTiquete` y `ProcesoCompraEnvio` implementan los pasos concretos.

4. **Memento**
   - `CarritoMemento` y `CarritoHistory` permiten guardar y restaurar estados del carrito.
   - `CarritoController` expone operaciones de **deshacer** / **rehacer** sobre el carrito.

---

## 4. Cómo ejecutar los tests

1. Asegúrate de tener **Node.js >= 18** instalado.
2. En `package.json`, define:

```json
{
  "type": "module",
  "scripts": {
    "test": "node tests/run-all.js"
  }
}
```

(O ejecuta cada test manualmente con `node`).

3. Ejecutar un test específico, por ejemplo:

```bash
node tests/controllers/organizacion/organizacion-controllers.test.js
node tests/controllers/rutas-viajes/rutas-viajes-controllers.test.js
node tests/controllers/envios/envios-controllers.test.js
node tests/controllers/pagos-facturacion/pagos-facturacion-controllers.test.js
node tests/controllers/pasajeros/pasajeros-controllers.test.js
node tests/controllers/atencion-cliente/atencion-cliente-controllers.test.js
node tests/controllers/compras/compras-controllers.test.js
```

---

## 5. Posibles extensiones

- Exponer estos controladores a través de un servidor HTTP (Express / Fastify).
- Sustituir los *MemoryStores* por repositorios reales (SQL/NoSQL).
- Agregar autenticación JWT y middleware de autorización para separar Admin/Cliente.
- Generar documentación OpenAPI/Swagger a partir de los controladores.

Este README resume la arquitectura, módulos, patrones y forma de prueba de la aplicación para que puedas navegar el código y extenderlo fácilmente.
