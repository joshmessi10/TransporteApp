// tests/models/organizacion/organizacion.test.js
import assert from 'assert';
import {
  Sede,
  Vehiculo,
  Conductor,
  Mantenimiento
} from '../../../models/organizacion/index.js';

(function testModelosOrganizacion() {
  console.log('=== INICIO TEST models/organizacion ===');

  // ---- Sede ----
  const sede = new Sede({
    idSede: 1,
    nombreSede: 'Terminal Norte',
    ciudad: 'Bogotá',
    direccion: 'Autopista Norte #123-45',
    telefonoContacto: '6011234567',
    tipoSede: 'TERMINAL'
  });

  console.log('\n--- Sede creada ---');
  console.log(JSON.stringify(sede, null, 2));

  assert.strictEqual(sede.activo, true);
  assert.strictEqual(
    sede.obtenerDireccionCompleta(),
    'Autopista Norte #123-45, Bogotá'
  );

  sede.desactivar();
  assert.strictEqual(sede.activo, false);
  sede.activar();
  assert.strictEqual(sede.activo, true);

  console.log('\n--- Sede después de operaciones ---');
  console.log(JSON.stringify(sede, null, 2));

  // ---- Vehiculo ----
  const vehiculo = new Vehiculo({
    placa: 'ABC123',
    tipoVehiculo: 'BUS',
    marca: 'Chevrolet',
    modelo: 'Andare',
    anio: 2020,
    capacidadPasajeros: 40,
    capacidadCargaKg: 500,
    kilometrajeActual: 100000,
    sedeActualId: sede.idSede
  });

  console.log('\n--- Vehiculo creado ---');
  console.log(JSON.stringify(vehiculo, null, 2));

  assert.strictEqual(vehiculo.sedeActualId, 1);
  assert.ok(vehiculo.tieneCapacidadCarga(300));
  assert.ok(!vehiculo.tieneCapacidadCarga(800));

  vehiculo.actualizarKilometraje(110000);
  assert.strictEqual(vehiculo.kilometrajeActual, 110000);

  vehiculo.cambiarEstado('MANTENIMIENTO');
  assert.strictEqual(vehiculo.estadoOperativo, 'MANTENIMIENTO');

  vehiculo.asignarSede(2);
  assert.strictEqual(vehiculo.sedeActualId, 2);

  console.log('\n--- Vehiculo después de operaciones ---');
  console.log(JSON.stringify(vehiculo, null, 2));

  // ---- Conductor ----
  const conductor = new Conductor({
    idConductor: 1,
    tipoDocumento: 'CC',
    numeroDocumento: '11111111',
    nombreCompleto: 'Juan Pérez',
    telefono: '3000000000',
    numeroLicencia: 'LIC123',
    categoriaLicencia: 'C2',
    fechaVencimientoLicencia: '2030-01-01',
    estado: 'DISPONIBLE'
  });

  console.log('\n--- Conductor creado ---');
  console.log(JSON.stringify(conductor, null, 2));

  assert.ok(conductor.licenciaVigente());
  assert.ok(conductor.disponibleParaFecha(new Date()));

  conductor.actualizarContacto('3001112233');
  assert.strictEqual(conductor.telefono, '3001112233');

  conductor.actualizarEstado('EN_RUTA');
  assert.strictEqual(conductor.estado, 'EN_RUTA');
  assert.ok(!conductor.disponibleParaFecha(new Date()));

  console.log('\n--- Conductor después de operaciones ---');
  console.log(JSON.stringify(conductor, null, 2));

  // ---- Mantenimiento ----
  const mantenimiento = new Mantenimiento({
    idMantenimiento: 1,
    vehiculoPlaca: vehiculo.placa,
    tipo: 'PREVENTIVO',
    descripcion: 'Cambio de aceite y revisión general'
  });

  console.log('\n--- Mantenimiento creado ---');
  console.log(JSON.stringify(mantenimiento, null, 2));

  const fechaProg = new Date();
  fechaProg.setDate(fechaProg.getDate() - 1); // ayer

  mantenimiento.programar(fechaProg.toISOString(), 120000, 500000);
  assert.strictEqual(mantenimiento.estado, 'PROGRAMADO');
  assert.ok(mantenimiento.estaAtrasado(new Date()));

  mantenimiento.iniciar();
  assert.strictEqual(mantenimiento.estado, 'EN_PROCESO');

  mantenimiento.completar(520000);
  assert.strictEqual(mantenimiento.estado, 'COMPLETADO');
  assert.strictEqual(mantenimiento.costoReal, 520000);

  console.log('\n--- Mantenimiento después de operaciones ---');
  console.log(JSON.stringify(mantenimiento, null, 2));

  console.log('\n✔ tests de models/organizacion OK');
  console.log('=== FIN TEST models/organizacion ===\n');
})();
