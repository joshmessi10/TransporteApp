# 🚚 TransporteApp – Transport Management System  
### *Node.js · Express · MVC · Behavioral Design Patterns*

> Sistema de gestión de transporte construido en Node.js, con énfasis real en **patrones de comportamiento** aplicados a modelos de dominio y flujos de negocio (envíos, viajes, carrito y procesos de compra).


---

## 🎯 Overview

**TransporteApp** es una plataforma didáctica para gestionar:

- Envíos de paquetería  
- Viajes de pasajeros  
- Rutas, vehículos, sedes y conductores  
- Compras de tiquetes y envíos  
- Carrito de compra compartido

La gracia del proyecto no es solo la funcionalidad, sino **cómo está modelada la lógica** usando varios **patrones de diseño comportamentales** directamente en el código:

- **State** para el ciclo de vida de envíos y viajes  
- **Chain of Responsibility** para validar y calcular tarifas de envíos  
- **Template Method** para el flujo completo de una compra  
- **Memento** para snapshots del carrito de compra

Todo esto sobre una arquitectura **Node.js + Express + MVC** con separación clara entre `models`, `controllers` y `views`.

---

## 🧱 Características Principales

- 🚌 Gestión de unidades, conductores y rutas  
- 🎫 Reservas de tiquetes y registro de viajes  
- 📦 Envíos con estados de ciclo de vida (registrado, en bodega, en tránsito, entregado, etc.)  
- 🧾 Procesos de compra para tiquetes y envíos  
- 🛒 Carrito de compra unificado para servicios de transporte  
- 🗂️ Arquitectura modular: `config/`, `controllers/`, `models/`, `views/`  
- 🧠 Aplicación explícita de patrones de comportamiento en la capa de dominio

---

## 🧠 Patrones Comportamentales Implementados

Aquí sí van los patrones que **realmente existen en el código** del proyecto.

---

### 1️⃣ State – Ciclo de vida de Envíos y Viajes

**Ubicación en el código:**

- `models/envios/state/*`  
- `models/rutas-viajes/state/*`  

En ambos casos hay una clase base abstracta:

```js
// models/envios/state/EstadoEnvio.js
export default class EstadoEnvio {
  setContext(envio) { this.envio = envio; }

  avanzar() { throw new Error('avanzar() debe implementarse en la subclase'); }
  devolver() { throw new Error('devolver() debe implementarse en la subclase'); }
  marcarFallido(motivo) { throw new Error('marcarFallido() debe implementarse en la subclase'); }

  _appendObservacion(texto) { /* agrega texto a envio.observaciones */ }
}
```

Cada subclase (`EnvioRegistradoState`, `EnvioEnTransitoState`, `EnvioEntregadoState`, etc.) implementa su propia lógica de transición.  
El objeto `Envio` mantiene una referencia a su estado y delega en él qué se puede hacer.

Además, existe una **fábrica de estados**:

```js
// models/envios/state/EnvioStateFactory.js
export default class EnvioStateFactory {
  create(estado) {
    const normalized = (estado || '').toString().trim().toUpperCase();
    switch (normalized) {
      case 'REGISTRADO': return new EnvioRegistradoState();
      case 'EN_BODEGA_ORIGEN': return new EnvioEnBodegaOrigenState();
      // ...
      case 'ENTREGADO': return new EnvioEntregadoState();
      default: throw new Error(`Estado de envío no soportado: ${estado}`);
    }
  }
}
```

Lo mismo se replica para `Viaje` en `models/rutas-viajes/state/*` con `EstadoViaje` y `ViajeStateFactory`.

**Idea:**  
El comportamiento de un envío/viaje **cambia según su estado**, sin llenar de `if`/`switch` el modelo principal.

---

### 2️⃣ Chain of Responsibility – Validación y tarificación de Envíos

**Ubicación en el código:**

- `models/envios/chain/*`  

Hay una clase base:

```js
// models/envios/chain/EnvioValidationHandler.js
export default class EnvioValidationHandler {
  constructor() { this.next = null; }

  setNext(handler) {
    this.next = handler;
    return handler; // permite chain.setNext(a).setNext(b)...
  }

  handle(context) {
    const seguir = this.doHandle(context);
    if (seguir === false) return context;
    if (this.next) return this.next.handle(context);
    return context;
  }

  doHandle(context) {
    throw new Error('doHandle() debe implementarse en el handler concreto');
  }
}
```

Y varios handlers concretos:

- `ValidarDatosBasicosHandler`  
- `ValidarPesoYDimensionesHandler`  
- `CalcularTarifaHandler`  

Por ejemplo:

```js
// models/envios/chain/ValidarPesoYDimensionesHandler.js
export default class ValidarPesoYDimensionesHandler extends EnvioValidationHandler {
  doHandle({ dto, errores }) {
    if (dto.pesoKg == null || dto.pesoKg <= 0) {
      errores.push('El peso debe ser mayor a 0 kg');
    }
    // validación de alto/ancho/largo...
    return errores.length === 0;
  }
}
```

La capa de aplicación puede montar:

```js
const chain = new ValidarDatosBasicosHandler();
chain
  .setNext(new ValidarPesoYDimensionesHandler())
  .setNext(new CalcularTarifaHandler());

const context = { dto, errores: [] };
chain.handle(context);
```

**Idea:**  
Cada paso decide si corta el flujo o lo deja continuar, permitiendo **agregar o reordenar reglas sin romper el resto**.

