// controllers/organizacion/OrganizacionMemoryStore.js
import {
  Sede,
  Vehiculo,
  Conductor,
  Mantenimiento
} from '../../models/organizacion/index.js';

let nextSedeId = 1;
let nextConductorId = 1;
let nextMantenimientoId = 1;

// Claves:
const sedes = new Map();          // idSede -> Sede
const vehiculos = new Map();      // placa  -> Vehiculo
const conductores = new Map();    // idConductor -> Conductor
const mantenimientos = new Map(); // idMantenimiento -> Mantenimiento

/* ========== SEDES ========== */

export function crearSede(datos) {
  const idSede = nextSedeId++;
  const sede = new Sede({ idSede, ...datos });
  sedes.set(idSede, sede);
  return sede;
}

export function obtenerSede(idSede) {
  return sedes.get(idSede) || null;
}

export function actualizarSede(idSede, datos) {
  const sede = sedes.get(idSede);
  if (!sede) return null;
  Object.assign(sede, datos);
  return sede;
}

export function eliminarSede(idSede) {
  return sedes.delete(idSede);
}

/* ========== VEHÍCULOS (clave: placa) ========== */

export function crearVehiculo(datos) {
  if (!datos.placa) {
    throw new Error('La placa es obligatoria para el vehículo');
  }
  const vehiculo = new Vehiculo({ ...datos });
  vehiculos.set(vehiculo.placa, vehiculo);
  return vehiculo;
}

export function obtenerVehiculo(placa) {
  return vehiculos.get(placa) || null;
}

export function actualizarVehiculo(placa, datos) {
  const vehiculo = vehiculos.get(placa);
  if (!vehiculo) return null;
  Object.assign(vehiculo, datos);
  return vehiculo;
}

export function cambiarEstadoVehiculo(placa, nuevoEstado) {
  const vehiculo = vehiculos.get(placa);
  if (!vehiculo) return null;
  vehiculo.cambiarEstado(nuevoEstado); // usa método de dominio
  return vehiculo;
}

export function actualizarKilometrajeVehiculo(placa, nuevoKm) {
  const vehiculo = vehiculos.get(placa);
  if (!vehiculo) return null;
  vehiculo.actualizarKilometraje(nuevoKm); // respeta validación de no decrecer
  return vehiculo;
}

/* ========== CONDUCTORES ========== */

export function crearConductor(datos) {
  const idConductor = nextConductorId++;
  const conductor = new Conductor({ idConductor, ...datos });
  conductores.set(idConductor, conductor);
  return conductor;
}

export function obtenerConductor(idConductor) {
  return conductores.get(idConductor) || null;
}

export function actualizarConductor(idConductor, datos) {
  const conductor = conductores.get(idConductor);
  if (!conductor) return null;
  Object.assign(conductor, datos);
  return conductor;
}

/* ========== MANTENIMIENTOS ========== */

export function crearMantenimiento(datos) {
  const idMantenimiento = nextMantenimientoId++;
  const mant = new Mantenimiento({
    idMantenimiento,
    ...datos
  });
  // si viene fechaProgramada/km, podrías llamar mant.programar(), pero no es obligatorio
  mantenimientos.set(idMantenimiento, mant);
  return mant;
}

export function obtenerMantenimiento(idMantenimiento) {
  return mantenimientos.get(idMantenimiento) || null;
}

export function actualizarMantenimiento(idMantenimiento, datos) {
  const mant = mantenimientos.get(idMantenimiento);
  if (!mant) return null;
  Object.assign(mant, datos);
  return mant;
}
