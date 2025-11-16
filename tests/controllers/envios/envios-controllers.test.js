// tests/controllers/envios/envios-controllers.test.js
import assert from 'assert';
import EnvioController from '../../../controllers/envios/EnvioController.js';
import TrackingEnvioController from '../../../controllers/envios/TrackingEnvioController.js';
import BodegaController from '../../../controllers/envios/BodegaController.js';
import ManifiestoCargaController from '../../../controllers/envios/ManifiestoCargaController.js';

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

(async function testEnviosControllers() {
  console.log('=== TEST CONTROLADORES ENVIOS ===');

  // 1. Registrar envío (CoR)
  const dtoEnvio = {
    codigoRastreo: 'ENV-CTRL-001',
    tipoEnvio: 'PAQUETE',
    idRemitente: 10,
    idDestinatario: 20,
    origenSedeId: 100,
    destinoSedeId: 200,
    pesoKg: 5,
    altoCm: 30,
    anchoCm: 20,
    largoCm: 15,
    valorDeclarado: 150000,
    tipoServicio: 'CONTRAENTREGA'
  };

  const resReg = resMock();
  await EnvioController.registrarEnvio({ body: dtoEnvio }, resReg);
  assert.strictEqual(resReg.statusCode, 201);
  const envio = resReg.body.envio;
  const idEnvio = envio.idEnvio;
  console.log('Envio creado ID:', idEnvio, 'estado:', envio.estado);

  // 2. Avanzar estado (State)
  const resAv1 = resMock();
  await EnvioController.avanzarEstado(
    { params: { id: String(idEnvio) } },
    resAv1
  );
  assert.strictEqual(resAv1.statusCode, 200);
  console.log('Estado después de avanzar 1:', resAv1.body.envio.estado);

  // 3. Tracking
  const resTrack = resMock();
  await TrackingEnvioController.obtenerTracking(
    { params: { id: String(idEnvio) } },
    resTrack
  );
  assert.strictEqual(resTrack.statusCode, 200);
  assert.ok(Array.isArray(resTrack.body.tracking));
  assert.ok(resTrack.body.tracking.length >= 1);

  // 4. Crear bodega e ingresar envío
  const resBodCrear = resMock();
  await BodegaController.crear(
    {
      body: {
        nombreBodega: 'Bodega Central',
        sedeId: 100,
        capacidadMaxima: 1000
      }
    },
    resBodCrear
  );
  assert.strictEqual(resBodCrear.statusCode, 201);
  const bodega = resBodCrear.body.bodega;
  const idBodega = bodega.idBodega;

  const resBodIng = resMock();
  await BodegaController.ingresoEnvio(
    { params: { id: String(idBodega) }, body: { idEnvio } },
    resBodIng
  );
  assert.strictEqual(resBodIng.statusCode, 200);
  assert.ok(resBodIng.body.inventario.length === 1);

  // 5. Crear manifiesto y asociar envío
  const resManiCrear = resMock();
  await ManifiestoCargaController.crear(
    {
      body: {
        idViaje: 999,
        idBodegaOrigen: idBodega,
        idBodegaDestino: null
      }
    },
    resManiCrear
  );
  assert.strictEqual(resManiCrear.statusCode, 201);
  const mani = resManiCrear.body.manifiesto;
  const idManifiesto = mani.idManifiesto;

  const resManiAsoc = resMock();
  await ManifiestoCargaController.asociarEnvio(
    { params: { id: String(idManifiesto) }, body: { idEnvio } },
    resManiAsoc
  );
  assert.strictEqual(resManiAsoc.statusCode, 200);
  assert.ok(resManiAsoc.body.manifiesto.enviosIds.includes(idEnvio));

  const resManiDes = resMock();
  await ManifiestoCargaController.desasociarEnvio(
    { params: { id: String(idManifiesto) }, body: { idEnvio } },
    resManiDes
  );
  assert.strictEqual(resManiDes.statusCode, 200);
  assert.ok(!resManiDes.body.manifiesto.enviosIds.includes(idEnvio));

  console.log('✔ CONTROLADORES ENVIOS OK\n');
})();
