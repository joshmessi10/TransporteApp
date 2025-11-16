// tests/controllers/rutas-viajes/rutas-viajes-controllers.test.js
import assert from 'assert';
import RutaController from '../../../controllers/rutas-viajes/RutaController.js';
import ViajeController from '../../../controllers/rutas-viajes/ViajeController.js';

function resMock() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) {
      this.body = payload;
      console.log('RESPONSE:', this.statusCode, JSON.stringify(payload, null, 2));
      return this;
    }
  };
}

(async function testRutasViajesControllers() {
  console.log('=== TEST CONTROLADORES RUTAS-VIAJES ===');

  // Crear ruta
  const resRutaCrear = resMock();
  await RutaController.crear(
    {
      body: {
        nombre: 'Bogotá - Medellín',
        idSedeOrigen: 1,
        idSedeDestino: 2,
        distanciaKm: 400,
        duracionMinutos: 480
      }
    },
    resRutaCrear
  );
  assert.strictEqual(resRutaCrear.statusCode, 201);
  const ruta = resRutaCrear.body.ruta;
  const idRuta = ruta.idRuta;

  // Inactivar/activar
  const resRutaInact = resMock();
  await RutaController.inactivar({ params: { id: String(idRuta) } }, resRutaInact);
  assert.strictEqual(resRutaInact.body.ruta.activa, false);

  const resRutaAct = resMock();
  await RutaController.activar({ params: { id: String(idRuta) } }, resRutaAct);
  assert.strictEqual(resRutaAct.body.ruta.activa, true);

  // Crear viaje PROGRAMADO
  const salidaProg = new Date();
  const llegadaProg = new Date(salidaProg.getTime() + 4 * 60 * 60 * 1000);

  const resViajeCrear = resMock();
  await ViajeController.crear(
    {
      body: {
        idRuta,
        fechaHoraSalidaProgramada: salidaProg.toISOString(),
        fechaHoraLlegadaProgramada: llegadaProg.toISOString(),
        vehiculoPlaca: 'ABC123',
        idConductor: 999,
        capacidadAsientos: 40
      }
    },
    resViajeCrear
  );
  assert.strictEqual(resViajeCrear.statusCode, 201);
  const viaje = resViajeCrear.body.viaje;
  const idViaje = viaje.idViaje;
  assert.strictEqual(viaje.estado, 'PROGRAMADO');

  // State: PROGRAMADO -> EN_CURSO
  const resViajeIniciar = resMock();
  await ViajeController.iniciar({ params: { id: String(idViaje) } }, resViajeIniciar);
  assert.strictEqual(resViajeIniciar.body.viaje.estado, 'EN_CURSO');

  // EN_CURSO -> FINALIZADO
  const resViajeFinalizar = resMock();
  await ViajeController.finalizar({ params: { id: String(idViaje) } }, resViajeFinalizar);
  assert.strictEqual(resViajeFinalizar.body.viaje.estado, 'FINALIZADO');

  console.log('✔ CONTROLADORES RUTAS-VIAJES OK\n');
})();