---

### 3️⃣ Template Method – Flujo completo de Proceso de Compra

**Ubicación en el código:**

- `models/procesos-compra/ProcesoCompra.js`  
- `models/procesos-compra/ProcesoCompraEnvio.js`  
- `models/procesos-compra/ProcesoCompraTiquete.js`  

La clase base define el **esqueleto del algoritmo**:

```js
// models/procesos-compra/ProcesoCompra.js
export default class ProcesoCompra {
  async ejecutarCompra() {
    await this.validarDatosEntrada();
    await this.calcularPrecio();
    await this.registrarTransaccion();
    await this.procesarPago();
    await this.generarDocumentoSoporte();
    await this.notificarCliente();
  }

  async validarDatosEntrada() { throw new Error('...'); }
  async calcularPrecio() { throw new Error('...'); }
  async registrarTransaccion() { throw new Error('...'); }
  async procesarPago() { throw new Error('...'); }
  async generarDocumentoSoporte() { throw new Error('...'); }

  // Hook
  async notificarCliente() {
    // implementación por defecto (no hace nada)
  }
}
```

Las subclases especializan el flujo:

- `ProcesoCompraEnvio`: crea `Envio`, `Pago`, `Factura`, `ItemFactura`, `Notificacion` de envío  
- `ProcesoCompraTiquete`: crea `Tiquete`, `Pago`, `Factura`, `Notificacion` de tiquete  

**Idea:**  
El orden de pasos de la compra está fijo, pero **cada tipo de compra implementa su propia lógica interna**.

---

### 4️⃣ Memento – Snapshots del Carrito de Compra

**Ubicación en el código:**

- `models/carrito/CarritoMemento.js`  

```js
// models/carrito/CarritoMemento.js
export default class CarritoMemento {
  constructor(state) {
    this.state = JSON.parse(JSON.stringify(state));
    this.timestamp = new Date();
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  getName() {
    const { tiquetesDraft, enviosDraft, descuentoGlobal } = this.state;
    const tiq = tiquetesDraft ? tiquetesDraft.length : 0;
    const env = enviosDraft ? enviosDraft.length : 0;
    return `${this.timestamp.toISOString()} | T=${tiq}, E=${env}, desc=${descuentoGlobal}`;
  }
}
```

La idea es que un **Carrito** pueda:

- crear mementos de su estado  
- restaurar un estado anterior  
- mostrar un historial legible de snapshots  

Perfecto para *deshacer* cambios en procesos de compra más complejos.

---

## 📂 Estructura del Proyecto

```text
TransporteApp/
│ server.js
│ transporte.db
│ package.json
├─ config/
│   ├─ db.js
│   ├─ schema.js
│   └─ seed.js
├─ controllers/
│   ├─ atencion-cliente/
│   ├─ compras/
│   ├─ envios/
│   ├─ organizacion/
│   ├─ pagos-facturacion/
│   ├─ pasajeros/
│   ├─ rutas-viajes/
│   └─ usuarios/
├─ models/
│   ├─ atencion-cliente/
│   ├─ carrito/
│   ├─ envios/
│   ├─ envios/chain/
│   ├─ envios/state/
│   ├─ procesos-compra/
│   ├─ rutas-viajes/
│   ├─ rutas-viajes/state/
│   └─ usuarios/
├─ views/
│   ├─ index.html
│   ├─ login.html
│   ├─ cliente-dashboard.html
│   ├─ admin-dashboard.html
│   └─ ...
```

---

## 🚀 Instalación y Uso

```bash
npm install
npm start
```

Servidor por defecto:

```text
http://localhost:3000
```

---

## 📸 Galería / Screenshots

<img width="1798" height="871" alt="AdminTransporte" src="https://github.com/user-attachments/assets/d0e7df50-6aec-4f17-8ba2-70edc3297629" />
<img width="1822" height="805" alt="GestionRutas" src="https://github.com/user-attachments/assets/d166188a-296d-45aa-9267-1a2855d25188" />
<img width="1842" height="681" alt="RegistroVehiculos" src="https://github.com/user-attachments/assets/98abb3ac-db09-482c-a7f9-6dcedef8d01e" />
<img width="1827" height="487" alt="EnviosRegistrados" src="https://github.com/user-attachments/assets/4ff9e716-ee86-4df1-bd4d-33387330aef6" />
<img width="1557" height="642" alt="Cliente1" src="https://github.com/user-attachments/assets/7ab9ec17-1334-4530-9151-e527a11472b7" />
<img width="1422" height="858" alt="Cliente2" src="https://github.com/user-attachments/assets/2cf3fe7c-13b1-4550-9b44-0d4e29560f42" />
<img width="1532" height="520" alt="CompraTiquetes" src="https://github.com/user-attachments/assets/1cd5bfc2-d8e9-41af-884d-d4130a207d0e" />
<img width="1552" height="846" alt="EnvioPaquetes" src="https://github.com/user-attachments/assets/e8df8812-4cbc-49f8-9fea-62b44b910afb" />

---

## 🔮 Extensiones Futuras

- Autenticación con roles (admin / cliente) sobre la capa existente  
- API REST pública a partir de los controladores actuales  
- Integración con servicios externos (geocoding, mapas, pasarelas de pago)  
- WebSockets para tracking en tiempo real de viajes y envíos  
- Repositorios persistentes para notificaciones y mementos de carrito

---

## 📄 Licencia

MIT – Libre para uso educativo o comercial.
