// tests/controllers/pasajeros/pasajeros-controllers.test.js
import assert from 'assert';
import ReservaTiqueteController from '../../../controllers/pasajeros/ReservaTiqueteController.js';
import TiqueteController from '../../../controllers/pasajeros/TiqueteController.js';
import EquipajeController from '../../../controllers/pasajeros/EquipajeController.js';

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

(async function testPasajerosControllers() {
  console.log('=== TEST CONTROLADORES PASAJEROS ===');

  const idCliente = 10;
  const idViaje = 100;

  // 1. Crear reserva
  const resResCrear = resMock();
  await ReservaTiqueteController.crearReserva(
    {
      body: {
        idViaje,
        idCliente,
        asiento: 5,
        fechaExpiracion: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    },
    resResCrear
  );
  assert.strictEqual(resResCrear.statusCode, 201);
  const reserva = resResCrear.body.reserva;
  const idReserva = reserva.idReserva;
  assert.strictEqual(reserva.estado, 'ACTIVA');

  // 2. Confirmar reserva -> genera tiquete
  const resResConf = resMock();
  await ReservaTiqueteController.confirmarReserva(
    { params: { id: String(idReserva) } },
    resResConf
  );
  assert.strictEqual(resResConf.statusCode, 200);
  assert.strictEqual(resResConf.body.reserva.estado, 'CONFIRMADA');
  const tiqueteGenerado = resResConf.body.tiquete;
  const idTiqueteGen = tiqueteGenerado.idTiquete;
  assert.strictEqual(tiqueteGenerado.estado, 'VENDIDO');

  // 3. Crear otro tiquete directo
  const resTiqCrear = resMock();
  await TiqueteController.crearTiquete(
    {
      body: {
        idCliente,
        idViaje,
        asiento: 6
      }
    },
    resTiqCrear
  );
  assert.strictEqual(resTiqCrear.statusCode, 201);
  const tiquete2 = resTiqCrear.body.tiquete;
  const idTiquete2 = tiquete2.idTiquete;

  // 4. Historial de tiquetes del cliente (debería tener al menos 2)
  const resHist = resMock();
  await TiqueteController.historialCliente(
    { params: { idCliente: String(idCliente) } },
    resHist
  );
  assert.strictEqual(resHist.statusCode, 200);
  assert.ok(resHist.body.tiquetes.length >= 2);

  // 5. Marcar tiquete generado como usado
  const resUsar = resMock();
  await TiqueteController.marcarUsado(
    { params: { id: String(idTiqueteGen) } },
    resUsar
  );
  assert.strictEqual(resUsar.statusCode, 200);
  assert.strictEqual(resUsar.body.tiquete.estado, 'USADO');

  // 6. Intentar anular el segundo tiquete (según las reglas de dominio puede no ser anulable)
  const resAnular = resMock();
  await TiqueteController.anularTiquete(
    {
      params: { id: String(idTiquete2) },
      body: { motivo: 'Cliente solicitó cambio' }
    },
    resAnular
  );

  // Aquí probamos que el dominio protege la anulación inválida
  // y que el controller lo traduce en 400
  assert.strictEqual(resAnular.statusCode, 400);
  assert.strictEqual(resAnular.body.ok, false);
  console.log('Mensaje de anulación rechazada:', resAnular.body.mensaje);

  // 7. Registrar equipaje para tiquete usado
  const resEqCrear = resMock();
  await EquipajeController.registrarEquipaje(
    {
      params: { idTiquete: String(idTiqueteGen) },
      body: {
        pesoKg: 20,
        tipo: 'MALETA',
        descripcion: 'Maleta grande azul'
      }
    },
    resEqCrear
  );
  assert.strictEqual(resEqCrear.statusCode, 201);
  const equipaje = resEqCrear.body.equipaje;
  const idEquipaje = equipaje.idEquipaje;

  // 8. Listar equipajes del tiquete
  const resEqList = resMock();
  await EquipajeController.listarEquipajes(
    { params: { idTiquete: String(idTiqueteGen) } },
    resEqList
  );
  assert.strictEqual(resEqList.statusCode, 200);
  assert.ok(resEqList.body.equipajes.length >= 1);

  // 9. Eliminar equipaje
  const resEqDel = resMock();
  await EquipajeController.eliminarEquipaje(
    { params: { idEquipaje: String(idEquipaje) } },
    resEqDel
  );
  assert.strictEqual(resEqDel.statusCode, 200);

  console.log('✔ CONTROLADORES PASAJEROS OK\n');
})();
