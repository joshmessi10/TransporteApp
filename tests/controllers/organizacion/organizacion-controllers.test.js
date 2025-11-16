// tests/controllers/organizacion/organizacion-controllers.test.js
import assert from 'assert';
import SedeController from '../../../controllers/organizacion/SedeController.js';
import VehiculoController from '../../../controllers/organizacion/VehiculoController.js';
import ConductorController from '../../../controllers/organizacion/ConductorController.js';
import MantenimientoController from '../../../controllers/organizacion/MantenimientoController.js';

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

(async function testOrganizacionControllers() {
  console.log('=== TEST CONTROLADORES ORGANIZACION ===');

  // 1. Sede
  const resSedeCrear = resMock();
  await SedeController.crear(
    {
      body: {
        nombreSede: 'Sede Central',
        ciudad: 'Bogotá',
        direccion: 'Calle 1 #2-3',
        telefonoContacto: '1234567',
        tipoSede: 'TERMINAL'
      }
    },
    resSedeCrear
  );
  assert.strictEqual(resSedeCrear.statusCode, 201);
  const sede = resSedeCrear.body.sede;
  const idSede = sede.idSede;

  const resSedeGet = resMock();
  await SedeController.obtener({ params: { id: String(idSede) } }, resSedeGet);
  assert.strictEqual(resSedeGet.statusCode, 200);

  // 2. Vehículo (clave = placa)
  const resVehCrear = resMock();
  await VehiculoController.crear(
    {
      body: {
        placa: 'ABC123',
        tipoVehiculo: 'BUS',
        marca: 'MarcaX',
        modelo: 'ModeloY',
        anio: 2020,
        capacidadPasajeros: 40,
        capacidadCargaKg: 1000,
        estadoOperativo: 'ACTIVO',
        kilometrajeActual: 100000,
        sedeActualId: idSede
      }
    },
    resVehCrear
  );
  assert.strictEqual(resVehCrear.statusCode, 201);
  const veh = resVehCrear.body.vehiculo;
  const placa = veh.placa;

  const resVehEstado = resMock();
  await VehiculoController.cambiarEstado(
    { params: { placa }, body: { nuevoEstado: 'MANTENIMIENTO' } },
    resVehEstado
  );
  assert.strictEqual(resVehEstado.statusCode, 200);
  assert.strictEqual(resVehEstado.body.vehiculo.estadoOperativo, 'MANTENIMIENTO');

  const resVehKm = resMock();
  await VehiculoController.actualizarKilometraje(
    { params: { placa }, body: { kilometraje: 101000 } },
    resVehKm
  );
  assert.strictEqual(resVehKm.statusCode, 200);
  assert.strictEqual(resVehKm.body.vehiculo.kilometrajeActual, 101000);

  // 3. Conductor
  const resCondCrear = resMock();
  await ConductorController.crear(
    {
      body: {
        tipoDocumento: 'CC',
        numeroDocumento: '123456789',
        nombreCompleto: 'Conductor Demo',
        telefono: '3000000000',
        numeroLicencia: 'LIC123',
        categoriaLicencia: 'C2',
        fechaVencimientoLicencia: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    resCondCrear
  );
  assert.strictEqual(resCondCrear.statusCode, 201);
  const conductor = resCondCrear.body.conductor;
  const idConductor = conductor.idConductor;

  const resCondGet = resMock();
  await ConductorController.obtener(
    { params: { id: String(idConductor) } },
    resCondGet
  );
  assert.strictEqual(resCondGet.statusCode, 200);

  // 4. Mantenimiento
  const resMantProg = resMock();
  await MantenimientoController.programar(
    {
      body: {
        vehiculoPlaca: placa,
        tipo: 'PREVENTIVO',
        descripcion: 'Cambio de aceite',
        fechaProgramada: new Date().toISOString(),
        kilometrajeProgramado: 102000,
        costoEstimado: 200000
      }
    },
    resMantProg
  );
  assert.strictEqual(resMantProg.statusCode, 201);
  const mant = resMantProg.body.mantenimiento;
  const idMant = mant.idMantenimiento;
  assert.strictEqual(mant.estado, 'PROGRAMADO');

  const resMantIni = resMock();
  await MantenimientoController.iniciar(
    { params: { id: String(idMant) } },
    resMantIni
  );
  assert.strictEqual(resMantIni.statusCode, 200);
  assert.strictEqual(resMantIni.body.mantenimiento.estado, 'EN_PROCESO');

  const resMantFin = resMock();
  await MantenimientoController.finalizar(
    {
      params: { id: String(idMant) },
      body: { costoReal: 210000 }
    },
    resMantFin
  );
  assert.strictEqual(resMantFin.statusCode, 200);
  assert.strictEqual(resMantFin.body.mantenimiento.estado, 'COMPLETADO');

  console.log('✔ CONTROLADORES ORGANIZACION OK\n');
})();
