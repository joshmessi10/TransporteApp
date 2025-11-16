// tests/models/rutas-viajes/viaje-state.test.js
import assert from 'assert';
import { Viaje } from '../../../models/rutas-viajes/index.js';

(function testStateViaje() {
  console.log('=== INICIO TEST State Viaje ===');

  const salidaProg = new Date();
  const llegadaProg = new Date(salidaProg.getTime() + 4 * 60 * 60 * 1000); // +4h

  const viaje = new Viaje({
    idViaje: 1,
    idRuta: 10,
    fechaHoraSalidaProgramada: salidaProg.toISOString(),
    fechaHoraLlegadaProgramada: llegadaProg.toISOString(),
    vehiculoPlaca: 'ABC123',
    idConductor: 99,
    estado: 'PROGRAMADO',
    capacidadAsientos: 40,
    asientosOcupados: 0,
    pesoCargaKg: 0,
    observaciones: ''
  });

  console.log('\n--- Viaje inicial ---');
  console.log(JSON.stringify(viaje, null, 2));
  assert.strictEqual(viaje.estado, 'PROGRAMADO');

  // PROGRAMADO -> EN_CURSO
  viaje.iniciarViaje();
  console.log('\n--- Después de iniciarViaje() desde PROGRAMADO ---');
  console.log(JSON.stringify(viaje, null, 2));
  assert.strictEqual(viaje.estado, 'EN_CURSO');
  assert.ok(viaje.fechaHoraSalidaReal instanceof Date);

  // EN_CURSO -> FINALIZADO
  viaje.finalizarViaje();
  console.log('\n--- Después de finalizarViaje() desde EN_CURSO ---');
  console.log(JSON.stringify(viaje, null, 2));
  assert.strictEqual(viaje.estado, 'FINALIZADO');
  assert.ok(viaje.fechaHoraLlegadaReal instanceof Date);

  // Intentar iniciar de nuevo debe fallar
  let errorIniciar = false;
  try {
    viaje.iniciarViaje();
  } catch (e) {
    errorIniciar = true;
    console.log('\n--- Error esperado al iniciarViaje() desde FINALIZADO ---');
    console.log(e.message);
  }
  assert.strictEqual(errorIniciar, true);

  // Nuevo viaje para probar cancelaciones
  const viaje2 = new Viaje({
    idViaje: 2,
    idRuta: 20,
    fechaHoraSalidaProgramada: salidaProg.toISOString(),
    fechaHoraLlegadaProgramada: llegadaProg.toISOString(),
    vehiculoPlaca: 'DEF456',
    idConductor: 77,
    estado: 'PROGRAMADO',
    capacidadAsientos: 30,
    asientosOcupados: 0,
    pesoCargaKg: 0,
    observaciones: ''
  });

  console.log('\n--- Viaje2 inicial ---');
  console.log(JSON.stringify(viaje2, null, 2));

  viaje2.cancelar('Demanda baja');
  console.log('\n--- Viaje2 después de cancelar() desde PROGRAMADO ---');
  console.log(JSON.stringify(viaje2, null, 2));
  assert.strictEqual(viaje2.estado, 'CANCELADO');
  assert.ok(viaje2.observaciones.includes('Demanda baja'));

  // Intentar finalizar un viaje cancelado
  let errorFinalizar = false;
  try {
    viaje2.finalizarViaje();
  } catch (e) {
    errorFinalizar = true;
    console.log('\n--- Error esperado al finalizarViaje() desde CANCELADO ---');
    console.log(e.message);
  }
  assert.strictEqual(errorFinalizar, true);

  console.log('\n✔ tests State Viaje OK');
  console.log('=== FIN TEST State Viaje ===\n');
})();
