// tests/controllers/pagos-facturacion/pagos-facturacion-controllers.test.js
import assert from 'assert';
import PagoController from '../../../controllers/pagos-facturacion/PagoController.js';
import FacturaController from '../../../controllers/pagos-facturacion/FacturaController.js';
import SeguroEnvioController from '../../../controllers/pagos-facturacion/SeguroEnvioController.js';

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

(async function testPagosFacturacionControllers() {
  console.log('=== TEST CONTROLADORES PAGOS/FACTURACION ===');

  // 1. Registrar pago para tiquete
  const resPagoCrear = resMock();
  await PagoController.registrarPago(
    {
      body: {
        idReferencia: 1001,
        tipoReferencia: 'TIQUETE',
        monto: 50000,
        moneda: 'COP',
        metodoPago: 'TARJETA'
      }
    },
    resPagoCrear
  );
  assert.strictEqual(resPagoCrear.statusCode, 201);
  const pago = resPagoCrear.body.pago;
  const idPago = pago.idPago;
  assert.strictEqual(pago.estado, 'PENDIENTE');

  // 2. Aprobar pago
  const resPagoApr = resMock();
  await PagoController.aprobarPago(
    { params: { id: String(idPago) } },
    resPagoApr
  );
  assert.strictEqual(resPagoApr.statusCode, 200);
  assert.strictEqual(resPagoApr.body.pago.estado, 'APROBADO');

  // 3. Registrar pago y rechazarlo
  const resPagoCrear2 = resMock();
  await PagoController.registrarPago(
    {
      body: {
        idReferencia: 2001,
        tipoReferencia: 'ENVIO',
        monto: 70000
      }
    },
    resPagoCrear2
  );
  const pago2 = resPagoCrear2.body.pago;
  const idPago2 = pago2.idPago;

  const resPagoRech = resMock();
  await PagoController.rechazarPago(
    { params: { id: String(idPago2) }, body: { motivo: 'Fondos insuficientes' } },
    resPagoRech
  );
  assert.strictEqual(resPagoRech.statusCode, 200);
  assert.strictEqual(resPagoRech.body.pago.estado, 'RECHAZADO');

  // 4. Crear factura con items
  const resFactCrear = resMock();
  await FacturaController.crearFactura(
    {
      body: {
        idCliente: 10,
        numeroFacturaExterna: 'FAC-001',
        items: [
          {
            descripcion: 'Tiquete viaje 1001',
            cantidad: 1,
            precioUnitario: 50000,
            impuesto: 0.19
          },
          {
            descripcion: 'Seguro de viaje',
            cantidad: 1,
            precioUnitario: 5000,
            impuesto: 0.19
          }
        ]
      }
    },
    resFactCrear
  );
  assert.strictEqual(resFactCrear.statusCode, 201);
  const factura = resFactCrear.body.factura;
  const idFactura = factura.idFactura;
  assert.ok(Array.isArray(factura.items));
  assert.strictEqual(factura.items.length, 2);

  // 5. Obtener factura
  const resFactGet = resMock();
  await FacturaController.obtenerFactura(
    { params: { id: String(idFactura) } },
    resFactGet
  );
  assert.strictEqual(resFactGet.statusCode, 200);

  // 6. Listar facturas por cliente
  const resFactCliente = resMock();
  await FacturaController.facturasPorCliente(
    { params: { idCliente: '10' } },
    resFactCliente
  );
  assert.strictEqual(resFactCliente.statusCode, 200);
  assert.ok(resFactCliente.body.facturas.length >= 1);

  // 7. Anular factura
  const resFactAnular = resMock();
  await FacturaController.anularFactura(
    { params: { id: String(idFactura) }, body: { motivo: 'Error en datos' } },
    resFactAnular
  );
  assert.strictEqual(resFactAnular.statusCode, 200);
  assert.strictEqual(resFactAnular.body.factura.estado, 'ANULADA');

  // 8. Seguro de envío
  const resSeguroCrear = resMock();
  await SeguroEnvioController.crear(
    {
      body: {
        idEnvio: 3001,
        valorAsegurado: 150000,
        prima: 5000,
        moneda: 'COP'
      }
    },
    resSeguroCrear
  );
  assert.strictEqual(resSeguroCrear.statusCode, 201);
  const seguro = resSeguroCrear.body.seguro;
  const idSeguro = seguro.idSeguro;

  const resSeguroGet = resMock();
  await SeguroEnvioController.obtener(
    { params: { id: String(idSeguro) } },
    resSeguroGet
  );
  assert.strictEqual(resSeguroGet.statusCode, 200);

  const resSeguroUpd = resMock();
  await SeguroEnvioController.actualizar(
    {
      params: { id: String(idSeguro) },
      body: { prima: 6000 }
    },
    resSeguroUpd
  );
  assert.strictEqual(resSeguroUpd.statusCode, 200);
  assert.strictEqual(resSeguroUpd.body.seguro.prima, 6000);

  console.log('✔ CONTROLADORES PAGOS/FACTURACION OK\n');
})();
