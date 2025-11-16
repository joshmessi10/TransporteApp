// controllers/rutas-viajes/RutasViajesMemoryStore.js
import { Ruta, Viaje } from '../../models/rutas-viajes/index.js';

let nextRutaId = 1;
let nextViajeId = 1;

const rutas = new Map();
const viajes = new Map();

/* ========== RUTAS ========== */

export function crearRuta(datos) {
  const idRuta = nextRutaId++;
  const ruta = new Ruta({ idRuta, activa: true, ...datos });
  rutas.set(idRuta, ruta);
  return ruta;
}

export function obtenerRuta(idRuta) {
  return rutas.get(idRuta) || null;
}

export function actualizarRuta(idRuta, datos) {
  const ruta = rutas.get(idRuta);
  if (!ruta) return null;
  Object.assign(ruta, datos);
  return ruta;
}

export function activarRuta(idRuta) {
  const ruta = rutas.get(idRuta);
  if (!ruta) return null;
  ruta.activa = true;
  return ruta;
}

export function inactivarRuta(idRuta) {
  const ruta = rutas.get(idRuta);
  if (!ruta) return null;
  ruta.activa = false;
  return ruta;
}

/* ========== VIAJES (State en modelo) ========== */

export function crearViaje(datos) {
  const idViaje = nextViajeId++;
  const viaje = new Viaje({ idViaje, ...datos });
  viajes.set(idViaje, viaje);
  return viaje;
}

export function obtenerViaje(idViaje) {
  return viajes.get(idViaje) || null;
}

export function actualizarViaje(idViaje, datos) {
  const viaje = viajes.get(idViaje);
  if (!viaje) return null;
  Object.assign(viaje, datos);
  return viaje;
}
