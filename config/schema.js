import db from './db.js';


db.serialize(() => {
  // 🔧 Desactivar claves foráneas para poder borrar sin conflictos
  db.run(`PRAGMA foreign_keys = OFF`);

  // 🧨 Borrar tablas en orden inverso de dependencia
  const tables = [
    'carrito_items',
    'carritos',
    'notificaciones',
    'pqrs',
    'seguros_envio',
    'facturas',
    'pagos',
    'manifiestos_envios',
    'manifiestos',
    'bodega_inventario',
    'bodegas',
    'tracking_envio',
    'envios',
    'equipaje',
    'tiquetes',
    'reservas_tiquete',
    'viajes',
    'rutas',
    'mantenimientos',
    'conductores',
    'vehiculos',
    'sedes',
    'users'
  ];

  tables.forEach(table => {
    db.run(`DROP TABLE IF EXISTS ${table}`);
  });

  // ✅ Reactivar claves foráneas
  db.run(`PRAGMA foreign_keys = ON`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT CHECK(rol IN ('cliente','admin')) DEFAULT 'cliente',
    estado TEXT CHECK(estado IN ('activo','bloqueado')) DEFAULT 'activo',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sedes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    direccion TEXT,
    ciudad TEXT,
    telefono TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS vehiculos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    placa TEXT UNIQUE NOT NULL,
    tipo TEXT CHECK(tipo IN ('bus','camioneta','camion')),
    capacidad INTEGER,
    kilometraje INTEGER,
    estado TEXT CHECK(estado IN ('activo','mantenimiento','inactivo')) DEFAULT 'activo',
    id_sede INTEGER,
    FOREIGN KEY (id_sede) REFERENCES sedes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS conductores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    licencia TEXT,
    categoria TEXT,
    id_sede INTEGER,
    FOREIGN KEY (id_sede) REFERENCES sedes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS mantenimientos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_vehiculo INTEGER,
    tipo TEXT,
    estado TEXT CHECK(estado IN ('pendiente','en-proceso','finalizado')) DEFAULT 'pendiente',
    fecha_programado DATE,
    fecha_inicio DATE,
    fecha_fin DATE,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS rutas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origen TEXT,
    destino TEXT,
    distancia_km REAL,
    precio_base REAL,
    estado TEXT CHECK(estado IN ('activa','inactiva')) DEFAULT 'activa'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS viajes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_ruta INTEGER,
    id_vehiculo INTEGER,
    id_conductor INTEGER,
    fecha_salida DATETIME,
    fecha_llegada DATETIME,
    estado TEXT CHECK(estado IN ('programado','en-curso','finalizado','cancelado')) DEFAULT 'programado',
    FOREIGN KEY (id_ruta) REFERENCES rutas(id),
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id),
    FOREIGN KEY (id_conductor) REFERENCES conductores(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reservas_tiquete (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER,
    id_viaje INTEGER,
    estado TEXT CHECK(estado IN ('pendiente','confirmada','cancelada')) DEFAULT 'pendiente',
    fecha_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES users(id),
    FOREIGN KEY (id_viaje) REFERENCES viajes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tiquetes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_reserva INTEGER,
    id_cliente INTEGER,
    asiento TEXT,
    precio REAL,
    estado TEXT CHECK(estado IN ('emitido','usado','anulado')) DEFAULT 'emitido',
    FOREIGN KEY (id_reserva) REFERENCES reservas_tiquete(id),
    FOREIGN KEY (id_cliente) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS equipaje (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_tiquete INTEGER,
    peso REAL,
    descripcion TEXT,
    FOREIGN KEY (id_tiquete) REFERENCES tiquetes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS envios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_guia TEXT UNIQUE NOT NULL,
    id_cliente INTEGER,
    origen TEXT,
    destino TEXT,
    peso REAL,
    valor_declarado REAL,
    estado TEXT CHECK(estado IN ('registrado','en-bodega','en-ruta','entregado','devuelto','fallido')) DEFAULT 'registrado',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tracking_envio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_envio INTEGER,
    estado TEXT,
    descripcion TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_envio) REFERENCES envios(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bodegas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_sede INTEGER,
    capacidad_max INTEGER,
    FOREIGN KEY (id_sede) REFERENCES sedes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bodega_inventario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_bodega INTEGER,
    id_envio INTEGER,
    estado TEXT CHECK(estado IN ('ingreso','salida')),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_bodega) REFERENCES bodegas(id),
    FOREIGN KEY (id_envio) REFERENCES envios(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS manifiestos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_conductor INTEGER,
    id_vehiculo INTEGER,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_conductor) REFERENCES conductores(id),
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS manifiestos_envios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_manifiesto INTEGER,
    id_envio INTEGER,
    FOREIGN KEY (id_manifiesto) REFERENCES manifiestos(id),
    FOREIGN KEY (id_envio) REFERENCES envios(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pagos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER,
    monto REAL,
    metodo TEXT CHECK(metodo IN ('tarjeta','nequi','daviplata','efectivo')),
    estado TEXT CHECK(estado IN ('pendiente','validado','rechazado')) DEFAULT 'pendiente',
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS facturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER,
    id_pago INTEGER,
    tipo TEXT CHECK(tipo IN ('tiquete','envio')),
    referencia INTEGER,
    total REAL,
    estado TEXT CHECK(estado IN ('vigente','anulada')) DEFAULT 'vigente',
    FOREIGN KEY (id_cliente) REFERENCES users(id),
    FOREIGN KEY (id_pago) REFERENCES pagos(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS seguros_envio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_envio INTEGER,
    costo REAL,
    cobertura TEXT,
    FOREIGN KEY (id_envio) REFERENCES envios(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pqrs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER,
    tipo TEXT CHECK(tipo IN ('peticion','queja','reclamo','sugerencia')),
    mensaje TEXT,
    respuesta TEXT,
    estado TEXT CHECK(estado IN ('abierto','respondido','cerrado')) DEFAULT 'abierto',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER,
    mensaje TEXT,
    leida BOOLEAN DEFAULT FALSE,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS carritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER,
    estado TEXT CHECK(estado IN ('activo','guardado','vacío')) DEFAULT 'activo',
    FOREIGN KEY (id_cliente) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS carrito_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_carrito INTEGER,
    tipo TEXT CHECK(tipo IN ('tiquete','envio')),
    referencia INTEGER,
    cantidad INTEGER,
    FOREIGN KEY (id_carrito) REFERENCES carritos(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS carrito_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_carrito INTEGER NOT NULL,
    snapshot TEXT NOT NULL,            -- JSON del estado del carrito (items)
    es_actual INTEGER DEFAULT 0,       -- 1 = snapshot donde estamos parados (para undo/redo)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_carrito) REFERENCES carritos(id)
  )`);
});