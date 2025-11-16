// tests/controllers/atencion-cliente/atencion-cliente-controllers.test.js
import assert from 'assert';
import PqrsController from '../../../controllers/atencion-cliente/PqrsController.js';
import NotificacionController from '../../../controllers/atencion-cliente/NotificacionController.js';

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

(async function testAtencionClienteControllers() {
  console.log('=== TEST CONTROLADORES ATENCION AL CLIENTE ===');

  const idCliente = 10;

  // 1. Registrar PQRS
  const resPqrsCrear = resMock();
  await PqrsController.registrarPQRS(
    {
      body: {
        idCliente,
        tipo: 'Q',
        descripcion: 'La silla estaba dañada',
        canal: 'WEB',
        idTiquete: 1234
      }
    },
    resPqrsCrear
  );
  assert.strictEqual(resPqrsCrear.statusCode, 201);
  const pqrs = resPqrsCrear.body.pqrs;
  const idPQRS = pqrs.idPQRS;
  assert.strictEqual(pqrs.estado, 'ABIERTA');

  // 2. Asignar área responsable
  const resPqrsArea = resMock();
  await PqrsController.asignarArea(
    {
      params: { id: String(idPQRS) },
      body: { areaResponsable: 'SERVICIO_CLIENTE' }
    },
    resPqrsArea
  );
  assert.strictEqual(resPqrsArea.statusCode, 200);
  assert.strictEqual(resPqrsArea.body.pqrs.estado, 'EN_GESTION');

  // 3. Registrar respuesta parcial
  const resPqrsResp = resMock();
  await PqrsController.registrarRespuesta(
    {
      params: { id: String(idPQRS) },
      body: { respuesta: 'Estamos revisando el caso', usuarioResponsable: 'AGENTE1' }
    },
    resPqrsResp
  );
  assert.strictEqual(resPqrsResp.statusCode, 200);
  assert.ok(Array.isArray(resPqrsResp.body.pqrs.respuestas));
  assert.ok(resPqrsResp.body.pqrs.respuestas.length >= 1);

  // 4. Cerrar PQRS
  const resPqrsCerrar = resMock();
  await PqrsController.cerrarPQRS(
    {
      params: { id: String(idPQRS) },
      body: { respuestaFinal: 'Se dio solución y se compensó al cliente', usuarioResponsable: 'AGENTE2' }
    },
    resPqrsCerrar
  );
  assert.strictEqual(resPqrsCerrar.statusCode, 200);
  assert.strictEqual(resPqrsCerrar.body.pqrs.estado, 'CERRADA');

  // 5. Listar notificaciones del usuario (debería tener al menos 2: registro y cierre)
  const resNotifList = resMock();
  await NotificacionController.listarPorUsuario(
    { params: { idUsuario: String(idCliente) } },
    resNotifList
  );
  assert.strictEqual(resNotifList.statusCode, 200);
  const notifs = resNotifList.body.notificaciones;
  assert.ok(Array.isArray(notifs));
  assert.ok(notifs.length >= 2);

  const primeraNotif = notifs[0];
  const idNotif = primeraNotif.idNotificacion;

  // 6. Marcar una notificación como leída
  const resNotifLeida = resMock();
  await NotificacionController.marcarLeida(
    { params: { id: String(idNotif) } },
    resNotifLeida
  );
  assert.strictEqual(resNotifLeida.statusCode, 200);
  assert.strictEqual(resNotifLeida.body.notificacion.leida, true);

  console.log('✔ CONTROLADORES ATENCION AL CLIENTE OK\n');
})();
