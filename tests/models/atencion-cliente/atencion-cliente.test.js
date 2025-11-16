// tests/models/atencion-cliente/atencion-cliente.test.js
import assert from 'assert';
import {
  PQRS,
  Notificacion
} from '../../../models/atencion-cliente/index.js';

(function testModelosAtencionCliente() {
  console.log('=== INICIO TEST models/atencion-cliente ===');

  // ---- PQRS ----
  const pqrs = new PQRS({
    idPQRS: 1,
    idCliente: 10,
    tipo: 'QUEJA',
    asociadoA: 'TIQUETE',
    idReferencia: 1000,
    descripcion: 'El bus salió con 1 hora de retraso'
  });

  console.log('\n--- PQRS creada ---');
  console.log(JSON.stringify(pqrs, null, 2));

  assert.strictEqual(pqrs.estado, 'ABIERTA');
  assert.strictEqual(pqrs.areaResponsable, null);

  pqrs.asignarArea('SERVICIO_AL_CLIENTE');
  assert.strictEqual(pqrs.areaResponsable, 'SERVICIO_AL_CLIENTE');
  assert.strictEqual(pqrs.estado, 'EN_GESTION');

  console.log('\n--- PQRS después de asignar área ---');
  console.log(JSON.stringify(pqrs, null, 2));
  assert.ok(pqrs.puedeCerrarse());

  pqrs.registrarRespuesta('Lamentamos lo sucedido, se hará ajuste interno.');
  assert.strictEqual(pqrs.estado, 'CERRADA');
  assert.ok(pqrs.fechaCierre instanceof Date);

  console.log('\n--- PQRS después de registrar respuesta ---');
  console.log(JSON.stringify(pqrs, null, 2));

  // ---- Notificacion ----
  const notif = new Notificacion({
    idNotificacion: 1,
    idUsuarioDestino: 10,
    canal: 'EMAIL',
    titulo: 'Respuesta a tu PQRS',
    mensaje: 'Hemos respondido a tu PQRS #1',
    referenciaOrigen: 'PQRS',
    idOrigen: pqrs.idPQRS
  });

  console.log('\n--- Notificacion creada ---');
  console.log(JSON.stringify(notif, null, 2));

  assert.ok(notif.estaPendiente());
  assert.strictEqual(notif.estado, 'PENDIENTE');

  notif.marcarEnviada();
  assert.strictEqual(notif.estado, 'ENVIADA');
  assert.ok(notif.fechaEnvio instanceof Date);

  console.log('\n--- Notificacion después de marcarEnviada ---');
  console.log(JSON.stringify(notif, null, 2));

  // Forzamos un error para probar marcarError (como si se reintentara otro envío)
  notif.marcarError('Buzón lleno');
  assert.strictEqual(notif.estado, 'ERROR');

  console.log('\n--- Notificacion después de marcarError ---');
  console.log(JSON.stringify(notif, null, 2));

  console.log('\n✔ tests de models/atencion-cliente OK');
  console.log('=== FIN TEST models/atencion-cliente ===\n');
})();
