// controllers/atencion-cliente/AtencionClienteMemoryStore.js
import {
  PQRS,
  Notificacion
} from '../../models/atencion-cliente/index.js';

let nextPqrsId = 1;
let nextNotifId = 1;

const pqrsMap = new Map();        // idPQRS -> PQRS
const notifMap = new Map();       // idNotificacion -> Notificacion
const notifPorUsuario = new Map(); // idUsuario -> idNotificacion[]

/* ========== PQRS ========== */

export function crearPQRS(datos) {
  const idPQRS = nextPqrsId++;

  const pqrs = new PQRS({
    idPQRS,
    estado: 'ABIERTA',
    fechaRegistro: new Date(),
    ...datos
  });

  // Por si el modelo no trae este campo, lo cuelgo aquí
  if (!Array.isArray(pqrs.respuestas)) {
    pqrs.respuestas = [];
  }

  pqrsMap.set(idPQRS, pqrs);
  return pqrs;
}

export function obtenerPQRS(idPQRS) {
  return pqrsMap.get(idPQRS) || null;
}

export function asignarAreaPQRS(idPQRS, areaResponsable) {
  const pqrs = pqrsMap.get(idPQRS);
  if (!pqrs) return null;

  pqrs.areaResponsable = areaResponsable;
  pqrs.estado = 'EN_GESTION';
  pqrs.fechaAsignacion = new Date();
  return pqrs;
}

export function registrarRespuestaPQRS(idPQRS, respuestaTexto, usuarioResponsable) {
  const pqrs = pqrsMap.get(idPQRS);
  if (!pqrs) return null;

  if (!Array.isArray(pqrs.respuestas)) {
    pqrs.respuestas = [];
  }

  const respuesta = {
    fecha: new Date(),
    usuarioResponsable: usuarioResponsable || null,
    texto: respuestaTexto
  };

  pqrs.respuestas.push(respuesta);
  pqrs.ultimaRespuesta = respuesta;
  pqrs.estado = pqrs.estado === 'ABIERTA' ? 'EN_GESTION' : pqrs.estado;

  return pqrs;
}

export function cerrarPQRS(idPQRS, respuestaFinal, usuarioResponsable) {
  const pqrs = pqrsMap.get(idPQRS);
  if (!pqrs) return null;

  registrarRespuestaPQRS(idPQRS, respuestaFinal, usuarioResponsable);
  pqrs.estado = 'CERRADA';
  pqrs.fechaCierre = new Date();
  pqrs.usuarioCierre = usuarioResponsable || null;

  return pqrs;
}

/* ========== NOTIFICACIONES ========== */

export function crearNotificacion({
  idUsuario,
  canal = 'EMAIL',
  tipo,
  titulo,
  mensaje,
  referenciaTipo = null,
  idReferencia = null
}) {
  const idNotificacion = nextNotifId++;

  const notif = new Notificacion({
    idNotificacion,
    idUsuario,
    canal,
    tipo,
    titulo,
    mensaje,
    referenciaTipo,
    idReferencia,
    leida: false,
    fechaEnvio: new Date()
  });

  notifMap.set(idNotificacion, notif);

  if (idUsuario != null) {
    if (!notifPorUsuario.has(idUsuario)) {
      notifPorUsuario.set(idUsuario, []);
    }
    notifPorUsuario.get(idUsuario).push(idNotificacion);
  }

  return notif;
}

export function obtenerNotificacion(idNotificacion) {
  return notifMap.get(idNotificacion) || null;
}

export function listarNotificacionesUsuario(idUsuario) {
  const ids = notifPorUsuario.get(idUsuario) || [];
  return ids.map((id) => notifMap.get(id)).filter(Boolean);
}

export function marcarNotificacionLeida(idNotificacion) {
  const notif = notifMap.get(idNotificacion);
  if (!notif) return null;
  notif.leida = true;
  notif.fechaLectura = new Date();
  return notif;
}
