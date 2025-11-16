// tests/models/envios/envios.test.js
import assert from 'assert';
import {
  Envio,
  TrackingEnvio,
  Bodega,
  ItemInventarioBodega,
  ManifiestoCarga
} from '../../../models/envios/index.js';

(function testModelosEnvios() {
  console.log('=== INICIO TEST models/envios ===');

  // ---- Envio ----
  const envio = new Envio({
    idEnvio: 1,
    codigoRastreo: 'ENV-001',
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
    observaciones: 'Manejar con cuidado'
  });

  console.log('\n--- Envio creado ---');
  console.log(JSON.stringify(envio, null, 2));

  assert.strictEqual(envio.calcularVolumenCm3(), 30 * 20 * 15);
  assert.ok(envio.esElegibleContraentrega());

  envio.cambiarEstado('EN_BODEGA_ORIGEN', 'Recibido en bodega origen');
  assert.strictEqual(envio.estado, 'EN_BODEGA_ORIGEN');

  console.log('\n--- Envio después de cambiar estado ---');
  console.log(JSON.stringify(envio, null, 2));

  envio.cambiarEstado('EN_REPARTO', 'En reparto al destinatario');
  assert.strictEqual(envio.estado, 'EN_REPARTO');
  assert.ok(envio.puedeMarcarseEntregado());

  envio.marcarEntregado();
  assert.strictEqual(envio.estado, 'ENTREGADO');
  assert.ok(envio.fechaEntregaReal instanceof Date);

  console.log('\n--- Envio después de marcar entregado ---');
  console.log(JSON.stringify(envio, null, 2));

  // ---- TrackingEnvio ----
  const tracking = new TrackingEnvio({
    idTracking: 1,
    idEnvio: envio.idEnvio,
    estado: 'EN_BODEGA_ORIGEN',
    ubicacionTexto: 'Bodega Bogotá',
    sedeId: 100,
    observaciones: 'Ingreso a bodega'
  });

  console.log('\n--- TrackingEnvio creado ---');
  console.log(JSON.stringify(tracking, null, 2));
  console.log('\nDescripción corta tracking:');
  console.log(tracking.descripcionCorta());

  const evento = tracking.registrarEvento();
  assert.strictEqual(evento.idEnvio, envio.idEnvio);

  // ---- Bodega ----
  const bodega = new Bodega({
    idBodega: 1,
    sedeId: 100,
    nombreBodega: 'Bodega Central Bogotá',
    capacidadMaximaKg: 1000,
    capacidadUtilizadaKg: 100
  });

  console.log('\n--- Bodega creada ---');
  console.log(JSON.stringify(bodega, null, 2));
  console.log('Capacidad disponible:', bodega.capacidadDisponibleKg(), 'kg');

  assert.ok(bodega.tieneCapacidadPara(200));
  bodega.registrarIngreso(200);
  assert.strictEqual(bodega.capacidadUtilizadaKg, 300);

  bodega.registrarSalida(50);
  assert.strictEqual(bodega.capacidadUtilizadaKg, 250);

  console.log('\n--- Bodega después de operaciones ---');
  console.log(JSON.stringify(bodega, null, 2));

  // ---- ItemInventarioBodega ----
  const item = new ItemInventarioBodega({
    idItem: 1,
    idBodega: bodega.idBodega,
    idEnvio: envio.idEnvio,
    ubicacionFisica: 'Estante A - Fila 3',
    estado: 'ALMACENADO'
  });

  console.log('\n--- ItemInventarioBodega creado ---');
  console.log(JSON.stringify(item, null, 2));

  assert.ok(item.estaAlmacenado());
  item.marcarPendienteDespacho();
  assert.strictEqual(item.estado, 'PENDIENTE_DESPACHO');

  item.marcarDespachado();
  assert.strictEqual(item.estado, 'DESPACHADO');
  assert.ok(item.fechaSalida instanceof Date);

  console.log('\n--- ItemInventarioBodega después de operaciones ---');
  console.log(JSON.stringify(item, null, 2));

  // ---- ManifiestoCarga ----
  const manifiesto = new ManifiestoCarga({
    idManifiesto: 1,
    idViaje: 500,
    observaciones: 'Salida nocturna'
  });

  console.log('\n--- ManifiestoCarga creado ---');
  console.log(JSON.stringify(manifiesto, null, 2));

  manifiesto.agregarEnvio(envio);
  assert.strictEqual(manifiesto.cantidadEnvios, 1);
  assert.strictEqual(manifiesto.pesoTotalKg, envio.pesoKg);

  console.log('\n--- ManifiestoCarga después de agregar envío ---');
  console.log(JSON.stringify(manifiesto, null, 2));

  // Recalcular totales usando un map
  const enviosMap = new Map();
  enviosMap.set(envio.idEnvio, envio);

  manifiesto.recalcularTotales(enviosMap);
  assert.strictEqual(manifiesto.pesoTotalKg, envio.pesoKg);

  console.log('\n--- ManifiestoCarga después de recalcularTotales ---');
  console.log(JSON.stringify(manifiesto, null, 2));

  assert.strictEqual(manifiesto.excedeCapacidadVehiculo(100), false);
  assert.strictEqual(manifiesto.excedeCapacidadVehiculo(3), true);

  manifiesto.eliminarEnvio(envio);
  assert.strictEqual(manifiesto.cantidadEnvios, 0);

  console.log('\n--- ManifiestoCarga después de eliminar envío ---');
  console.log(JSON.stringify(manifiesto, null, 2));

  console.log('\n✔ tests de models/envios OK');
  console.log('=== FIN TEST models/envios ===\n');
})();
