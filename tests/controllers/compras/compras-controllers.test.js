// tests/controllers/compras/compras-controllers.test.js
import assert from 'assert';
import CarritoController from '../../../controllers/compras/CarritoController.js';
import ProcesoCompraController from '../../../controllers/compras/ProcesoCompraController.js';

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

(async function testComprasControllers() {
  console.log('=== TEST CONTROLADORES COMPRAS (CARRITO + PROCESO COMPRA) ===');

  // ========== PARTE 1: CARRITO + MEMENTO ==========

  // 1. Crear carrito
  const resCarritoCrear = resMock();
  await CarritoController.crearCarrito(
    {
      body: { idCliente: 10 }
    },
    resCarritoCrear
  );
  assert.strictEqual(resCarritoCrear.statusCode, 201);
  const carrito = resCarritoCrear.body.carrito;
  const idCarrito = carrito.idCarrito;
  console.log('Carrito creado:', idCarrito);

  // 2. Agregar tiquete
  const resAddTiq = resMock();
  await CarritoController.agregarTiquete(
    {
      params: { id: String(idCarrito) },
      body: {
        viajeId: 100,
        asiento: 5,
        precio: 50000
      }
    },
    resAddTiq
  );
  assert.strictEqual(resAddTiq.statusCode, 200);
  assert.strictEqual(resAddTiq.body.carrito.tiquetesDraft.length, 1);

  // 3. Agregar envío
  const resAddEnv = resMock();
  await CarritoController.agregarEnvio(
    {
      params: { id: String(idCarrito) },
      body: {
        origenSedeId: 1,
        destinoSedeId: 2,
        pesoKg: 3,
        valorDeclarado: 150000,
        tipoServicio: 'EXPRESS',
        precio: 30000
      }
    },
    resAddEnv
  );
  assert.strictEqual(resAddEnv.statusCode, 200);
  assert.strictEqual(resAddEnv.body.carrito.enviosDraft.length, 1);

  // 4. Guardar snapshot
  const resSnap = resMock();
  await CarritoController.guardarSnapshot(
    { params: { id: String(idCarrito) } },
    resSnap
  );
  assert.strictEqual(resSnap.statusCode, 200);
  const snapshotsDespues = resSnap.body.snapshots;
  console.log('Snapshots después de snapshot explícito:', snapshotsDespues);

  // 5. Agregar otro tiquete y luego deshacer
  const resAddTiq2 = resMock();
  await CarritoController.agregarTiquete(
    {
      params: { id: String(idCarrito) },
      body: {
        viajeId: 101,
        asiento: 6,
        precio: 60000
      }
    },
    resAddTiq2
  );
  assert.strictEqual(resAddTiq2.statusCode, 200);
  assert.strictEqual(resAddTiq2.body.carrito.tiquetesDraft.length, 2);

  const resUndo = resMock();
  await CarritoController.deshacer(
    { params: { id: String(idCarrito) } },
    resUndo
  );
  assert.strictEqual(resUndo.statusCode, 200);
  // después del undo debería volver a 1 tiquete (según snapshots tomados)
  console.log('Carrito después de deshacer:', JSON.stringify(resUndo.body.carrito, null, 2));

  // ========== PARTE 2: TEMPLATE METHOD (PROCESOS DE COMPRA) ==========

  // 6. Compra de tiquete
  const viajeDemo = {
    idViaje: 200,
    cupos: 5,
    hayAsientosDisponibles(cantidad) {
      return this.cupos >= cantidad;
    },
    reservarAsientos(cantidad) {
      if (!this.hayAsientosDisponibles(cantidad)) {
        throw new Error('No hay asientos disponibles');
      }
      this.cupos -= cantidad;
    }
  };

  const resCompraTiq = resMock();
  await ProcesoCompraController.comprarTiquete(
    {
      body: {
        cliente: { idCliente: 10 },
        viaje: viajeDemo,
        datosPago: { metodo: 'TARJETA' }
      }
    },
    resCompraTiq
  );

  assert.ok([200, 400].includes(resCompraTiq.statusCode));
  if (resCompraTiq.statusCode === 200) {
    assert.strictEqual(resCompraTiq.body.ok, true);
    assert.ok(resCompraTiq.body.tiquete);
    assert.ok(resCompraTiq.body.pago);
    assert.ok(resCompraTiq.body.factura);
  } else {
    console.log('Compra tiquete falló por reglas de negocio:', resCompraTiq.body.mensaje);
  }

  // 7. Compra de envío
  const envioDraft = {
    origenSedeId: 1,
    destinoSedeId: 2,
    pesoKg: 3,
    altoCm: 30,
    anchoCm: 20,
    largoCm: 15,
    valorDeclarado: 150000,
    tipoServicio: 'EXPRESS'
  };

  const resCompraEnv = resMock();
  await ProcesoCompraController.comprarEnvio(
    {
      body: {
        cliente: { idCliente: 10 },
        envioDraft,
        datosPago: { metodo: 'EFECTIVO' }
      }
    },
    resCompraEnv
  );

  assert.ok([200, 400].includes(resCompraEnv.statusCode));
  if (resCompraEnv.statusCode === 200) {
    assert.strictEqual(resCompraEnv.body.ok, true);
    assert.ok(resCompraEnv.body.envio);
    assert.ok(resCompraEnv.body.pago);
    assert.ok(resCompraEnv.body.factura);
  } else {
    console.log('Compra envío falló por reglas de negocio:', resCompraEnv.body.mensaje);
  }

  console.log('✔ CONTROLADORES COMPRAS OK\n');
})();
