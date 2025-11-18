import db from './db.js';

db.serialize(() => {
  // USERS
  db.run(`INSERT INTO users (nombre, email, password, rol, estado) VALUES
    ('Carlos Gómez', 'carlos@example.com', 'pass123', 'cliente', 'activo'),
    ('Ana Torres', 'ana@example.com', 'pass123', 'cliente', 'activo'),
    ('Luis Pérez', 'luis@example.com', 'pass123', 'admin', 'activo'),
    ('María López', 'maria@example.com', 'pass123', 'cliente', 'activo'),
    ('Pedro Martínez', 'pedro@example.com', 'pass123', 'cliente', 'bloqueado')`);

  // SEDES
  db.run(`INSERT INTO sedes (nombre, direccion, ciudad, telefono) VALUES
    ('Sede Centro', 'Cra 10 #20-30', 'Bogotá', '3201112222'),
    ('Sede Norte', 'Av 15 #125-60', 'Bogotá', '3105556666'),
    ('Sede Sur', 'Calle 45 #18-90', 'Medellín', '3007778888')`);

  // VEHICULOS
  db.run(`INSERT INTO vehiculos (placa, tipo, capacidad, kilometraje, estado, id_sede) VALUES
    ('ABC123', 'bus', 40, 120000, 'activo', 1),
    ('XYZ987', 'camioneta', 8, 90000, 'mantenimiento', 2),
    ('FRT456', 'camion', 5000, 200000, 'activo', 3)`);

  // CONDUCTORES
  db.run(`INSERT INTO conductores (nombre, licencia, categoria, id_sede) VALUES
    ('Juan Rodríguez', 'LIC123', 'C2', 1),
    ('Miguel Díaz', 'LIC999', 'C3', 2),
    ('Andrés Castro', 'LIC555', 'B1', 3)`);

  // MANTENIMIENTOS
  db.run(`INSERT INTO mantenimientos (id_vehiculo, tipo, estado, fecha_programado, fecha_inicio, fecha_fin) VALUES
    (2, 'Cambio de aceite', 'en-proceso', '2025-01-10', '2025-01-11', NULL),
    (3, 'Revisión general', 'pendiente', '2025-02-01', NULL, NULL)`);

  // RUTAS
  db.run(`INSERT INTO rutas (origen, destino, distancia_km, precio_base) VALUES
    ('Bogotá', 'Medellín', 420.50, 120000),
    ('Medellín', 'Cali', 415.00, 110000),
    ('Bogotá', 'Villavicencio', 120.00, 35000)`);

  // VIAJES
  db.run(`INSERT INTO viajes (id_ruta, id_vehiculo, id_conductor, fecha_salida, fecha_llegada, estado) VALUES
    (1, 1, 1, '2025-11-20 08:00:00', '2025-11-20 15:00:00', 'finalizado'),
    (3, 1, 1, '2025-11-22 10:00:00', '2025-11-22 13:00:00', 'programado'),
    (2, 3, 2, '2025-11-25 07:00:00', '2025-11-25 14:00:00', 'en-curso')`);

  // RESERVAS
  db.run(`INSERT INTO reservas_tiquete (id_cliente, id_viaje, estado) VALUES
    (1, 1, 'confirmada'),
    (2, 1, 'confirmada'),
    (4, 2, 'pendiente')`);

  // TIQUETES
  db.run(`INSERT INTO tiquetes (id_reserva, id_cliente, asiento, precio, estado) VALUES
    (1, 1, '12A', 120000, 'emitido'),
    (2, 2, '12B', 120000, 'emitido'),
    (3, 4, '5C', 35000, 'emitido')`);

  // EQUIPAJE
  db.run(`INSERT INTO equipaje (id_tiquete, peso, descripcion) VALUES
    (1, 18.5, 'Maleta grande'),
    (2, 12.0, 'Mochila'),
    (3, 8.3, 'Bolso de mano')`);

  // ENVIOS
  db.run(`INSERT INTO envios (numero_guia, id_cliente, origen, destino, peso, valor_declarado, estado) VALUES
    ('GUIA001', 1, 'Bogotá', 'Medellín', 4.5, 200000, 'en-bodega'),
    ('GUIA002', 2, 'Bogotá', 'Cali', 2.0, 80000, 'en-ruta'),
    ('GUIA003', 4, 'Medellín', 'Bogotá', 10.0, 350000, 'registrado')`);

  // TRACKING
  db.run(`INSERT INTO tracking_envio (id_envio, estado, descripcion) VALUES
    (1, 'en-bodega', 'El paquete está en la bodega principal'),
    (2, 'en-ruta', 'El paquete salió a ruta'),
    (3, 'registrado', 'El envío fue registrado en el sistema')`);

  // BODEGAS
  db.run(`INSERT INTO bodegas (id_sede, capacidad_max) VALUES
    (1, 500),
    (2, 300)`);

  // INVENTARIO
  db.run(`INSERT INTO bodega_inventario (id_bodega, id_envio, estado) VALUES
    (1, 1, 'ingreso'),
    (2, 3, 'ingreso')`);

  // MANIFIESTOS
  db.run(`INSERT INTO manifiestos (id_conductor, id_vehiculo) VALUES
    (1, 1),
    (2, 3)`);

  db.run(`INSERT INTO manifiestos_envios (id_manifiesto, id_envio) VALUES
    (1, 2),
    (2, 3)`);

  // PAGOS
  db.run(`INSERT INTO pagos (id_cliente, monto, metodo, estado) VALUES
    (1, 120000, 'tarjeta', 'validado'),
    (2, 120000, 'nequi', 'validado'),
    (4, 35000, 'daviplata', 'pendiente')`);

  // FACTURAS
  db.run(`INSERT INTO facturas (id_cliente, id_pago, tipo, referencia, total) VALUES
    (1, 1, 'tiquete', 1, 120000),
    (2, 2, 'tiquete', 2, 120000),
    (4, 3, 'tiquete', 3, 35000)`);

  // SEGUROS
  db.run(`INSERT INTO seguros_envio (id_envio, costo, cobertura) VALUES
    (1, 15000, 'Daños y pérdida'),
    (2, 12000, 'Daños'),
    (3, 20000, 'Pérdida total')`);

  // PQRS
  db.run(`INSERT INTO pqrs (id_cliente, tipo, mensaje, respuesta, estado) VALUES
    (1, 'queja', 'El bus llegó tarde', 'Estamos revisando', 'respondido'),
    (2, 'peticion', 'Solicito reembolso', NULL, 'abierto'),
    (4, 'sugerencia', 'Hablen más claro por altavoz', NULL, 'abierto')`);

  // NOTIFICACIONES
  db.run(`INSERT INTO notificaciones (id_usuario, mensaje, leida) VALUES
    (1, 'Tu envío ha cambiado de estado', FALSE),
    (2, 'Tu tiquete fue confirmado', TRUE),
    (4, 'Tienes una PQRS pendiente', FALSE)`);

  // CARRITOS
  db.run(`INSERT INTO carritos (id_cliente, estado) VALUES
    (1, 'activo'),
    (2, 'guardado'),
    (4, 'activo')`);

  // CARRITO ITEMS
  db.run(`INSERT INTO carrito_items (id_carrito, tipo, referencia, cantidad) VALUES
    (1, 'tiquete', 1, 1),
    (2, 'envio', 2, 1),
    (3, 'tiquete', 3, 2)`);
});