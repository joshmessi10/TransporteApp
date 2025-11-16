// controllers/pasajeros/PasajerosMemoryStore.js
import {
  Tiquete,
  ReservaTiquete,
  Equipaje
} from '../../models/pasajeros/index.js';

let nextReservaId = 1;
let nextTiqueteId = 1;
let nextEquipajeId = 1;

const reservas = new Map();       // idReserva -> ReservaTiquete
const tiquetes = new Map();       // idTiquete -> Tiquete
const equipajes = new Map();      // idEquipaje -> Equipaje
const tiquetesPorCliente = new Map(); // idCliente -> idTiquete[]
const equipajesPorTiquete = new Map(); // idTiquete -> idEquipaje[]

/* ========== RESERVAS ========== */

export function crearReserva(datos) {
  const idReserva = nextReservaId++;
  const reserva = new ReservaTiquete({
    idReserva,
    estado: 'ACTIVA',
    fechaCreacion: new Date(),
    ...datos
  });

  reservas.set(idReserva, reserva);
  return reserva;
}

export function obtenerReserva(idReserva) {
  return reservas.get(idReserva) || null;
}

export function cancelarReserva(idReserva) {
  const reserva = reservas.get(idReserva);
  if (!reserva) return null;
  reserva.estado = 'CANCELADA';
  reserva.fechaCancelacion = new Date();
  return reserva;
}

/**
 * Confirma una reserva y crea un tiquete asociado.
 * Retorna { reserva, tiquete }.
 */
export function confirmarReserva(idReserva) {
  const reserva = reservas.get(idReserva);
  if (!reserva) return null;
  if (reserva.estado !== 'ACTIVA') {
    throw new Error('Solo se pueden confirmar reservas activas');
  }

  reserva.estado = 'CONFIRMADA';
  reserva.fechaConfirmacion = new Date();

  const idTiquete = nextTiqueteId++;
  const tiquete = new Tiquete({
    idTiquete,
    idCliente: reserva.idCliente,
    idViaje: reserva.idViaje,
    asiento: reserva.asiento,
    estado: 'VENDIDO',
    fechaCompra: new Date()
  });

  tiquetes.set(idTiquete, tiquete);

  if (!tiquetesPorCliente.has(tiquete.idCliente)) {
    tiquetesPorCliente.set(tiquete.idCliente, []);
  }
  tiquetesPorCliente.get(tiquete.idCliente).push(idTiquete);

  reserva.idTiqueteGenerado = idTiquete;

  return { reserva, tiquete };
}

/* ========== TIQUETES ========== */

export function crearTiquete(datos) {
  const idTiquete = nextTiqueteId++;
  const tiquete = new Tiquete({
    idTiquete,
    estado: 'VENDIDO',
    fechaCompra: new Date(),
    ...datos
  });

  tiquetes.set(idTiquete, tiquete);

  if (tiquete.idCliente != null) {
    if (!tiquetesPorCliente.has(tiquete.idCliente)) {
      tiquetesPorCliente.set(tiquete.idCliente, []);
    }
    tiquetesPorCliente.get(tiquete.idCliente).push(idTiquete);
  }

  return tiquete;
}

export function obtenerTiquete(idTiquete) {
  return tiquetes.get(idTiquete) || null;
}

export function listarTiquetesPorCliente(idCliente) {
  const ids = tiquetesPorCliente.get(idCliente) || [];
  return ids.map((id) => tiquetes.get(id)).filter(Boolean);
}

export function anularTiquete(idTiquete, motivo = 'Sin motivo') {
  const tiquete = tiquetes.get(idTiquete);
  if (!tiquete) return null;

  // si tu modelo Tiquete tiene un método anular(), úsalo
  if (typeof tiquete.anular === 'function') {
    tiquete.anular(motivo);
  } else {
    tiquete.estado = 'ANULADO';
    tiquete.motivoAnulacion = motivo;
    tiquete.fechaAnulacion = new Date();
  }

  return tiquete;
}

export function marcarTiqueteUsado(idTiquete) {
  const tiquete = tiquetes.get(idTiquete);
  if (!tiquete) return null;

  if (typeof tiquete.marcarUsado === 'function') {
    tiquete.marcarUsado();
  } else {
    tiquete.estado = 'USADO';
    tiquete.fechaUso = new Date();
  }

  return tiquete;
}

/* ========== EQUIPAJE ========== */

export function registrarEquipaje(datos) {
  const idEquipaje = nextEquipajeId++;
  const equipaje = new Equipaje({
    idEquipaje,
    ...datos
  });

  equipajes.set(idEquipaje, equipaje);

  if (!equipajesPorTiquete.has(equipaje.idTiquete)) {
    equipajesPorTiquete.set(equipaje.idTiquete, []);
  }
  equipajesPorTiquete.get(equipaje.idTiquete).push(idEquipaje);

  return equipaje;
}

export function obtenerEquipaje(idEquipaje) {
  return equipajes.get(idEquipaje) || null;
}

export function listarEquipajesPorTiquete(idTiquete) {
  const ids = equipajesPorTiquete.get(idTiquete) || [];
  return ids.map((id) => equipajes.get(id)).filter(Boolean);
}

export function eliminarEquipaje(idEquipaje) {
  const equipaje = equipajes.get(idEquipaje);
  if (!equipaje) return false;

  equipajes.delete(idEquipaje);
  const ids = equipajesPorTiquete.get(equipaje.idTiquete) || [];
  equipajesPorTiquete.set(
    equipaje.idTiquete,
    ids.filter((id) => id !== idEquipaje)
  );
  return true;
}
