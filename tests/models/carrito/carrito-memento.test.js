// tests/models/carrito/carrito-memento.test.js
import assert from 'assert';
import {
  CarritoCompra,
  CarritoHistory
} from '../../../models/carrito/index.js';

(function testMementoCarrito() {
  console.log('=== INICIO TEST Memento - CarritoCompra ===');

  const carrito = new CarritoCompra({ idCliente: 10 });
  const history = new CarritoHistory(carrito);

  // Snapshot 0: estado inicial vacío
  history.snapshot();
  console.log('\n--- Estado inicial del carrito ---');
  console.log(JSON.stringify(carrito, null, 2));

  // Modificación 1: agregamos un tiquete
  carrito.agregarTiquete({ viajeId: 100, asiento: 1, precio: 50000 });
  history.snapshot();

  console.log('\n--- Después de agregar un tiquete ---');
  console.log(JSON.stringify(carrito, null, 2));
  console.log('Total:', carrito.calcularTotal());

  // Modificación 2: agregamos un envío y aplicamos descuento
  carrito.agregarEnvio({
    idTemporal: 'ENV-DRAFT-1',
    dto: {
      origenSedeId: 100,
      destinoSedeId: 200,
      pesoKg: 3
    },
    precio: 30000
  });
  carrito.aplicarDescuentoGlobal(5000);
  history.snapshot();

  console.log('\n--- Después de agregar envío y aplicar descuento ---');
  console.log(JSON.stringify(carrito, null, 2));
  console.log('Total:', carrito.calcularTotal());

  // Listar snapshots
  console.log('\n--- Historial de snapshots ---');
  console.log(JSON.stringify(history.listarSnapshots(), null, 2));

  // Aserciones de totales
  const totalActual = carrito.calcularTotal();
  assert.strictEqual(totalActual, 50000 + 30000 - 5000);

  // UNDO 1: volvemos al estado previo (después de agregar solo tiquete)
  history.undo();
  console.log('\n--- Después de UNDO 1 ---');
  console.log(JSON.stringify(carrito, null, 2));
  console.log('Total:', carrito.calcularTotal());

  assert.strictEqual(carrito.tiquetesDraft.length, 1);
  assert.strictEqual(carrito.enviosDraft.length, 0);
  assert.strictEqual(carrito.calcularTotal(), 50000);

  // UNDO 2: volvemos al estado inicial (sin nada)
  history.undo();
  console.log('\n--- Después de UNDO 2 (estado inicial) ---');
  console.log(JSON.stringify(carrito, null, 2));
  console.log('Total:', carrito.calcularTotal());

  assert.strictEqual(carrito.tiquetesDraft.length, 0);
  assert.strictEqual(carrito.enviosDraft.length, 0);
  assert.strictEqual(carrito.calcularTotal(), 0);

  // REDO 1: avanzamos un paso (estado con solo tiquete)
  history.redo();
  console.log('\n--- Después de REDO 1 ---');
  console.log(JSON.stringify(carrito, null, 2));
  console.log('Total:', carrito.calcularTotal());

  assert.strictEqual(carrito.tiquetesDraft.length, 1);
  assert.strictEqual(carrito.enviosDraft.length, 0);
  assert.strictEqual(carrito.calcularTotal(), 50000);

  // REDO 2: avanzamos otro paso (estado con tiquete + envío + descuento)
  history.redo();
  console.log('\n--- Después de REDO 2 ---');
  console.log(JSON.stringify(carrito, null, 2));
  console.log('Total:', carrito.calcularTotal());

  assert.strictEqual(carrito.tiquetesDraft.length, 1);
  assert.strictEqual(carrito.enviosDraft.length, 1);
  assert.strictEqual(carrito.calcularTotal(), totalActual);

  console.log('\n✔ tests Memento - CarritoCompra OK');
  console.log('=== FIN TEST Memento - CarritoCompra ===\n');
})();
