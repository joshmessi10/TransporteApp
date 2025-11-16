// tests/models/envios/envio-state.test.js
import assert from 'assert';
import { Envio } from '../../../models/envios/index.js';

(function testStateEnvio() {
  console.log('=== INICIO TEST State Envio ===');

  const envio = new Envio({
    idEnvio: 1,
    codigoRastreo: 'ENV-STATE-001',
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
    tipoServicio: 'CONTRAENTREGA',
    estado: 'REGISTRADO',
    observaciones: ''
  });

  console.log('\n--- Envio inicial ---');
  console.log(JSON.stringify(envio, null, 2));
  assert.strictEqual(envio.estado, 'REGISTRADO');

  // REGISTRADO -> EN_BODEGA_ORIGEN
  envio.avanzar();
  console.log('\n--- Después de avanzar() desde REGISTRADO ---');
  console.log(JSON.stringify(envio, null, 2));
  assert.strictEqual(envio.estado, 'EN_BODEGA_ORIGEN');

  // EN_BODEGA_ORIGEN -> EN_TRANSITO
  envio.avanzar();
  console.log('\n--- Después de avanzar() desde EN_BODEGA_ORIGEN ---');
  console.log(JSON.stringify(envio, null, 2));
  assert.strictEqual(envio.estado, 'EN_TRANSITO');

  // EN_TRANSITO -> EN_BODEGA_DESTINO
  envio.avanzar();
  console.log('\n--- Después de avanzar() desde EN_TRANSITO ---');
  console.log(JSON.stringify(envio, null, 2));
  assert.strictEqual(envio.estado, 'EN_BODEGA_DESTINO');

  // EN_BODEGA_DESTINO -> EN_REPARTO
  envio.avanzar();
  console.log('\n--- Después de avanzar() desde EN_BODEGA_DESTINO ---');
  console.log(JSON.stringify(envio, null, 2));
  assert.strictEqual(envio.estado, 'EN_REPARTO');

  // EN_REPARTO -> ENTREGADO
  envio.avanzar();
  console.log('\n--- Después de avanzar() desde EN_REPARTO ---');
  console.log(JSON.stringify(envio, null, 2));
  assert.strictEqual(envio.estado, 'ENTREGADO');
  assert.ok(envio.fechaEntregaReal instanceof Date);

  // Intentar avanzar desde ENTREGADO debe lanzar error
  let errorLancado = false;
  try {
    envio.avanzar();
  } catch (e) {
    errorLancado = true;
    console.log('\n--- Error esperado al avanzar() desde ENTREGADO ---');
    console.log(e.message);
  }
  assert.strictEqual(errorLancado, true);

  // Probamos marcarFallido en un nuevo envío
  const envioFallido = new Envio({
    idEnvio: 2,
    codigoRastreo: 'ENV-STATE-002',
    tipoEnvio: 'DOCUMENTO',
    idRemitente: 30,
    idDestinatario: 40,
    origenSedeId: 100,
    destinoSedeId: 200,
    pesoKg: 1,
    altoCm: 10,
    anchoCm: 10,
    largoCm: 10,
    valorDeclarado: 20000,
    tipoServicio: 'ESTANDAR',
    estado: 'REGISTRADO',
    observaciones: ''
  });

  console.log('\n--- EnvioFallido inicial ---');
  console.log(JSON.stringify(envioFallido, null, 2));

  envioFallido.marcarFallido('Dirección inválida');
  console.log('\n--- EnvioFallido después de marcarFallido ---');
  console.log(JSON.stringify(envioFallido, null, 2));

  assert.strictEqual(envioFallido.estado, 'FALLIDO');
  assert.ok(envioFallido.observaciones.includes('Dirección inválida'));

  console.log('\n✔ tests State Envio OK');
  console.log('=== FIN TEST State Envio ===\n');
})();
