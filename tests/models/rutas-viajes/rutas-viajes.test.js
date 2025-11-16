// tests/models/rutas-viajes/rutas-viajes.test.js
import assert from 'assert';
import { Ruta, Viaje } from '../../../models/rutas-viajes/index.js';

(function testModelosRutasViajes() {
  console.log('=== INICIO TEST models/rutas-viajes ===');

  // ---- Ruta ----
  const ruta = new Ruta({
    idRuta: 1,
    codigoRuta: 'BOG-MED-001',
    origenSedeId: 10,
    destinoSedeId: 20,
    duracionEstimadaMinutos: 480,
    distanciaKm: 415,
    frecuencia: 'Cada 2 horas',
    tipoServicio: 'MIXTO'
  });

  console.log('\n--- Ruta creada ---');
  console.log(JSON.stringify(ruta, null, 2));

  assert.ok(ruta.esValida());
  ruta.actualizarDuracion(450);
  assert.strictEqual(ruta.duracionEstimadaMinutos, 450);

  ruta.actualizarFrecuencia('Cada 3 horas');
  assert.strictEqual(ruta.frecuencia, 'Cada 3 horas');

  ruta.inactivar();
  assert.strictEqual(ruta.activa, false);
  ruta.activar();
  assert.strictEqual(ruta.activa, true);

  console.log('\n--- Ruta después de operaciones ---');
  console.log(JSON.stringify(ruta, null, 2));

  // ---- Viaje ----
  const salidaProg = new Date();
  const llegadaProg = new Date(salidaProg.getTime() + 450 * 60 * 1000); // + 450 min

  const viaje = new Viaje({
    idViaje: 100,
    idRuta: ruta.idRuta,
    fechaHoraSalidaProgramada: salidaProg.toISOString(),
    fechaHoraLlegadaProgramada: llegadaProg.toISOString(),
    vehiculoPlaca: 'ABC123',
    idConductor: 1,
    estado: 'PROGRAMADO',
    capacidadAsientos: 40,
    asientosOcupados: 0,
    pesoCargaKg: 0,
    observaciones: 'Viaje de prueba'
  });

  console.log('\n--- Viaje creado ---');
  console.log(JSON.stringify(viaje, null, 2));

  // Reservar asientos
  assert.ok(viaje.hayAsientosDisponibles(5));
  viaje.reservarAsientos(5);
  assert.strictEqual(viaje.asientosOcupados, 5);

  // Liberar asientos
  viaje.liberarAsientos(2);
  assert.strictEqual(viaje.asientosOcupados, 3);

  console.log('\n--- Viaje después de reservas/liberaciones ---');
  console.log(JSON.stringify(viaje, null, 2));
  console.log('Porcentaje ocupación:', viaje.porcentajeOcupacion(), '%');

  // Gestión de carga
  viaje.agregarCarga(200);
  assert.strictEqual(viaje.pesoCargaKg, 200);

  viaje.quitarCarga(50);
  assert.strictEqual(viaje.pesoCargaKg, 150);

  console.log('\n--- Viaje después de carga ---');
  console.log(JSON.stringify(viaje, null, 2));

  // Cambios de estado
  viaje.iniciarViaje();
  assert.strictEqual(viaje.estado, 'EN_CURSO');
  assert.ok(viaje.fechaHoraSalidaReal instanceof Date);

  viaje.finalizarViaje();
  assert.strictEqual(viaje.estado, 'FINALIZADO');
  assert.ok(viaje.fechaHoraLlegadaReal instanceof Date);

  console.log('\n--- Viaje después de iniciar/finalizar ---');
  console.log(JSON.stringify(viaje, null, 2));

  console.log('\n✔ tests de models/rutas-viajes OK');
  console.log('=== FIN TEST models/rutas-viajes ===\n');
})();
