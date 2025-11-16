// tests/models/procesos-compra/procesos-compra.test.js
import assert from 'assert';
import { ProcesoCompraTiquete, ProcesoCompraEnvio } from '../../../models/procesos-compra/index.js';
import { Viaje } from '../../../models/rutas-viajes/index.js';

(async function testTemplateMethodProcesosCompra() {
  console.log('=== INICIO TEST Template Method - Procesos de compra ===');

  // Cliente dummy
  const cliente = {
    idCliente: 10,
    nombreCompleto: 'Cliente Prueba'
  };

  // ----------- ProcesoCompraTiquete -----------

  const salidaProg = new Date();
  const llegadaProg = new Date(salidaProg.getTime() + 4 * 60 * 60 * 1000); // +4h

  const viaje = new Viaje({
    idViaje: 100,
    idRuta: 1,
    fechaHoraSalidaProgramada: salidaProg.toISOString(),
    fechaHoraLlegadaProgramada: llegadaProg.toISOString(),
    vehiculoPlaca: 'ABC123',
    idConductor: 1,
    estado: 'PROGRAMADO',
    capacidadAsientos: 40,
    asientosOcupados: 0,
    pesoCargaKg: 0,
    observaciones: 'Viaje de prueba Template Method'
  });

  const datosPagoTiquete = {
    metodo: 'TARJETA'
  };

  const procesoTiquete = new ProcesoCompraTiquete({
    cliente,
    viaje,
    datosPago: datosPagoTiquete
  });

  console.log('\n--- Ejecutando ProcesoCompraTiquete.ejecutarCompra() ---');
  await procesoTiquete.ejecutarCompra();

  console.log('\n--- Resultado ProcesoCompraTiquete ---');
  console.log('Tiquete:');
  console.log(JSON.stringify(procesoTiquete.tiquete, null, 2));
  console.log('Pago:');
  console.log(JSON.stringify(procesoTiquete.pago, null, 2));
  console.log('Factura:');
  console.log(JSON.stringify(procesoTiquete.factura, null, 2));
  console.log('Notificación (si existe):');
  console.log(JSON.stringify(procesoTiquete.notificacion ?? null, null, 2));

  assert.ok(procesoTiquete.tiquete);
  assert.strictEqual(procesoTiquete.tiquete.estado, 'PAGADO');
  assert.ok(procesoTiquete.pago.esAprobado());
  assert.ok(procesoTiquete.factura.total > 0);

  // ----------- ProcesoCompraEnvio -----------

  const envioDraft = {
    codigoRastreo: 'ENV-TM-001',
    tipoEnvio: 'PAQUETE',
    idRemitente: cliente.idCliente,
    idDestinatario: 20,
    origenSedeId: 100,
    destinoSedeId: 200,
    pesoKg: 3,
    altoCm: 20,
    anchoCm: 20,
    largoCm: 30,
    valorDeclarado: 120000,
    tipoServicio: 'EXPRESS'
  };

  const datosPagoEnvio = {
    metodo: 'TRANSFERENCIA'
  };

  const procesoEnvio = new ProcesoCompraEnvio({
    cliente,
    envioDraft,
    datosPago: datosPagoEnvio
  });

  console.log('\n--- Ejecutando ProcesoCompraEnvio.ejecutarCompra() ---');
  await procesoEnvio.ejecutarCompra();

  console.log('\n--- Resultado ProcesoCompraEnvio ---');
  console.log('Envio:');
  console.log(JSON.stringify(procesoEnvio.envio, null, 2));
  console.log('Pago:');
  console.log(JSON.stringify(procesoEnvio.pago, null, 2));
  console.log('Factura:');
  console.log(JSON.stringify(procesoEnvio.factura, null, 2));
  console.log('Notificación (si existe):');
  console.log(JSON.stringify(procesoEnvio.notificacion ?? null, null, 2));

  assert.ok(procesoEnvio.envio);
  assert.strictEqual(procesoEnvio.envio.estado, 'REGISTRADO');
  assert.ok(procesoEnvio.pago.esAprobado());
  assert.ok(procesoEnvio.factura.total > 0);

  console.log('\n✔ tests Template Method - Procesos de compra OK');
  console.log('=== FIN TEST Template Method - Procesos de compra ===\n');
})();
