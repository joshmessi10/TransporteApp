// tests/models/pagos-facturacion/pagos-facturacion.test.js
import assert from 'assert';
import {
  Pago,
  Factura,
  ItemFactura,
  SeguroEnvio
} from '../../../models/pagos-facturacion/index.js';

(function testModelosPagosFacturacion() {
  console.log('=== INICIO TEST models/pagos-facturacion ===');

  // ---- Pago ----
  const pago = new Pago({
    idPago: 1,
    idCliente: 10,
    monto: 59500,
    metodoPago: 'TARJETA',
    origenPago: 'TIQUETE',
    idOrigen: 1000
  });

  console.log('\n--- Pago creado ---');
  console.log(JSON.stringify(pago, null, 2));

  assert.strictEqual(pago.esAprobado(), false);
  assert.ok(pago.correspondeMonto(59500));

  pago.marcarAprobado('REF-123-ABC');
  assert.strictEqual(pago.estado, 'APROBADO');
  assert.strictEqual(pago.referenciaPasarela, 'REF-123-ABC');

  pago.marcarRechazado('Test motivo'); // lo sobrescribe a RECHAZADO
  assert.strictEqual(pago.estado, 'RECHAZADO');

  console.log('\n--- Pago después de operaciones ---');
  console.log(JSON.stringify(pago, null, 2));

  // ---- Items de factura ----
  const item1 = new ItemFactura({
    idItem: 1,
    idFactura: 1,
    descripcion: 'Tiquete BOG-MED',
    cantidad: 1,
    precioUnitario: 50000,
    impuesto: 9500
  });

  const item2 = new ItemFactura({
    idItem: 2,
    idFactura: 1,
    descripcion: 'Servicio adicional de equipaje',
    cantidad: 1,
    precioUnitario: 10000,
    impuesto: 1900
  });

  console.log('\n--- ItemFactura 1 creado ---');
  console.log(JSON.stringify(item1, null, 2));

  console.log('\n--- ItemFactura 2 creado ---');
  console.log(JSON.stringify(item2, null, 2));

  assert.strictEqual(item1.subtotal, 50000);
  assert.strictEqual(item1.totalConImpuesto(), 59500);

  assert.strictEqual(item2.subtotal, 10000);
  assert.strictEqual(item2.totalConImpuesto(), 11900);

  // ---- Factura ----
  const factura = new Factura({
    idFactura: 1,
    numeroFactura: 'FV-2025-00001',
    idCliente: 10,
    medioGeneracion: 'WEB'
  });

  console.log('\n--- Factura creada ---');
  console.log(JSON.stringify(factura, null, 2));

  factura.calcularTotales([item1, item2]);
  assert.strictEqual(factura.subtotal, 60000);
  assert.strictEqual(factura.impuestos, 11400);
  assert.strictEqual(factura.total, 71400);

  console.log('\n--- Factura después de calcularTotales ---');
  console.log(JSON.stringify(factura, null, 2));
  console.log('Descripción resumen:', factura.generarDescripcionResumen());

  assert.ok(factura.puedeAnularse());
  factura.marcarAnulada('Error en datos del cliente');
  assert.strictEqual(factura.estado, 'ANULADA');

  console.log('\n--- Factura después de marcarAnulada ---');
  console.log(JSON.stringify(factura, null, 2));

  // ---- SeguroEnvio ----
  const fechaVenc = new Date();
  fechaVenc.setMonth(fechaVenc.getMonth() + 1); // +1 mes

  const seguro = new SeguroEnvio({
    idSeguro: 1,
    idEnvio: 1,
    valorAsegurado: 200000,
    condiciones: 'Cubre daños y pérdida total',
    fechaVencimiento: fechaVenc.toISOString()
  });

  console.log('\n--- SeguroEnvio creado ---');
  console.log(JSON.stringify(seguro, null, 2));

  const prima = seguro.calcularPrima(5); // 5%
  assert.strictEqual(prima, 10000);
  assert.strictEqual(seguro.prima, 10000);

  assert.ok(seguro.estaVigente());
  seguro.marcarReclamado();
  assert.strictEqual(seguro.estado, 'RECLAMADO');
  assert.strictEqual(seguro.estaVigente(), false);

  seguro.marcarVencido();
  assert.strictEqual(seguro.estado, 'VENCIDO');

  console.log('\n--- SeguroEnvio después de operaciones ---');
  console.log(JSON.stringify(seguro, null, 2));

  console.log('\n✔ tests de models/pagos-facturacion OK');
  console.log('=== FIN TEST models/pagos-facturacion ===\n');
})();
