// tests/models/usuarios/usuarios.test.js
import assert from 'assert';
import { Usuario, Admin, Cliente } from '../../../models/usuarios/index.js';

(function testModelosUsuarios() {
  console.log('=== INICIO TEST models/usuarios ===');

  // ---- Test Cliente ----
  const cliente = new Cliente({
    idUsuario: 1,
    nombreUsuario: 'karen',
    hashContrasena: '1234',
    tipoDocumento: 'CC',
    numeroDocumento: '1000000000',
    nombreCompleto: 'Karen Estudiante',
    correo: 'karen@example.com',
    telefono: '3001234567',
    direccion: 'Calle 123 #45-67'
  });

  console.log('\n--- Cliente creado ---');
  console.log(JSON.stringify(cliente, null, 2));

  assert.strictEqual(cliente.tipoUsuario, 'CLIENTE');
  assert.strictEqual(cliente.autenticar('1234'), true);
  assert.strictEqual(cliente.autenticar('xxxx'), false);

  cliente.bloquearCuenta();
  assert.strictEqual(cliente.estadoCuenta, 'BLOQUEADA');

  cliente.desbloquearCuenta();
  assert.strictEqual(cliente.estadoCuenta, 'ACTIVA');

  cliente.aceptarTerminos();
  assert.strictEqual(cliente.aceptoTerminos, true);
  assert.ok(cliente.fechaAceptacionTerminos instanceof Date);

  cliente.actualizarDatosFacturacion('900123456-7', 'Empresa XYZ S.A.S.');
  assert.strictEqual(cliente.nitEmpresa, '900123456-7');
  assert.strictEqual(cliente.razonSocial, 'Empresa XYZ S.A.S.');

  console.log('\n--- Cliente después de operaciones ---');
  console.log(JSON.stringify(cliente, null, 2));

  // ---- Test Admin ----
  const admin = new Admin({
    idUsuario: 2,
    nombreUsuario: 'admin',
    hashContrasena: 'admin',
    tipoDocumento: 'CC',
    numeroDocumento: '99999999',
    nombreCompleto: 'Admin Principal',
    correo: 'admin@example.com',
    telefono: '3010000000',
    direccion: 'Oficina Central',
    cargo: 'COORDINADOR_LOGISTICO',
    sedeAsignadaId: 10
  });

  console.log('\n--- Admin creado ---');
  console.log(JSON.stringify(admin, null, 2));

  assert.strictEqual(admin.tipoUsuario, 'ADMIN');
  assert.strictEqual(admin.autenticar('admin'), true);
  assert.ok(admin.puedeAdministrarSede(10));
  assert.ok(!admin.puedeAdministrarSede(5));

  admin.asignarSede(5);
  assert.ok(admin.puedeAdministrarSede(5));

  admin.actualizarCargo('GERENTE_OPERACIONES');
  assert.strictEqual(admin.cargo, 'GERENTE_OPERACIONES');

  console.log('\n--- Admin después de operaciones ---');
  console.log(JSON.stringify(admin, null, 2));

  // ---- Test Usuario base ----
  const usuario = new Usuario({
    idUsuario: 3,
    tipoUsuario: 'CLIENTE',
    tipoDocumento: 'CC',
    numeroDocumento: '123456',
    nombreCompleto: 'Usuario Base',
    correo: 'user@example.com',
    telefono: '3020000000',
    direccion: 'Dirección X',
    nombreUsuario: 'userbase',
    hashContrasena: 'pass'
  });

  console.log('\n--- Usuario base creado ---');
  console.log(JSON.stringify(usuario, null, 2));

  usuario.registrarAccesoExitoso();
  assert.ok(usuario.ultimoAcceso instanceof Date);

  usuario.cambiarContrasena('pass', 'nuevoPass');
  assert.strictEqual(usuario.autenticar('nuevoPass'), true);

  console.log('\n--- Usuario base después de operaciones ---');
  console.log(JSON.stringify(usuario, null, 2));

  console.log('\n✔ tests de models/usuarios OK');
  console.log('=== FIN TEST models/usuarios ===\n');
})();
