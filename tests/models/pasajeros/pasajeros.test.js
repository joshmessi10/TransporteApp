// tests/models/pasajeros/pasajeros.test.js
import assert from 'assert';
import {
  Tiquete,
  ReservaTiquete,
  Equipaje
} from '../../../models/pasajeros/index.js';

(function testModelosPasajeros() {
  console.log('=== INICIO TEST models/pasajeros ===');

  // ---- Tiquete ----
  const tiquete = new Tiquete({
    idTiquete: 1,
    idViaje: 100,
    idCliente: 10,
    numeroAsiento: 15,
    canalVenta: 'WEB',
    precioBase: 50000,
    impuestos: 9500,
    descuento: 0,
    estado: 'RESERVADO',
    codigoQR: 'QR-123'
  });

  console.log('\n--- Tiquete creado ---');
  console.log(JSON.stringify(tiquete, null, 2));

  assert.strictEqual(tiquete.precioTotal, 59500);

  tiquete.marcarComoPagado();
  assert.strictEqual(tiquete.estado, 'PAGADO');
  assert.ok(tiquete.esValidoParaAbordar());

  tiquete.marcarComoUsado();
  assert.strictEqual(tiquete.estado, 'USADO');
  assert.ok(!tiquete.puedeAnularse());

  console.log('\n--- Tiquete después de operaciones ---');
  console.log(JSON.stringify(tiquete, null, 2));

  // ---- ReservaTiquete ----
  const ahora = new Date();
  const expiracion = new Date(ahora.getTime() + 60 * 60 * 1000); // +1 hora

  const reserva = new ReservaTiquete({
    idReserva: 1,
    idCliente: 10,
    idViaje: 100,
    asientosReservados: [15, 16, 17],
    fechaCreacion: ahora.toISOString(),
    fechaExpiracion: expiracion.toISOString(),
    estado: 'ACTIVA'
  });

  console.log('\n--- Reserva creada ---');
  console.log(JSON.stringify(reserva, null, 2));

  assert.ok(reserva.estaVigente());
  assert.strictEqual(reserva.cantidadAsientos(), 3);

  const tiquetesGenerados = reserva.convertirEnTiquetes({
    precioBasePorAsiento: 40000,
    impuestosPorAsiento: 7600
  });

  console.log('\n--- Reserva después de convertir en tiquetes ---');
  console.log(JSON.stringify(reserva, null, 2));

  console.log('\n--- Tiquetes generados desde la reserva ---');
  console.log(JSON.stringify(tiquetesGenerados, null, 2));

  assert.strictEqual(reserva.estado, 'CONVERTIDA_EN_TIQUETE');
  assert.strictEqual(tiquetesGenerados.length, 3);
  assert.strictEqual(tiquetesGenerados[0].total, 47600);

  // ---- Equipaje ----
  const equipaje = new Equipaje({
    idEquipaje: 1,
    idTiquete: tiquete.idTiquete,
    pesoKg: 18,
    tipo: 'BODEGA',
    etiquetaCodigo: 'BAG-001',
    observaciones: 'Frágil'
  });

  console.log('\n--- Equipaje creado ---');
  console.log(JSON.stringify(equipaje, null, 2));

  assert.ok(equipaje.excedeLimite(15)); // 18 > 15

  equipaje.actualizarPeso(12);
  equipaje.actualizarObservaciones('Sin observaciones especiales');

  assert.strictEqual(equipaje.pesoKg, 12);
  assert.strictEqual(equipaje.excedeLimite(15), false);

  console.log('\n--- Equipaje después de operaciones ---');
  console.log(JSON.stringify(equipaje, null, 2));

  console.log('\n✔ tests de models/pasajeros OK');
  console.log('=== FIN TEST models/pasajeros ===\n');
})();
