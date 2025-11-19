# Sistema de Gestión de Transporte – Proyecto Académico

Aplicación web para gestionar un sistema de transporte (tiquetes, envíos, organización, pagos y atención al cliente).  
Está construida con **Node.js + Express + SQLite** y organizada en capas de **controladores**, **modelos de dominio** y **vistas HTML**.

El objetivo principal, además de la funcionalidad, es **aplicar patrones de comportamiento** sobre un dominio razonablemente realista.

---

## Tecnologías principales

- **Backend:** Node.js, Express
- **Base de datos:** SQLite (archivo local)
- **Frontend:** HTML, CSS, JavaScript vanilla (fetch hacia la API REST)
- **Estructura:**  
  - `/controllers` – controladores HTTP por módulo  
  - `/models` – modelos de dominio y lógica de negocio  
  - `/views` – vistas HTML para cliente y admin  
  - `/config` – conexión y esquema de BD

---

## Módulos funcionales

- **Autenticación y dashboards**  
  - Login (cliente / admin)  
  - `cliente-dashboard.html` y `admin-dashboard.html`

- **Pasajeros y tiquetes**  
  - Búsqueda de viajes  
  - Reservas, tiquetes y carrito de compras

- **Envíos de paquetes**  
  - Registro de envíos  
  - Tarifa por peso/volumen  
  - Tracking por número de guía

- **Organización**  
  - Sedes, vehículos, conductores y mantenimientos (CRUD)

- **Pagos y facturación**  
  - Pagos asociados a tiquetes/envíos  
  - Facturas y items de factura

- **PQRS / atención al cliente**  
  - Registro de PQRS y notificaciones

---

## Patrones de comportamiento implementados

El proyecto tiene un énfasis fuerte en **patrones de comportamiento**, especialmente en el flujo de compra y en el ciclo de vida de viajes y envíos.

### 1. Template Method – Proceso de compra

**Objetivo:** tener un flujo de compra con estructura fija pero detalles específicos para cada tipo de operación (tiquete vs envío).

- Clase base: `models/procesos-compra/ProcesoCompra.js`

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

- Subclases concretas:
  - `ProcesoCompraTiquete`
  - `ProcesoCompraEnvio`

Ambas redefinen los pasos abstractos (`validarDatosEntrada`, `calcularPrecio`, `registrarTransaccion`, etc.) según el caso de uso.

En el controlador:

- `controllers/compras/ProcesoCompraController.js` recibe la petición del frontend (desde `carrito.html` o módulos de compra), instancia la subclase adecuada y llama:

```js
const proceso = new ProcesoCompraTiquete({ cliente, viaje, datosPago });
await proceso.ejecutarCompra();
```

Luego el controlador sólo se encarga de **persistir** (pagos, tiquetes, facturas), dejando la lógica de negocio encapsulada en el Template Method.

---

### 2. State – Ciclo de vida de Viaje

**Objetivo:** encapsular las reglas de transición entre estados de un viaje (`programado`, `en-curso`, `finalizado`, `cancelado`).

- Contexto: `models/rutas-viajes/Viaje.js`
- Interfaz de estado: `models/rutas-viajes/state/EstadoViaje.js`
- Estados concretos:
  - `ViajeProgramadoState`
  - `ViajeEnCursoState`
  - `ViajeFinalizadoState`
  - `ViajeCanceladoState`
- Factory: `ViajeStateFactory`

El objeto `Viaje` mantiene una referencia interna al estado:

```js
const initialStateObj = this.stateFactory.create(this.estado);
this._estadoObj = initialStateObj;
this._estadoObj.setContext(this);
```

Y delega las operaciones:

```js
iniciarViaje(fechaSalidaReal) { this._estadoObj.iniciar(fechaSalidaReal); }
finalizarViaje(fechaLlegadaReal) { this._estadoObj.finalizar(fechaLlegadaReal); }
cancelar(motivo) { this._estadoObj.cancelar(motivo); }
```

Cada estado concreto decide si la transición es válida y a qué siguiente estado se pasa, modificando propiedades de dominio (**no directamente la BD**).

---

### 3. State – Ciclo de vida de Envío

**Objetivo:** manejar el flujo de un envío con transiciones controladas (registrado → bodega → ruta → entrega / devuelto / fallido).

- Contexto: `models/envios/Envio.js`
- Interfaz de estado: `models/envios/state/EstadoEnvio.js`
- Estados concretos:
  - `EnvioRegistradoState`
  - `EnvioEnBodegaOrigenState`
  - `EnvioEnTransitoState`
  - `EnvioEnBodegaDestinoState`
  - `EnvioEnRepartoState`
  - `EnvioEntregadoState`
  - `EnvioDevueltoState`
  - `EnvioFallidoState`
- Factory: `EnvioStateFactory` (normaliza estados tipo DB: `registrado`, `en-bodega`, `en-ruta`, etc.).

El `Envio` expone operaciones de alto nivel:

```js
avanzar()        { this._estadoObj.avanzar(); }
devolver()       { this._estadoObj.devolver(); }
marcarFallido(m) { this._estadoObj.marcarFallido(m); }
```

El controlador de envíos (`EnvioController`) utiliza este modelo para decidir la transición, y luego sincroniza el nuevo estado con la tabla `envios` y con el tracking.

---

### 4. Chain of Responsibility – Validación de Envíos

**Objetivo:** construir un **pipeline de validación y enriquecimiento** para el registro/actualización de envíos, desacoplando cada responsabilidad en un handler.

Carpeta: `models/envios/chain/`

- Handlers principales:
  - `ValidarDatosBasicosHandler`
  - `ValidarPesoYDimensionesHandler`
  - `CalcularTarifaHandler`
  - `ValidarCoberturaRutaHandler`
  - `SeguroOpcionalHandler`
  - `NotificarClienteHandler`
- Pipeline:
  - `EnvioValidationPipeline.js` expone `validarYCrearEnvio(envioDTO)`

En el controlador:

```js
import { validarYCrearEnvio } from '../../models/envios/chain/EnvioValidationPipeline.js';

const resultado = validarYCrearEnvio(envioDTO);
if (!resultado.ok) {
  return res.status(400).json({ ok: false, errores: resultado.errores });
}
const dtoFinal = resultado.dto;
```

Si la cadena termina sin errores, el controller persiste el envío en la tabla `envios` usando los datos enriquecidos (`tarifaCalculada`, flags de seguro, etc.).  
Cada handler decide si continúa la cadena o corta con error, respetando la idea del **Chain of Responsibility**.

---

## Ejecución rápida

1. Instalar dependencias:

```bash
npm install
```

2. Inicializar base de datos (si hay script de seed):

```bash
node config/schema.js   # o el script que tengas configurado
```

3. Ejecutar servidor:

```bash
npm start
# o
node server.js
```

4. Abrir en el navegador:

- `http://localhost:3000/login`
- `http://localhost:3000/cliente`
- `http://localhost:3000/admin`

---

## Enfoque de diseño

Más allá de los endpoints y pantallas, el proyecto busca que:

- La **lógica de dominio** viva en los modelos (`Viaje`, `Envio`, procesos de compra, chains).
- Los controladores actúen como **orquestadores** entre HTTP, dominio y BD.
- Los **patrones de comportamiento** sean visibles y trazables en código, no solo en diagramas.

Es un proyecto pensado para cursos de **Ingeniería de Software / Patrones de Diseño**, donde se pueda navegar del requerimiento funcional al patrón aplicado en el código.
