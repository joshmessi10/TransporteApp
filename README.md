# 🚚 TransporteApp – Transport Management System  
### *Node.js · Express · MVC · Behavioral Design Patterns*

> Sistema de gestión de transporte construido en Node.js, con énfasis en **patrones de comportamiento** aplicados a controladores, servicios y flujo de operaciones.

---

## 🖼️ Preview

> *(Espacio para imágenes o capturas del sistema)*  
`![Screenshot 1](./docs/screens/screen1.png)`  
`![Screenshot 2](./docs/screens/screen2.png)`

---

# 🎯 Overview

**TransporteApp** es una plataforma para gestionar unidades de transporte, rutas, conductores y operaciones.  
La arquitectura aplica múltiples **patrones de comportamiento**, permitiendo desacoplar la lógica de negocio, mejorar la mantenibilidad y facilitar la extensión del sistema.

---

# 🧱 Características Principales

- 🚌 Gestión de unidades (creación, edición, estado)  
- 👨‍✈️ Administración de conductores  
- 🗺️ Organización de rutas y asignaciones  
- 🧾 Registro de viajes y operaciones  
- 📡 API modular en Express  
- 🗂️ Arquitectura MVC con separación clara: modelos, vistas y controladores  
- 🧠 Integración de múltiples **patrones comportamentales**  

---

# 🧠 Patrones Comportamentales Implementados

El diseño del backend incorpora varios patrones de comportamiento que controlan la interacción entre componentes, el flujo de operaciones y la respuesta a eventos.

---

## 🔁 **1. Observer – Notificaciones internas del sistema**

Útil para reaccionar automáticamente a eventos como:

- creación de una ruta  
- cambio de estado de una unidad  
- asignación de conductor  

```js
class EventBus {
  constructor() { this.subs = {}; }
  on(event, handler) {
    if (!this.subs[event]) this.subs[event] = [];
    this.subs[event].push(handler);
  }
  emit(event, data) {
    (this.subs[event] || []).forEach(h => h(data));
  }
}
```

**Casos de uso reales:**
- Notificar a módulos de auditoría cuando se registra un viaje  
- Actualizar disponibilidad cuando una unidad entra en mantenimiento  

---

## 🧭 **2. Strategy – Elección de algoritmo para calcular rutas**

Permite definir estrategias distintas:

- rutas rápidas  
- rutas económicas  
- rutas por prioridad de carga  

```js
class RutaContext {
  setStrategy(strategy) { this.strategy = strategy; }
  calcular(data) { return this.strategy.calcular(data); }
}
```

**Ventajas:**
- Cambiar o añadir algoritmos sin tocar código existente  
- Perfecto para transporte y logística  

---

## 🔄 **3. Chain of Responsibility – Validaciones encadenadas**

Cuando se registra un viaje, se encadenan validaciones:

```js
class Handler {
  setNext(h) { this.next = h; return h; }
  handle(req) {
    if (this.next) return this.next.handle(req);
    return true;
  }
}
```

**Validaciones típicas:**
- La unidad está disponible  
- El conductor tiene licencia válida  
- La ruta está activa  

---

## 🧪 **4. Template Method – Flujo estándar de operaciones**

Cada registro de viaje sigue una “plantilla”:

```js
class RegistroTemplate {
  ejecutar(data) {
    this.validar(data);
    this.preparar(data);
    this.guardar(data);
    this.notificar(data);
  }
}
```

Permite sobrescribir pasos según el tipo de operación.

---

## 🎛️ **5. Command – Acciones encapsuladas**

Acciones como:

- asignar conductor  
- marcar unidad como inactiva  
- programar mantenimiento  

Se encapsulan así:

```js
class Command {
  execute() {}
}
```

**Ventaja:**  
Permite *deshacer*, *repetir*, o *encolar* acciones en el futuro.

---

# 📂 Estructura del Proyecto

```
TransporteApp/
│ server.js
│ transporte.db
│ package.json
├─ config/
├─ controllers/
├─ models/
├─ views/
```

---

# 🚀 Instalación y Uso

```bash
npm install
npm start
```

Servidor por defecto:

```
http://localhost:3000
```

---

# 📸 Galería / Screenshots

```
![Dashboard](./docs/screens/dashboard.png)
![Vehicles](./docs/screens/vehicles.png)
```

---

# 🔮 Extensiones Futuras

- Sistema de roles (admin / operador)  
- Módulo de mantenimiento avanzado  
- Integración con mapas y cálculo real de rutas  
- WebSockets para notificaciones en tiempo real  
- Motor inteligente de asignación  

---

# 📄 Licencia

MIT – Libre para uso educativo o comercial.
